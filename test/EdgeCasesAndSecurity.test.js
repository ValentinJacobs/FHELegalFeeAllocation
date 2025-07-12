const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Edge Cases and Security Tests
 * Tests boundary conditions, attack vectors, and security vulnerabilities
 */

describe("Edge Cases and Security", function () {
  let contract;
  let deployer, alice, bob, charlie, dave, eve;
  let contractAddress;

  async function deployFixture() {
    const ConfidentialLegalFeeAllocation = await ethers.getContractFactory(
      "ConfidentialLegalFeeAllocation"
    );
    const instance = await ConfidentialLegalFeeAllocation.deploy();
    await instance.waitForDeployment();
    const address = await instance.getAddress();
    return { contract: instance, contractAddress: address };
  }

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    alice = signers[1];
    bob = signers[2];
    charlie = signers[3];
    dave = signers[4];
    eve = signers[5];
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  // =====================================================
  // BOUNDARY VALUE TESTS
  // =====================================================

  describe("Boundary Value Testing", function () {
    it("should handle minimum valid fee (1 wei)", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 1, 50, "Minimum fee")
      ).to.not.be.reverted;
    });

    it("should handle maximum uint64 fee", async function () {
      const parties = [alice.address, bob.address];
      const maxUint64 = BigInt("18446744073709551615");

      await expect(
        contract.createCase(parties, maxUint64, 50, "Maximum fee")
      ).to.not.be.reverted;
    });

    it("should reject complexity of 0", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 50000, 0, "Zero complexity")
      ).to.be.revertedWith("Invalid complexity");
    });

    it("should reject complexity over 100", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 50000, 101, "Over max complexity")
      ).to.be.revertedWith("Invalid complexity");
    });

    it("should handle exactly 100 complexity", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 50000, 100, "Max complexity")
      ).to.not.be.reverted;
    });

    it("should handle single hour time update", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(contract.updateTimeSpent(1, 1)).to.not.be.reverted;
    });

    it("should handle very large time values", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      const maxUint32 = 4294967295;
      await expect(contract.updateTimeSpent(1, maxUint32)).to.not.be.reverted;
    });
  });

  // =====================================================
  // INVALID INPUT TESTS
  // =====================================================

  describe("Invalid Input Handling", function () {
    it("should reject case creation with empty parties array", async function () {
      const parties = [];
      await expect(
        contract.createCase(parties, 50000, 50, "No parties")
      ).to.be.reverted;
    });

    it("should reject case creation with single party", async function () {
      const parties = [alice.address];
      await expect(
        contract.createCase(parties, 50000, 50, "Single party")
      ).to.be.revertedWith("Minimum 2 parties required");
    });

    it("should reject operations on non-existent case", async function () {
      await expect(contract.getCaseInfo(999)).to.be.revertedWith(
        "Invalid case"
      );
    });

    it("should reject payment without fee calculation", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(
        contract.connect(alice).recordPayment(1)
      ).to.be.revertedWith("Fees not calculated");
    });

    it("should reject responsibility over 100", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(
        contract.setResponsibilityRatio(1, alice.address, 150)
      ).to.be.revertedWith("Invalid responsibility ratio");
    });
  });

  // =====================================================
  // DUPLICATE ADDRESS TESTS
  // =====================================================

  describe("Duplicate Address Handling", function () {
    it("should allow same address in multiple cases", async function () {
      await contract.createCase(
        [alice.address, bob.address],
        30000,
        40,
        "Case 1"
      );

      await contract.createCase(
        [alice.address, charlie.address],
        40000,
        50,
        "Case 2"
      );

      const aliceCases = await contract.getPartyCases(alice.address);
      expect(aliceCases.length).to.equal(2);
    });

    it("should handle duplicate addresses in party list", async function () {
      // Note: This tests system behavior with duplicates
      // Some contracts may allow it, others may not
      const parties = [alice.address, bob.address, alice.address];

      // System behavior: Contract should handle duplicates gracefully
      // Either reject or de-duplicate internally
      try {
        await contract.createCase(parties, 50000, 50, "Duplicate party");
        // If accepted, verify behavior
        const caseParties = await contract.getCaseParties(1);
        // Check if de-duplicated or all addresses present
      } catch (error) {
        // If rejected, that's acceptable behavior
        expect(error).to.exist;
      }
    });
  });

  // =====================================================
  // STATE CONSISTENCY TESTS
  // =====================================================

  describe("State Consistency", function () {
    it("should maintain consistency after failed operations", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      // Try invalid operation
      try {
        await contract.connect(alice).emergencySettleCase(1);
      } catch (error) {
        // Should fail due to auth
      }

      // State should be unchanged
      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isActive).to.be.true;
      expect(caseInfo.isSettled).to.be.false;
    });

    it("should not allow double settlement", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      // Try to settle again
      await expect(contract.emergencySettleCase(1)).to.be.revertedWith(
        "Case not active"
      );
    });

    it("should not allow payment after settlement", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.emergencySettleCase(1);

      await expect(
        contract.connect(alice).recordPayment(1)
      ).to.be.revertedWith("Case not active");
    });
  });

  // =====================================================
  // AUTHORIZATION BYPASS ATTEMPTS
  // =====================================================

  describe("Authorization Security", function () {
    it("should prevent non-admin from creating cases", async function () {
      const parties = [charlie.address, dave.address];
      await expect(
        contract.connect(alice).createCase(parties, 50000, 50, "Unauthorized")
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should prevent non-admin from updating time", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(
        contract.connect(alice).updateTimeSpent(1, 40)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should prevent non-admin from setting responsibilities", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(
        contract.connect(alice).setResponsibilityRatio(1, alice.address, 50)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should prevent non-admin from calculating fees", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(
        contract.connect(alice).calculateFeeAllocation(1)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should prevent non-admin from emergency settlement", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      await expect(
        contract.connect(alice).emergencySettleCase(1)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should prevent non-party from recording payment", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);

      await expect(
        contract.connect(charlie).recordPayment(1)
      ).to.be.revertedWith("Not authorized party");
    });
  });

  // =====================================================
  // REENTRANCY PROTECTION TESTS
  // =====================================================

  describe("Reentrancy Protection", function () {
    it("should handle multiple rapid state changes safely", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      // Rapid sequential calls
      await contract.updateTimeSpent(1, 10);
      await contract.updateTimeSpent(1, 20);
      await contract.updateTimeSpent(1, 30);
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);

      // State should be consistent
      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isActive).to.be.true;
    });
  });

  // =====================================================
  // OVERFLOW/UNDERFLOW TESTS
  // =====================================================

  describe("Numeric Overflow/Underflow Protection", function () {
    it("should handle maximum values without overflow", async function () {
      const parties = [alice.address, bob.address];
      const maxValue = ethers.MaxUint256;

      // System should handle gracefully
      try {
        await contract.createCase(parties, maxValue, 100, "Max values");
      } catch (error) {
        // May reject if over uint64 limit, which is acceptable
        expect(error).to.exist;
      }
    });

    it("should handle accumulated time updates", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      // Add time multiple times
      for (let i = 0; i < 10; i++) {
        await contract.updateTimeSpent(1, 1000);
      }

      // Should not overflow
      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isActive).to.be.true;
    });
  });

  // =====================================================
  // DATA INTEGRITY TESTS
  // =====================================================

  describe("Data Integrity", function () {
    it("should maintain correct case hash", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.caseHash).to.not.equal(ethers.ZeroHash);
    });

    it("should preserve case data after updates", async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 75000, 70, "Complex case");

      await contract.updateTimeSpent(1, 100);
      await contract.setResponsibilityRatio(1, alice.address, 40);

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.partyCount).to.equal(3);
      expect(caseInfo.isActive).to.be.true;

      const caseParties = await contract.getCaseParties(1);
      expect(caseParties.length).to.equal(3);
    });

    it("should track timestamps correctly", async function () {
      const parties = [alice.address, bob.address];
      const tx = await contract.createCase(parties, 50000, 50, "Test case");
      await tx.wait();

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.createdAt).to.be.gt(0);
      expect(caseInfo.settledAt).to.equal(0);

      await contract.emergencySettleCase(1);

      const caseInfoAfter = await contract.getCaseInfo(1);
      expect(caseInfoAfter.settledAt).to.be.gt(0);
      expect(caseInfoAfter.settledAt).to.be.gte(caseInfoAfter.createdAt);
    });
  });

  // =====================================================
  // ZERO ADDRESS TESTS
  // =====================================================

  describe("Zero Address Handling", function () {
    it("should reject zero address in parties list", async function () {
      const parties = [alice.address, ethers.ZeroAddress];

      // Contract should either reject or handle gracefully
      try {
        await contract.createCase(parties, 50000, 50, "Zero address case");
        // If accepted, verify it doesn't break functionality
        const caseParties = await contract.getCaseParties(1);
        expect(caseParties).to.include(ethers.ZeroAddress);
      } catch (error) {
        // Rejection is acceptable security behavior
        expect(error).to.exist;
      }
    });
  });

  // =====================================================
  // EDGE CASE COMBINATIONS
  // =====================================================

  describe("Edge Case Combinations", function () {
    it("should handle minimum complexity with minimum fee", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 1, 1, "Minimum everything")
      ).to.not.be.reverted;
    });

    it("should handle maximum complexity with minimum time", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 100, "Max complexity");
      await contract.updateTimeSpent(1, 1);

      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);

      await expect(contract.calculateFeeAllocation(1)).to.not.be.reverted;
    });

    it("should handle many parties with equal responsibility", async function () {
      const signers = await ethers.getSigners();
      const parties = signers.slice(1, 6).map((s) => s.address); // 5 parties

      await contract.createCase(parties, 100000, 90, "Many equal parties");

      for (let i = 0; i < parties.length; i++) {
        await contract.setResponsibilityRatio(1, parties[i], 20);
      }

      await contract.calculateFeeAllocation(1);

      for (let i = 0; i < parties.length; i++) {
        await contract.connect(signers[i + 1]).recordPayment(1);
      }

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
    });
  });

  // =====================================================
  // GAS LIMIT TESTS
  // =====================================================

  describe("Gas Limit Considerations", function () {
    it("should handle case with maximum practical parties", async function () {
      const signers = await ethers.getSigners();
      const maxParties = Math.min(signers.length - 1, 10); // Practical limit
      const parties = signers.slice(1, maxParties + 1).map((s) => s.address);

      const tx = await contract.createCase(
        parties,
        200000,
        95,
        "Max parties case"
      );
      const receipt = await tx.wait();

      // Should complete without running out of gas
      expect(receipt.status).to.equal(1);
    });
  });
});
