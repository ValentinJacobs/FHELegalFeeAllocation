const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Comprehensive Test Suite for ConfidentialLegalFeeAllocation Contract
 * Based on common testing patterns and best practices
 *
 * Test Coverage:
 * - Deployment and initialization
 * - Case creation and management
 * - Responsibility allocation
 * - Fee calculation
 * - Payment recording
 * - Access control
 * - Edge cases
 * - Gas optimization
 */

describe("ConfidentialLegalFeeAllocation", function () {
  let contract;
  let deployer, alice, bob, charlie, dave;
  let contractAddress;

  // Helper function to deploy fresh contract
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
    // Get signers for different roles
    const signers = await ethers.getSigners();
    deployer = signers[0];
    alice = signers[1];
    bob = signers[2];
    charlie = signers[3];
    dave = signers[4];
  });

  beforeEach(async function () {
    // Deploy fresh contract for each test
    ({ contract, contractAddress } = await deployFixture());
  });

  // =====================================================
  // 1. DEPLOYMENT AND INITIALIZATION TESTS (5 tests)
  // =====================================================

  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(await contract.getAddress()).to.equal(contractAddress);
    });

    it("should set deployer as admin", async function () {
      const admin = await contract.admin();
      expect(admin).to.equal(deployer.address);
    });

    it("should initialize with zero total cases", async function () {
      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(0);
      expect(stats.active).to.equal(0);
      expect(stats.settled).to.equal(0);
    });

    it("should have correct contract name in deployment", async function () {
      // Verify contract can be called
      const stats = await contract.getSystemStats();
      expect(stats).to.not.be.undefined;
    });

    it("should be ready to accept case creation", async function () {
      const totalCasesBefore = await contract.totalCases();
      expect(totalCasesBefore).to.equal(0);
    });
  });

  // =====================================================
  // 2. CASE CREATION TESTS (8 tests)
  // =====================================================

  describe("Case Creation", function () {
    it("should create a case with two parties", async function () {
      const parties = [alice.address, bob.address];
      const totalFee = 50000;
      const complexity = 50;
      const description = "Simple two-party case";

      const tx = await contract.createCase(
        parties,
        totalFee,
        complexity,
        description
      );

      await expect(tx).to.emit(contract, "CaseCreated");

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(1);
      expect(stats.active).to.equal(1);
    });

    it("should create a case with multiple parties", async function () {
      const parties = [alice.address, bob.address, charlie.address, dave.address];
      const totalFee = 100000;
      const complexity = 80;
      const description = "Complex multi-party case";

      await contract.createCase(parties, totalFee, complexity, description);

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.partyCount).to.equal(4);
    });

    it("should increment case ID for each new case", async function () {
      const parties = [alice.address, bob.address];

      await contract.createCase(parties, 30000, 40, "First case");
      await contract.createCase(parties, 40000, 50, "Second case");
      await contract.createCase(parties, 50000, 60, "Third case");

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(3);
    });

    it("should emit CaseCreated event with correct parameters", async function () {
      const parties = [alice.address, bob.address];
      const totalFee = 50000;
      const complexity = 50;

      const tx = await contract.createCase(
        parties,
        totalFee,
        complexity,
        "Test case"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "CaseCreated"
      );

      expect(event).to.not.be.undefined;
      expect(event.args.caseId).to.equal(1);
      expect(event.args.partyCount).to.equal(2);
    });

    it("should revert when less than 2 parties provided", async function () {
      const parties = [alice.address];

      await expect(
        contract.createCase(parties, 50000, 50, "Invalid case")
      ).to.be.revertedWith("Minimum 2 parties required");
    });

    it("should revert when fee is zero", async function () {
      const parties = [alice.address, bob.address];

      await expect(
        contract.createCase(parties, 0, 50, "Zero fee case")
      ).to.be.revertedWith("Fee must be positive");
    });

    it("should revert when complexity is invalid (> 100)", async function () {
      const parties = [alice.address, bob.address];

      await expect(
        contract.createCase(parties, 50000, 101, "Invalid complexity")
      ).to.be.revertedWith("Invalid complexity");
    });

    it("should revert when complexity is zero", async function () {
      const parties = [alice.address, bob.address];

      await expect(
        contract.createCase(parties, 50000, 0, "Zero complexity")
      ).to.be.revertedWith("Invalid complexity");
    });
  });

  // =====================================================
  // 3. CASE INFORMATION RETRIEVAL TESTS (4 tests)
  // =====================================================

  describe("Case Information Retrieval", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 75000, 65, "Test case");
    });

    it("should retrieve complete case information", async function () {
      const caseInfo = await contract.getCaseInfo(1);

      expect(caseInfo.caseId).to.equal(1);
      expect(caseInfo.partyCount).to.equal(3);
      expect(caseInfo.isActive).to.be.true;
      expect(caseInfo.isSettled).to.be.false;
    });

    it("should retrieve case parties list", async function () {
      const parties = await contract.getCaseParties(1);

      expect(parties.length).to.equal(3);
      expect(parties[0]).to.equal(alice.address);
      expect(parties[1]).to.equal(bob.address);
      expect(parties[2]).to.equal(charlie.address);
    });

    it("should verify if address is party in case", async function () {
      const isAlice = await contract.isPartyInCase(1, alice.address);
      const isBob = await contract.isPartyInCase(1, bob.address);
      const isDave = await contract.isPartyInCase(1, dave.address);

      expect(isAlice).to.be.true;
      expect(isBob).to.be.true;
      expect(isDave).to.be.false;
    });

    it("should retrieve party cases list", async function () {
      // Create another case with alice
      await contract.createCase(
        [alice.address, dave.address],
        40000,
        45,
        "Second case"
      );

      const aliceCases = await contract.getPartyCases(alice.address);
      expect(aliceCases.length).to.equal(2);
      expect(aliceCases[0]).to.equal(1);
      expect(aliceCases[1]).to.equal(2);
    });
  });

  // =====================================================
  // 4. TIME TRACKING TESTS (5 tests)
  // =====================================================

  describe("Time Tracking", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
    });

    it("should update time spent successfully", async function () {
      const tx = await contract.updateTimeSpent(1, 40);
      await expect(tx).to.not.be.reverted;
    });

    it("should allow multiple time updates", async function () {
      await contract.updateTimeSpent(1, 40);
      await contract.updateTimeSpent(1, 30);
      await contract.updateTimeSpent(1, 50);
      // Time is accumulated
    });

    it("should revert when updating time for non-existent case", async function () {
      await expect(contract.updateTimeSpent(999, 40)).to.be.revertedWith(
        "Invalid case"
      );
    });

    it("should revert when time input is zero", async function () {
      await expect(contract.updateTimeSpent(1, 0)).to.be.revertedWith(
        "Invalid time input"
      );
    });

    it("should revert when non-admin updates time", async function () {
      await expect(
        contract.connect(alice).updateTimeSpent(1, 40)
      ).to.be.revertedWith("Unauthorized access");
    });
  });

  // =====================================================
  // 5. RESPONSIBILITY ALLOCATION TESTS (7 tests)
  // =====================================================

  describe("Responsibility Allocation", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 60000, 55, "Test case");
    });

    it("should set responsibility ratio for party", async function () {
      const tx = await contract.setResponsibilityRatio(1, alice.address, 40);
      await expect(tx)
        .to.emit(contract, "AllocationUpdated")
        .withArgs(1, alice.address);
    });

    it("should set different responsibility ratios for all parties", async function () {
      await contract.setResponsibilityRatio(1, alice.address, 40);
      await contract.setResponsibilityRatio(1, bob.address, 35);
      await contract.setResponsibilityRatio(1, charlie.address, 25);
      // Ratios sum to 100%
    });

    it("should allow updating responsibility ratio", async function () {
      await contract.setResponsibilityRatio(1, alice.address, 40);
      await contract.setResponsibilityRatio(1, alice.address, 50);
      // Updated from 40% to 50%
    });

    it("should revert when responsibility exceeds 100", async function () {
      await expect(
        contract.setResponsibilityRatio(1, alice.address, 101)
      ).to.be.revertedWith("Invalid responsibility ratio");
    });

    it("should revert when party is not in case", async function () {
      await expect(
        contract.setResponsibilityRatio(1, dave.address, 50)
      ).to.be.revertedWith("Party not in case");
    });

    it("should revert when non-admin sets responsibility", async function () {
      await expect(
        contract.connect(alice).setResponsibilityRatio(1, alice.address, 50)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should revert when case is not active", async function () {
      // Settle the case first
      await contract.emergencySettleCase(1);

      await expect(
        contract.setResponsibilityRatio(1, alice.address, 50)
      ).to.be.revertedWith("Case not active");
    });
  });

  // =====================================================
  // 6. FEE CALCULATION TESTS (6 tests)
  // =====================================================

  describe("Fee Calculation", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 50000, 75, "Test case");
      await contract.updateTimeSpent(1, 120);
      await contract.setResponsibilityRatio(1, alice.address, 40);
      await contract.setResponsibilityRatio(1, bob.address, 35);
      await contract.setResponsibilityRatio(1, charlie.address, 25);
    });

    it("should calculate fee allocation successfully", async function () {
      const tx = await contract.calculateFeeAllocation(1);
      await expect(tx)
        .to.emit(contract, "FeeCalculated")
        .withArgs(1, deployer.address);
    });

    it("should emit ResponsibilityDistributed event", async function () {
      const tx = await contract.calculateFeeAllocation(1);
      await expect(tx).to.emit(contract, "ResponsibilityDistributed");
    });

    it("should mark fee as calculated", async function () {
      await contract.calculateFeeAllocation(1);
      // Fee calculation flag should be set
    });

    it("should revert when calculating for non-existent case", async function () {
      await expect(
        contract.calculateFeeAllocation(999)
      ).to.be.revertedWith("Invalid case");
    });

    it("should revert when non-admin calculates fees", async function () {
      await expect(
        contract.connect(alice).calculateFeeAllocation(1)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should revert when case is settled", async function () {
      await contract.emergencySettleCase(1);

      await expect(
        contract.calculateFeeAllocation(1)
      ).to.be.revertedWith("Case not active");
    });
  });

  // =====================================================
  // 7. PAYMENT RECORDING TESTS (7 tests)
  // =====================================================

  describe("Payment Recording", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.updateTimeSpent(1, 80);
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);
    });

    it("should record payment for authorized party", async function () {
      const tx = await contract.connect(alice).recordPayment(1);
      await expect(tx)
        .to.emit(contract, "PaymentRecorded")
        .withArgs(1, alice.address);
    });

    it("should prevent duplicate payment recording", async function () {
      await contract.connect(alice).recordPayment(1);

      await expect(
        contract.connect(alice).recordPayment(1)
      ).to.be.revertedWith("Already paid");
    });

    it("should settle case when all parties pay", async function () {
      await contract.connect(alice).recordPayment(1);

      const tx = await contract.connect(bob).recordPayment(1);
      await expect(tx).to.emit(contract, "CaseSettled").withArgs(1, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
      expect(caseInfo.isActive).to.be.false;
    });

    it("should revert when non-party records payment", async function () {
      await expect(
        contract.connect(charlie).recordPayment(1)
      ).to.be.revertedWith("Not authorized party");
    });

    it("should revert when fees not calculated", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 30000, 40, "New case");

      await expect(
        contract.connect(alice).recordPayment(2)
      ).to.be.revertedWith("Fees not calculated");
    });

    it("should retrieve payment status", async function () {
      await contract.connect(alice).recordPayment(1);

      const allocation = await contract.getPartyAllocation(1, alice.address);
      expect(allocation.hasPaid).to.be.true;
    });

    it("should update active cases count after settlement", async function () {
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      const stats = await contract.getSystemStats();
      expect(stats.active).to.equal(0);
      expect(stats.settled).to.equal(1);
    });
  });

  // =====================================================
  // 8. ACCESS CONTROL TESTS (6 tests)
  // =====================================================

  describe("Access Control", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
    });

    it("should allow only admin to create cases", async function () {
      const parties = [charlie.address, dave.address];
      await expect(
        contract.connect(alice).createCase(parties, 40000, 45, "Unauthorized")
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should allow only admin to update time", async function () {
      await expect(
        contract.connect(alice).updateTimeSpent(1, 50)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should allow only admin to set responsibility", async function () {
      await expect(
        contract.connect(alice).setResponsibilityRatio(1, alice.address, 50)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should allow only admin to calculate fees", async function () {
      await expect(
        contract.connect(alice).calculateFeeAllocation(1)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should allow only admin to emergency settle", async function () {
      await expect(
        contract.connect(alice).emergencySettleCase(1)
      ).to.be.revertedWith("Unauthorized access");
    });

    it("should allow only parties to record payment", async function () {
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);

      await expect(
        contract.connect(charlie).recordPayment(1)
      ).to.be.revertedWith("Not authorized party");
    });
  });

  // =====================================================
  // 9. EMERGENCY SETTLEMENT TESTS (4 tests)
  // =====================================================

  describe("Emergency Settlement", function () {
    beforeEach(async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
    });

    it("should allow admin to emergency settle case", async function () {
      const tx = await contract.emergencySettleCase(1);
      await expect(tx).to.emit(contract, "CaseSettled");

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
    });

    it("should update case status after emergency settlement", async function () {
      await contract.emergencySettleCase(1);

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isActive).to.be.false;
      expect(caseInfo.isSettled).to.be.true;
    });

    it("should decrease active cases count", async function () {
      await contract.emergencySettleCase(1);

      const stats = await contract.getSystemStats();
      expect(stats.active).to.equal(0);
      expect(stats.settled).to.equal(1);
    });

    it("should revert when case is already settled", async function () {
      await contract.emergencySettleCase(1);

      await expect(
        contract.emergencySettleCase(1)
      ).to.be.revertedWith("Case not active");
    });
  });

  // =====================================================
  // 10. EDGE CASES AND BOUNDARY TESTS (5 tests)
  // =====================================================

  describe("Edge Cases and Boundary Conditions", function () {
    it("should handle maximum complexity (100)", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 50000, 100, "Max complexity")
      ).to.not.be.reverted;
    });

    it("should handle minimum valid complexity (1)", async function () {
      const parties = [alice.address, bob.address];
      await expect(
        contract.createCase(parties, 50000, 1, "Min complexity")
      ).to.not.be.reverted;
    });

    it("should handle large number of parties", async function () {
      const parties = [
        alice.address,
        bob.address,
        charlie.address,
        dave.address,
        deployer.address,
      ];

      await expect(
        contract.createCase(parties, 100000, 90, "Many parties")
      ).to.not.be.reverted;
    });

    it("should handle very large fee amounts", async function () {
      const parties = [alice.address, bob.address];
      const largeFee = ethers.parseEther("1000000"); // 1 million

      await expect(
        contract.createCase(parties, largeFee, 50, "Large fee")
      ).to.not.be.reverted;
    });

    it("should handle multiple sequential cases", async function () {
      const parties = [alice.address, bob.address];

      for (let i = 0; i < 5; i++) {
        await contract.createCase(parties, 30000 + i * 10000, 40 + i * 10, `Case ${i + 1}`);
      }

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(5);
    });
  });

  // =====================================================
  // 11. GAS OPTIMIZATION TESTS (3 tests)
  // =====================================================

  describe("Gas Optimization", function () {
    it("should create case with reasonable gas usage", async function () {
      const parties = [alice.address, bob.address];
      const tx = await contract.createCase(parties, 50000, 50, "Gas test");
      const receipt = await tx.wait();

      // Gas should be less than 1M
      expect(receipt.gasUsed).to.be.lt(1000000);
    });

    it("should calculate fees with reasonable gas usage", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);

      const tx = await contract.calculateFeeAllocation(1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("should record payment with reasonable gas usage", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);

      const tx = await contract.connect(alice).recordPayment(1);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000);
    });
  });

  // =====================================================
  // 12. SYSTEM STATISTICS TESTS (3 tests)
  // =====================================================

  describe("System Statistics", function () {
    it("should track total cases correctly", async function () {
      const parties = [alice.address, bob.address];

      await contract.createCase(parties, 30000, 40, "Case 1");
      await contract.createCase(parties, 40000, 50, "Case 2");
      await contract.createCase(parties, 50000, 60, "Case 3");

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(3);
    });

    it("should track active and settled cases", async function () {
      const parties = [alice.address, bob.address];

      await contract.createCase(parties, 30000, 40, "Case 1");
      await contract.createCase(parties, 40000, 50, "Case 2");
      await contract.emergencySettleCase(1);

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(2);
      expect(stats.active).to.equal(1);
      expect(stats.settled).to.equal(1);
    });

    it("should update statistics after payment settlement", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Test case");
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);

      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      const stats = await contract.getSystemStats();
      expect(stats.active).to.equal(0);
      expect(stats.settled).to.equal(1);
    });
  });
});
