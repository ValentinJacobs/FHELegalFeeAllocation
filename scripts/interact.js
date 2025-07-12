const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Interaction script for ConfidentialLegalFeeAllocation contract
 * Provides interactive menu to manage legal cases and fee allocations
 */

let contract;
let deployer;
let accounts;

async function loadContract() {
  console.log("📖 Loading contract information...\n");

  const network = await hre.ethers.provider.getNetwork();
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFilePath = path.join(
    deploymentsDir,
    `${network.name}_deployment.json`
  );

  if (!fs.existsSync(deploymentFilePath)) {
    console.error(`❌ Deployment file not found: ${deploymentFilePath}`);
    console.error("   Please deploy the contract first using: npm run deploy\n");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`📄 Contract Address: ${contractAddress}`);
  console.log(`🔗 Network: ${network.name}\n`);

  const ConfidentialLegalFeeAllocation = await hre.ethers.getContractFactory(
    "ConfidentialLegalFeeAllocation"
  );
  contract = ConfidentialLegalFeeAllocation.attach(contractAddress);

  [deployer, ...accounts] = await hre.ethers.getSigners();
  console.log(`👤 Admin: ${await deployer.getAddress()}\n`);

  return contract;
}

async function getSystemStats() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  System Statistics");
  console.log("═══════════════════════════════════════════════════════\n");

  const stats = await contract.getSystemStats();
  console.log(`📊 Total Cases: ${stats.total}`);
  console.log(`✅ Active Cases: ${stats.active}`);
  console.log(`🏁 Settled Cases: ${stats.settled}\n`);
}

async function createNewCase() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Creating New Legal Case");
  console.log("═══════════════════════════════════════════════════════\n");

  // Example case data
  const parties = [
    await accounts[0].getAddress(),
    await accounts[1].getAddress(),
    await accounts[2].getAddress(),
  ];

  const totalFee = 50000; // Base fee in currency units
  const complexity = 75; // Complexity rating (0-100)
  const caseDescription = "Complex commercial litigation with multiple parties";

  console.log("📝 Case Details:");
  console.log(`   Parties: ${parties.length}`);
  parties.forEach((party, index) => {
    console.log(`   Party ${index + 1}: ${party}`);
  });
  console.log(`   Base Fee: ${totalFee}`);
  console.log(`   Complexity: ${complexity}/100`);
  console.log(`   Description: ${caseDescription}\n`);

  console.log("🚀 Creating case...");
  const tx = await contract.createCase(
    parties,
    totalFee,
    complexity,
    caseDescription
  );

  console.log(`⏳ Transaction hash: ${tx.hash}`);
  const receipt = await tx.wait();

  // Extract case ID from event
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CaseCreated"
  );

  if (event) {
    const caseId = event.args.caseId;
    console.log(`\n✅ Case created successfully!`);
    console.log(`📋 Case ID: ${caseId}`);
    console.log(`🔗 Case Hash: ${event.args.caseHash}\n`);
    return caseId;
  }

  return null;
}

async function getCaseInformation(caseId) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Case Information");
  console.log("═══════════════════════════════════════════════════════\n");

  const caseInfo = await contract.getCaseInfo(caseId);
  const parties = await contract.getCaseParties(caseId);

  console.log(`📋 Case ID: ${caseInfo.caseId}`);
  console.log(`👥 Number of Parties: ${caseInfo.partyCount}`);
  console.log(`✅ Active: ${caseInfo.isActive}`);
  console.log(`🏁 Settled: ${caseInfo.isSettled}`);
  console.log(
    `📅 Created: ${new Date(Number(caseInfo.createdAt) * 1000).toLocaleString()}`
  );

  if (caseInfo.isSettled) {
    console.log(
      `🏁 Settled: ${new Date(Number(caseInfo.settledAt) * 1000).toLocaleString()}`
    );
  }

  console.log(`🔐 Case Hash: ${caseInfo.caseHash}`);
  console.log("\n👥 Parties:");
  parties.forEach((party, index) => {
    console.log(`   ${index + 1}. ${party}`);
  });
  console.log();
}

async function updateCaseTime(caseId, hours) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Updating Time Spent");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`📋 Case ID: ${caseId}`);
  console.log(`⏱️  Additional Hours: ${hours}\n`);

  console.log("🚀 Updating time spent...");
  const tx = await contract.updateTimeSpent(caseId, hours);
  console.log(`⏳ Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log("✅ Time updated successfully!\n");
}

async function setPartyResponsibility(caseId, partyIndex, responsibility) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Setting Party Responsibility");
  console.log("═══════════════════════════════════════════════════════\n");

  const parties = await contract.getCaseParties(caseId);
  const partyAddress = parties[partyIndex];

  console.log(`📋 Case ID: ${caseId}`);
  console.log(`👤 Party: ${partyAddress}`);
  console.log(`📊 Responsibility: ${responsibility}%\n`);

  console.log("🚀 Setting responsibility...");
  const tx = await contract.setResponsibilityRatio(
    caseId,
    partyAddress,
    responsibility
  );
  console.log(`⏳ Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log("✅ Responsibility set successfully!\n");
}

async function calculateFees(caseId) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Calculating Fee Allocation");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`📋 Case ID: ${caseId}\n`);

  console.log("🧮 Calculating fees based on:");
  console.log("   - Base fee");
  console.log("   - Complexity multiplier");
  console.log("   - Time spent");
  console.log("   - Party responsibility ratios\n");

  console.log("🚀 Calculating...");
  const tx = await contract.calculateFeeAllocation(caseId);
  console.log(`⏳ Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log("✅ Fees calculated and distributed to parties!\n");
  console.log("🔒 Individual allocations are encrypted and private\n");
}

async function recordPayment(caseId, partyIndex) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Recording Payment");
  console.log("═══════════════════════════════════════════════════════\n");

  const parties = await contract.getCaseParties(caseId);
  const partySigner = accounts[partyIndex];

  console.log(`📋 Case ID: ${caseId}`);
  console.log(`👤 Party: ${await partySigner.getAddress()}\n`);

  console.log("💰 Recording payment...");
  const tx = await contract.connect(partySigner).recordPayment(caseId);
  console.log(`⏳ Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log("✅ Payment recorded successfully!\n");
}

async function demonstrateFullWorkflow() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Full Workflow Demonstration");
  console.log("═══════════════════════════════════════════════════════\n");

  try {
    // 1. Show initial stats
    await getSystemStats();

    // 2. Create a new case
    const caseId = await createNewCase();
    if (!caseId) {
      console.error("❌ Failed to create case");
      return;
    }

    // 3. Show case information
    await getCaseInformation(caseId);

    // 4. Update time spent
    await updateCaseTime(caseId, 120); // 120 hours

    // 5. Set responsibility for each party
    await setPartyResponsibility(caseId, 0, 40); // Party 1: 40%
    await setPartyResponsibility(caseId, 1, 35); // Party 2: 35%
    await setPartyResponsibility(caseId, 2, 25); // Party 3: 25%

    // 6. Calculate fee allocation
    await calculateFees(caseId);

    // 7. Record payments
    await recordPayment(caseId, 0);
    await recordPayment(caseId, 1);
    await recordPayment(caseId, 2);

    // 8. Show final stats
    await getSystemStats();

    // 9. Show final case information
    await getCaseInformation(caseId);

    console.log("═══════════════════════════════════════════════════════");
    console.log("  Workflow Complete!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("✅ Successfully demonstrated:");
    console.log("   ✓ Case creation");
    console.log("   ✓ Time tracking");
    console.log("   ✓ Responsibility distribution");
    console.log("   ✓ Fee calculation");
    console.log("   ✓ Payment recording");
    console.log("   ✓ Case settlement\n");

  } catch (error) {
    console.error("\n❌ Workflow error:");
    console.error(error.message);
    console.error();
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Confidential Legal Fee Allocation - Interaction");
  console.log("═══════════════════════════════════════════════════════\n");

  await loadContract();
  await demonstrateFullWorkflow();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction script failed:\n");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
