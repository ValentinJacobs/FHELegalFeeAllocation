const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for ConfidentialLegalFeeAllocation contract
 * Deploys to Sepolia testnet with comprehensive logging and verification
 */
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Confidential Legal Fee Allocation Deployment");
  console.log("═══════════════════════════════════════════════════════\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);

  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Check if deployer has sufficient balance
  const minimumBalance = hre.ethers.parseEther("0.01");
  if (balance < minimumBalance) {
    console.error("❌ Insufficient balance for deployment");
    console.error(`   Minimum required: 0.01 ETH`);
    process.exit(1);
  }

  console.log("🚀 Starting deployment...\n");

  // Deploy the contract
  const startTime = Date.now();
  const ConfidentialLegalFeeAllocation = await hre.ethers.getContractFactory(
    "ConfidentialLegalFeeAllocation"
  );

  console.log("📦 Deploying ConfidentialLegalFeeAllocation contract...");
  const contract = await ConfidentialLegalFeeAllocation.deploy();

  console.log("⏳ Waiting for deployment confirmation...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deploymentTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n✅ Deployment successful!\n");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Deployment Information");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`📄 Contract Address: ${contractAddress}`);
  console.log(`🔗 Network: ${network.name}`);
  console.log(`⏱️  Deployment Time: ${deploymentTime}s`);
  console.log(`👤 Admin: ${deployerAddress}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Generate Etherscan link
  const etherscanBaseUrl =
    network.chainId === 11155111n
      ? "https://sepolia.etherscan.io"
      : "https://etherscan.io";
  const etherscanUrl = `${etherscanBaseUrl}/address/${contractAddress}`;

  console.log("🔍 Verification Links:");
  console.log(`   Etherscan: ${etherscanUrl}\n`);

  // Save deployment information
  const deploymentInfo = {
    contractName: "ConfidentialLegalFeeAllocation",
    contractAddress: contractAddress,
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    deploymentDuration: deploymentTime,
    etherscanUrl: etherscanUrl,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    compiler: {
      version: "0.8.24",
      optimizer: true,
      runs: 200,
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentFilePath = path.join(
    deploymentsDir,
    `${network.name}_deployment.json`
  );
  fs.writeFileSync(
    deploymentFilePath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`💾 Deployment info saved to: ${deploymentFilePath}\n`);

  // Wait for block confirmations before verification
  if (network.chainId !== 31337n) {
    console.log("⏳ Waiting for 5 block confirmations before verification...");
    await contract.deploymentTransaction().wait(5);
    console.log("✅ Block confirmations received\n");

    console.log("📝 Next steps:");
    console.log("   1. Run verification: npm run verify");
    console.log("   2. Test interaction: npm run interact");
    console.log("   3. Run simulation: npm run simulate\n");

    console.log("💡 Verification command:");
    console.log(
      `   npx hardhat verify --network ${network.name} ${contractAddress}\n`
    );
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Deployment Complete!");
  console.log("═══════════════════════════════════════════════════════\n");

  return {
    contract,
    contractAddress,
    deploymentInfo,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:\n");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
