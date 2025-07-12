const { ethers } = require("hardhat");

/**
 * Test Helper Utilities
 * Common functions and fixtures used across test suites
 */

/**
 * Deploy a fresh instance of the contract
 * @returns {Promise<{contract: Contract, contractAddress: string}>}
 */
async function deployContract() {
  const ConfidentialLegalFeeAllocation = await ethers.getContractFactory(
    "ConfidentialLegalFeeAllocation"
  );
  const contract = await ConfidentialLegalFeeAllocation.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

/**
 * Get standard test signers with named roles
 * @returns {Promise<Object>} Named signer object
 */
async function getTestSigners() {
  const signers = await ethers.getSigners();

  return {
    deployer: signers[0],
    alice: signers[1],
    bob: signers[2],
    charlie: signers[3],
    dave: signers[4],
    eve: signers[5],
    frank: signers[6],
    grace: signers[7],
  };
}

/**
 * Create a simple two-party case for testing
 * @param {Contract} contract - Contract instance
 * @param {Array<string>} parties - Array of party addresses
 * @param {Object} options - Optional parameters
 * @returns {Promise<number>} Case ID
 */
async function createSimpleCase(
  contract,
  parties = null,
  options = {}
) {
  if (!parties || parties.length < 2) {
    const signers = await getTestSigners();
    parties = [signers.alice.address, signers.bob.address];
  }

  const {
    totalFee = 50000,
    complexity = 50,
    description = "Test case",
  } = options;

  const tx = await contract.createCase(parties, totalFee, complexity, description);
  const receipt = await tx.wait();

  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CaseCreated"
  );

  return event ? Number(event.args.caseId) : 1;
}

/**
 * Set up a case with equal responsibility for all parties
 * @param {Contract} contract - Contract instance
 * @param {number} caseId - Case ID
 * @param {Array<string>} parties - Array of party addresses
 * @returns {Promise<void>}
 */
async function setEqualResponsibility(contract, caseId, parties) {
  const responsibility = Math.floor(100 / parties.length);

  for (let i = 0; i < parties.length; i++) {
    await contract.setResponsibilityRatio(caseId, parties[i], responsibility);
  }
}

/**
 * Complete full case setup (create, set time, set responsibilities, calculate)
 * @param {Contract} contract - Contract instance
 * @param {Array<string>} parties - Array of party addresses
 * @param {Object} options - Optional parameters
 * @returns {Promise<number>} Case ID
 */
async function setupCompleteCase(contract, parties, options = {}) {
  const {
    totalFee = 50000,
    complexity = 50,
    description = "Test case",
    timeSpent = 80,
    responsibilities = null,
  } = options;

  // Create case
  const caseId = await createSimpleCase(contract, parties, {
    totalFee,
    complexity,
    description,
  });

  // Update time
  if (timeSpent > 0) {
    await contract.updateTimeSpent(caseId, timeSpent);
  }

  // Set responsibilities
  if (responsibilities) {
    for (const [address, ratio] of Object.entries(responsibilities)) {
      await contract.setResponsibilityRatio(caseId, address, ratio);
    }
  } else {
    // Equal distribution
    await setEqualResponsibility(contract, caseId, parties);
  }

  // Calculate fees
  await contract.calculateFeeAllocation(caseId);

  return caseId;
}

/**
 * Complete a case by having all parties pay
 * @param {Contract} contract - Contract instance
 * @param {number} caseId - Case ID
 * @param {Array<Signer>} partySigners - Array of signer objects
 * @returns {Promise<void>}
 */
async function completePayments(contract, caseId, partySigners) {
  for (const signer of partySigners) {
    await contract.connect(signer).recordPayment(caseId);
  }
}

/**
 * Get current block timestamp
 * @returns {Promise<number>} Current timestamp
 */
async function getCurrentTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

/**
 * Increase blockchain time by specified seconds
 * @param {number} seconds - Seconds to increase
 * @returns {Promise<void>}
 */
async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

/**
 * Expect transaction to emit event with specific args
 * @param {Promise} txPromise - Transaction promise
 * @param {string} eventName - Event name
 * @param {Array} expectedArgs - Expected event arguments
 * @returns {Promise<void>}
 */
async function expectEvent(txPromise, eventName, expectedArgs = []) {
  const tx = await txPromise;
  const receipt = await tx.wait();

  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === eventName
  );

  if (!event) {
    throw new Error(`Event ${eventName} not found`);
  }

  if (expectedArgs.length > 0) {
    for (let i = 0; i < expectedArgs.length; i++) {
      if (event.args[i] !== expectedArgs[i]) {
        throw new Error(
          `Event arg ${i} mismatch: expected ${expectedArgs[i]}, got ${event.args[i]}`
        );
      }
    }
  }

  return event;
}

/**
 * Create multiple cases for testing
 * @param {Contract} contract - Contract instance
 * @param {number} count - Number of cases to create
 * @param {Array<string>} parties - Array of party addresses
 * @returns {Promise<Array<number>>} Array of case IDs
 */
async function createMultipleCases(contract, count, parties) {
  const caseIds = [];

  for (let i = 0; i < count; i++) {
    const caseId = await createSimpleCase(contract, parties, {
      totalFee: 30000 + i * 10000,
      complexity: 40 + i * 10,
      description: `Case ${i + 1}`,
    });
    caseIds.push(caseId);
  }

  return caseIds;
}

/**
 * Get case statistics
 * @param {Contract} contract - Contract instance
 * @returns {Promise<Object>} Statistics object
 */
async function getStats(contract) {
  const stats = await contract.getSystemStats();
  return {
    total: Number(stats.total),
    active: Number(stats.active),
    settled: Number(stats.settled),
  };
}

/**
 * Verify case state
 * @param {Contract} contract - Contract instance
 * @param {number} caseId - Case ID
 * @param {Object} expectedState - Expected state values
 * @returns {Promise<void>}
 */
async function verifyCaseState(contract, caseId, expectedState) {
  const caseInfo = await contract.getCaseInfo(caseId);

  if (expectedState.isActive !== undefined) {
    if (caseInfo.isActive !== expectedState.isActive) {
      throw new Error(
        `Case ${caseId} isActive mismatch: expected ${expectedState.isActive}, got ${caseInfo.isActive}`
      );
    }
  }

  if (expectedState.isSettled !== undefined) {
    if (caseInfo.isSettled !== expectedState.isSettled) {
      throw new Error(
        `Case ${caseId} isSettled mismatch: expected ${expectedState.isSettled}, got ${caseInfo.isSettled}`
      );
    }
  }

  if (expectedState.partyCount !== undefined) {
    if (Number(caseInfo.partyCount) !== expectedState.partyCount) {
      throw new Error(
        `Case ${caseId} partyCount mismatch: expected ${expectedState.partyCount}, got ${caseInfo.partyCount}`
      );
    }
  }
}

/**
 * Generate random test data
 * @returns {Object} Random test data
 */
function generateRandomCaseData() {
  return {
    totalFee: Math.floor(Math.random() * 100000) + 10000, // 10k - 110k
    complexity: Math.floor(Math.random() * 100) + 1, // 1 - 100
    timeSpent: Math.floor(Math.random() * 500) + 10, // 10 - 510 hours
  };
}

/**
 * Create test fixture with deployed contract and signers
 * @returns {Promise<Object>} Fixture object
 */
async function createTestFixture() {
  const { contract, contractAddress } = await deployContract();
  const signers = await getTestSigners();

  return {
    contract,
    contractAddress,
    deployer: signers.deployer,
    alice: signers.alice,
    bob: signers.bob,
    charlie: signers.charlie,
    dave: signers.dave,
    eve: signers.eve,
  };
}

/**
 * Calculate expected fee based on complexity and time
 * @param {number} baseFee - Base fee amount
 * @param {number} complexity - Complexity (0-100)
 * @param {number} timeSpent - Time spent in hours
 * @returns {number} Calculated fee
 */
function calculateExpectedFee(baseFee, complexity, timeSpent) {
  const complexityFactor = Math.floor(complexity / 10) * 1000;
  const timeFactor = Math.floor(timeSpent / 40) * 500;
  return baseFee + complexityFactor + timeFactor;
}

/**
 * Wait for transaction and return receipt
 * @param {Promise} txPromise - Transaction promise
 * @returns {Promise<Object>} Transaction receipt
 */
async function waitForTx(txPromise) {
  const tx = await txPromise;
  return await tx.wait();
}

/**
 * Get gas used by transaction
 * @param {Promise} txPromise - Transaction promise
 * @returns {Promise<bigint>} Gas used
 */
async function getGasUsed(txPromise) {
  const receipt = await waitForTx(txPromise);
  return receipt.gasUsed;
}

module.exports = {
  deployContract,
  getTestSigners,
  createSimpleCase,
  setEqualResponsibility,
  setupCompleteCase,
  completePayments,
  getCurrentTimestamp,
  increaseTime,
  expectEvent,
  createMultipleCases,
  getStats,
  verifyCaseState,
  generateRandomCaseData,
  createTestFixture,
  calculateExpectedFee,
  waitForTx,
  getGasUsed,
};
