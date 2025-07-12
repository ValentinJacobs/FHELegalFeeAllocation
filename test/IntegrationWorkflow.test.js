const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Integration Tests for Complete Workflows
 * Tests end-to-end scenarios simulating real-world usage
 */

describe("Integration Workflows", function () {
  let contract;
  let deployer, alice, bob, charlie, dave;
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
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  // =====================================================
  // WORKFLOW 1: Simple Two-Party Case (Complete Flow)
  // =====================================================

  describe("Workflow 1: Simple Two-Party Case", function () {
    it("should complete full lifecycle from creation to settlement", async function () {
      // Step 1: Create case
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 50000, 50, "Simple contract dispute");

      let stats = await contract.getSystemStats();
      expect(stats.total).to.equal(1);
      expect(stats.active).to.equal(1);

      // Step 2: Update time spent
      await contract.updateTimeSpent(1, 80);

      // Step 3: Set equal responsibility
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);

      // Step 4: Calculate fees
      await contract.calculateFeeAllocation(1);

      // Step 5: Both parties pay
      await contract.connect(alice).recordPayment(1);
      const tx = await contract.connect(bob).recordPayment(1);

      // Step 6: Verify case settled
      await expect(tx).to.emit(contract, "CaseSettled");

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
      expect(caseInfo.isActive).to.be.false;

      stats = await contract.getSystemStats();
      expect(stats.active).to.equal(0);
      expect(stats.settled).to.equal(1);
    });

    it("should handle partial payment correctly", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 40000, 45, "Partial payment case");

      await contract.setResponsibilityRatio(1, alice.address, 60);
      await contract.setResponsibilityRatio(1, bob.address, 40);
      await contract.calculateFeeAllocation(1);

      // Only alice pays
      await contract.connect(alice).recordPayment(1);

      // Case should still be active
      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isActive).to.be.true;
      expect(caseInfo.isSettled).to.be.false;

      const stats = await contract.getSystemStats();
      expect(stats.active).to.equal(1);
    });
  });

  // =====================================================
  // WORKFLOW 2: Complex Multi-Party Case
  // =====================================================

  describe("Workflow 2: Complex Multi-Party Case", function () {
    it("should handle four-party case with variable responsibilities", async function () {
      // Step 1: Create complex case
      const parties = [alice.address, bob.address, charlie.address, dave.address];
      await contract.createCase(
        parties,
        150000,
        90,
        "Complex corporate merger dispute"
      );

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.partyCount).to.equal(4);

      // Step 2: Add significant time
      await contract.updateTimeSpent(1, 300);

      // Step 3: Set different responsibility levels
      await contract.setResponsibilityRatio(1, alice.address, 40); // Primary defendant
      await contract.setResponsibilityRatio(1, bob.address, 30);   // Secondary
      await contract.setResponsibilityRatio(1, charlie.address, 20); // Minor
      await contract.setResponsibilityRatio(1, dave.address, 10);  // Minimal

      // Step 4: Calculate fees
      await contract.calculateFeeAllocation(1);

      // Step 5: Record payments sequentially
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);
      await contract.connect(charlie).recordPayment(1);

      // Case still active (dave hasn't paid)
      let stats = await contract.getSystemStats();
      expect(stats.active).to.equal(1);

      // Dave pays, case settles
      const tx = await contract.connect(dave).recordPayment(1);
      await expect(tx).to.emit(contract, "CaseSettled");

      stats = await contract.getSystemStats();
      expect(stats.settled).to.equal(1);
    });

    it("should track individual payment statuses correctly", async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 75000, 70, "Three-party case");

      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 30);
      await contract.setResponsibilityRatio(1, charlie.address, 20);
      await contract.calculateFeeAllocation(1);

      // Alice and Bob pay
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      // Check payment statuses
      const aliceAllocation = await contract.getPartyAllocation(1, alice.address);
      const bobAllocation = await contract.getPartyAllocation(1, bob.address);
      const charlieAllocation = await contract.getPartyAllocation(1, charlie.address);

      expect(aliceAllocation.hasPaid).to.be.true;
      expect(bobAllocation.hasPaid).to.be.true;
      expect(charlieAllocation.hasPaid).to.be.false;
    });
  });

  // =====================================================
  // WORKFLOW 3: Emergency Settlement Scenario
  // =====================================================

  describe("Workflow 3: Emergency Settlement", function () {
    it("should allow emergency settlement before payment completion", async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 60000, 65, "Emergency case");

      await contract.setResponsibilityRatio(1, alice.address, 40);
      await contract.setResponsibilityRatio(1, bob.address, 35);
      await contract.setResponsibilityRatio(1, charlie.address, 25);
      await contract.calculateFeeAllocation(1);

      // Only one party pays
      await contract.connect(alice).recordPayment(1);

      // Admin forces settlement
      const tx = await contract.emergencySettleCase(1);
      await expect(tx).to.emit(contract, "CaseSettled");

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;

      const stats = await contract.getSystemStats();
      expect(stats.active).to.equal(0);
      expect(stats.settled).to.equal(1);
    });

    it("should handle emergency settlement without any payments", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 45000, 55, "Immediate settlement");

      // Emergency settle without any fee calculation
      await contract.emergencySettleCase(1);

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
      expect(caseInfo.settledAt).to.be.gt(0);
    });
  });

  // =====================================================
  // WORKFLOW 4: Multiple Concurrent Cases
  // =====================================================

  describe("Workflow 4: Multiple Concurrent Cases", function () {
    it("should manage multiple cases independently", async function () {
      // Create three different cases
      await contract.createCase(
        [alice.address, bob.address],
        30000,
        40,
        "Case 1"
      );

      await contract.createCase(
        [bob.address, charlie.address],
        45000,
        60,
        "Case 2"
      );

      await contract.createCase(
        [alice.address, charlie.address, dave.address],
        75000,
        80,
        "Case 3"
      );

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(3);
      expect(stats.active).to.equal(3);

      // Complete first case
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      // Emergency settle second case
      await contract.emergencySettleCase(2);

      // Third case remains active
      const stats2 = await contract.getSystemStats();
      expect(stats2.total).to.equal(3);
      expect(stats2.active).to.equal(1);
      expect(stats2.settled).to.equal(2);

      // Verify specific case statuses
      const case1 = await contract.getCaseInfo(1);
      const case2 = await contract.getCaseInfo(2);
      const case3 = await contract.getCaseInfo(3);

      expect(case1.isSettled).to.be.true;
      expect(case2.isSettled).to.be.true;
      expect(case3.isSettled).to.be.false;
      expect(case3.isActive).to.be.true;
    });

    it("should track party participation across multiple cases", async function () {
      // Alice participates in multiple cases
      await contract.createCase([alice.address, bob.address], 30000, 40, "Case 1");
      await contract.createCase([alice.address, charlie.address], 40000, 50, "Case 2");
      await contract.createCase([alice.address, dave.address], 50000, 60, "Case 3");

      const aliceCases = await contract.getPartyCases(alice.address);
      expect(aliceCases.length).to.equal(3);
      expect(aliceCases[0]).to.equal(1);
      expect(aliceCases[1]).to.equal(2);
      expect(aliceCases[2]).to.equal(3);

      const bobCases = await contract.getPartyCases(bob.address);
      expect(bobCases.length).to.equal(1);
    });
  });

  // =====================================================
  // WORKFLOW 5: Time-Intensive Case
  // =====================================================

  describe("Workflow 5: Time-Intensive Case", function () {
    it("should handle multiple time updates throughout case lifecycle", async function () {
      const parties = [alice.address, bob.address];
      await contract.createCase(parties, 60000, 75, "Long-running case");

      // Simulate time tracking over several months
      await contract.updateTimeSpent(1, 40);  // Month 1
      await contract.updateTimeSpent(1, 50);  // Month 2
      await contract.updateTimeSpent(1, 60);  // Month 3
      await contract.updateTimeSpent(1, 70);  // Month 4
      await contract.updateTimeSpent(1, 80);  // Month 5

      // Set responsibilities and calculate
      await contract.setResponsibilityRatio(1, alice.address, 55);
      await contract.setResponsibilityRatio(1, bob.address, 45);
      await contract.calculateFeeAllocation(1);

      // Complete payment and settlement
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
    });
  });

  // =====================================================
  // WORKFLOW 6: Responsibility Adjustment
  // =====================================================

  describe("Workflow 6: Responsibility Adjustment", function () {
    it("should allow updating responsibility before fee calculation", async function () {
      const parties = [alice.address, bob.address, charlie.address];
      await contract.createCase(parties, 90000, 85, "Adjustable case");

      // Initial allocation
      await contract.setResponsibilityRatio(1, alice.address, 40);
      await contract.setResponsibilityRatio(1, bob.address, 30);
      await contract.setResponsibilityRatio(1, charlie.address, 30);

      // Adjust alice's responsibility
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 25);
      await contract.setResponsibilityRatio(1, charlie.address, 25);

      // Calculate with updated ratios
      await contract.calculateFeeAllocation(1);

      // Complete workflow
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);
      await contract.connect(charlie).recordPayment(1);

      const caseInfo = await contract.getCaseInfo(1);
      expect(caseInfo.isSettled).to.be.true;
    });
  });

  // =====================================================
  // WORKFLOW 7: Sequential Case Processing
  // =====================================================

  describe("Workflow 7: Sequential Case Processing", function () {
    it("should process multiple cases sequentially to completion", async function () {
      const parties = [alice.address, bob.address];

      // Process three cases one after another
      for (let i = 1; i <= 3; i++) {
        await contract.createCase(
          parties,
          30000 * i,
          40 + i * 10,
          `Sequential Case ${i}`
        );

        await contract.updateTimeSpent(i, 40 + i * 20);
        await contract.setResponsibilityRatio(i, alice.address, 50);
        await contract.setResponsibilityRatio(i, bob.address, 50);
        await contract.calculateFeeAllocation(i);
        await contract.connect(alice).recordPayment(i);
        await contract.connect(bob).recordPayment(i);

        const caseInfo = await contract.getCaseInfo(i);
        expect(caseInfo.isSettled).to.be.true;
      }

      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(3);
      expect(stats.settled).to.equal(3);
      expect(stats.active).to.equal(0);
    });
  });

  // =====================================================
  // WORKFLOW 8: Mixed Settlement Methods
  // =====================================================

  describe("Workflow 8: Mixed Settlement Methods", function () {
    it("should handle both normal and emergency settlements", async function () {
      // Create three cases
      await contract.createCase([alice.address, bob.address], 30000, 40, "Case 1");
      await contract.createCase([bob.address, charlie.address], 40000, 50, "Case 2");
      await contract.createCase([alice.address, charlie.address], 50000, 60, "Case 3");

      // Normal settlement for case 1
      await contract.setResponsibilityRatio(1, alice.address, 50);
      await contract.setResponsibilityRatio(1, bob.address, 50);
      await contract.calculateFeeAllocation(1);
      await contract.connect(alice).recordPayment(1);
      await contract.connect(bob).recordPayment(1);

      // Emergency settlement for case 2
      await contract.emergencySettleCase(2);

      // Keep case 3 active
      const stats = await contract.getSystemStats();
      expect(stats.total).to.equal(3);
      expect(stats.active).to.equal(1);
      expect(stats.settled).to.equal(2);
    });
  });
});
