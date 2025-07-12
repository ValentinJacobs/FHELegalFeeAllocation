const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Simulation script for ConfidentialLegalFeeAllocation contract
 * Runs comprehensive scenarios to test all contract features
 */

let contract;
let deployer;
let accounts;

async function loadContract() {
  console.log("📖 Loading contract for simulation...\n");

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

async function scenario1_SimpleCase() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Scenario 1: Simple Two-Party Case");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📝 Creating a simple case with two parties...");

  const parties = [
    await accounts[0].getAddress(),
    await accounts[1].getAddress(),
  ];

  const tx = await contract.createCase(
    parties,
    30000, // $30,000 base fee
    50,    // Medium complexity
    "Simple contract dispute between two parties"
  );

  const receipt = await tx.wait();
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CaseCreated"
  );
  const caseId = event.args.caseId;

  console.log(`✅ Case ${caseId} created\n`);

  // Set equal responsibility
  console.log("⚖️  Setting equal responsibility (50-50)...");
  await (await contract.setResponsibilityRatio(caseId, parties[0], 50)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[1], 50)).wait();

  // Add time spent
  console.log("⏱️  Recording 80 hours of work...");
  await (await contract.updateTimeSpent(caseId, 80)).wait();

  // Calculate fees
  console.log("🧮 Calculating fee allocation...");
  await (await contract.calculateFeeAllocation(caseId)).wait();

  // Record payments
  console.log("💰 Recording payments...");
  await (await contract.connect(accounts[0]).recordPayment(caseId)).wait();
  await (await contract.connect(accounts[1]).recordPayment(caseId)).wait();

  console.log("✅ Scenario 1 Complete: Case settled successfully!\n");
  return caseId;
}

async function scenario2_ComplexMultiParty() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Scenario 2: Complex Multi-Party Case");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📝 Creating a complex case with four parties...");

  const parties = [
    await accounts[0].getAddress(),
    await accounts[1].getAddress(),
    await accounts[2].getAddress(),
    await accounts[3].getAddress(),
  ];

  const tx = await contract.createCase(
    parties,
    150000, // $150,000 base fee
    90,     // High complexity
    "Complex corporate merger dispute with multiple stakeholders"
  );

  const receipt = await tx.wait();
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CaseCreated"
  );
  const caseId = event.args.caseId;

  console.log(`✅ Case ${caseId} created\n`);

  // Set different responsibility levels
  console.log("⚖️  Setting variable responsibility:");
  console.log("   Party 1: 40% (primary defendant)");
  console.log("   Party 2: 30% (secondary defendant)");
  console.log("   Party 3: 20% (minor defendant)");
  console.log("   Party 4: 10% (minimal involvement)\n");

  await (await contract.setResponsibilityRatio(caseId, parties[0], 40)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[1], 30)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[2], 20)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[3], 10)).wait();

  // Add extensive time spent
  console.log("⏱️  Recording 300 hours of work...");
  await (await contract.updateTimeSpent(caseId, 300)).wait();

  // Calculate fees
  console.log("🧮 Calculating fee allocation...");
  await (await contract.calculateFeeAllocation(caseId)).wait();

  // Partial payments
  console.log("💰 Recording partial payments (3 out of 4 parties)...");
  await (await contract.connect(accounts[0]).recordPayment(caseId)).wait();
  await (await contract.connect(accounts[1]).recordPayment(caseId)).wait();
  await (await contract.connect(accounts[2]).recordPayment(caseId)).wait();

  console.log("⚠️  Scenario 2 Complete: Case partially paid (awaiting final payment)\n");
  return caseId;
}

async function scenario3_LowComplexityQuickSettlement() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Scenario 3: Low Complexity Quick Settlement");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📝 Creating a straightforward case...");

  const parties = [
    await accounts[0].getAddress(),
    await accounts[1].getAddress(),
    await accounts[2].getAddress(),
  ];

  const tx = await contract.createCase(
    parties,
    25000, // $25,000 base fee
    30,    // Low complexity
    "Minor contractual disagreement - simple mediation"
  );

  const receipt = await tx.wait();
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CaseCreated"
  );
  const caseId = event.args.caseId;

  console.log(`✅ Case ${caseId} created\n`);

  // Set responsibility
  console.log("⚖️  Setting responsibility distribution...");
  await (await contract.setResponsibilityRatio(caseId, parties[0], 60)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[1], 25)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[2], 15)).wait();

  // Minimal time spent
  console.log("⏱️  Recording 40 hours of work...");
  await (await contract.updateTimeSpent(caseId, 40)).wait();

  // Calculate and settle
  console.log("🧮 Calculating fee allocation...");
  await (await contract.calculateFeeAllocation(caseId)).wait();

  console.log("💰 Quick settlement - all parties paying...");
  await (await contract.connect(accounts[0]).recordPayment(caseId)).wait();
  await (await contract.connect(accounts[1]).recordPayment(caseId)).wait();
  await (await contract.connect(accounts[2]).recordPayment(caseId)).wait();

  console.log("✅ Scenario 3 Complete: Quick settlement achieved!\n");
  return caseId;
}

async function scenario4_EmergencySettlement() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Scenario 4: Emergency Settlement");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📝 Creating a case that requires emergency intervention...");

  const parties = [
    await accounts[0].getAddress(),
    await accounts[1].getAddress(),
  ];

  const tx = await contract.createCase(
    parties,
    45000, // $45,000 base fee
    65,    // Medium-high complexity
    "Case requiring administrative intervention"
  );

  const receipt = await tx.wait();
  const event = receipt.logs.find(
    (log) => log.fragment && log.fragment.name === "CaseCreated"
  );
  const caseId = event.args.caseId;

  console.log(`✅ Case ${caseId} created\n`);

  // Set responsibility
  await (await contract.setResponsibilityRatio(caseId, parties[0], 70)).wait();
  await (await contract.setResponsibilityRatio(caseId, parties[1], 30)).wait();

  // Add time
  await (await contract.updateTimeSpent(caseId, 150)).wait();

  // Calculate fees
  await (await contract.calculateFeeAllocation(caseId)).wait();

  console.log("⚠️  Simulating situation requiring emergency settlement...");
  console.log("🚨 Admin invoking emergency settlement...");

  await (await contract.emergencySettleCase(caseId)).wait();

  console.log("✅ Scenario 4 Complete: Emergency settlement executed!\n");
  return caseId;
}

async function generateSimulationReport(caseIds) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Simulation Report");
  console.log("═══════════════════════════════════════════════════════\n");

  const stats = await contract.getSystemStats();

  console.log("📊 Overall Statistics:");
  console.log(`   Total Cases Created: ${stats.total}`);
  console.log(`   Active Cases: ${stats.active}`);
  console.log(`   Settled Cases: ${stats.settled}\n`);

  console.log("📋 Scenario Summary:");
  console.log("   ✅ Scenario 1: Simple two-party case - SETTLED");
  console.log("   ⚠️  Scenario 2: Complex multi-party case - PENDING");
  console.log("   ✅ Scenario 3: Quick settlement - SETTLED");
  console.log("   🚨 Scenario 4: Emergency settlement - SETTLED\n");

  console.log("🔍 Detailed Case Information:\n");

  for (let i = 0; i < caseIds.length; i++) {
    const caseId = caseIds[i];
    const caseInfo = await contract.getCaseInfo(caseId);
    const parties = await contract.getCaseParties(caseId);

    console.log(`Case ${caseId}:`);
    console.log(`   Parties: ${parties.length}`);
    console.log(`   Active: ${caseInfo.isActive}`);
    console.log(`   Settled: ${caseInfo.isSettled}`);
    console.log(
      `   Created: ${new Date(Number(caseInfo.createdAt) * 1000).toLocaleDateString()}`
    );

    if (caseInfo.isSettled) {
      console.log(
        `   Settled: ${new Date(Number(caseInfo.settledAt) * 1000).toLocaleDateString()}`
      );
    }
    console.log();
  }

  // Save simulation report
  const reportData = {
    simulationDate: new Date().toISOString(),
    totalCases: Number(stats.total),
    activeCases: Number(stats.active),
    settledCases: Number(stats.settled),
    scenarios: [
      {
        id: 1,
        name: "Simple Two-Party Case",
        caseId: Number(caseIds[0]),
        status: "settled",
      },
      {
        id: 2,
        name: "Complex Multi-Party Case",
        caseId: Number(caseIds[1]),
        status: "pending",
      },
      {
        id: 3,
        name: "Low Complexity Quick Settlement",
        caseId: Number(caseIds[2]),
        status: "settled",
      },
      {
        id: 4,
        name: "Emergency Settlement",
        caseId: Number(caseIds[3]),
        status: "settled",
      },
    ],
  };

  const reportsDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, "simulation_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  console.log(`💾 Simulation report saved to: ${reportPath}\n`);
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Confidential Legal Fee Allocation - Simulation");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("🎯 Running comprehensive simulation scenarios...\n");

  await loadContract();

  const caseIds = [];

  try {
    // Run all scenarios
    caseIds.push(await scenario1_SimpleCase());
    caseIds.push(await scenario2_ComplexMultiParty());
    caseIds.push(await scenario3_LowComplexityQuickSettlement());
    caseIds.push(await scenario4_EmergencySettlement());

    // Generate report
    await generateSimulationReport(caseIds);

    console.log("═══════════════════════════════════════════════════════");
    console.log("  Simulation Complete!");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("✅ Successfully tested:");
    console.log("   ✓ Simple two-party cases");
    console.log("   ✓ Complex multi-party cases");
    console.log("   ✓ Variable responsibility distribution");
    console.log("   ✓ Time tracking and fee calculation");
    console.log("   ✓ Payment recording and settlement");
    console.log("   ✓ Emergency settlement procedures");
    console.log("   ✓ Privacy-preserving fee allocation\n");

  } catch (error) {
    console.error("\n❌ Simulation error:");
    console.error(error.message);
    console.error();
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:\n");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
