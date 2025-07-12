const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Contract verification script for Etherscan
 * Reads deployment information and verifies the contract on Etherscan
 */
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Contract Verification on Etherscan");
  console.log("═══════════════════════════════════════════════════════\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})\n`);

  // Check if Etherscan API key is configured
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("❌ ETHERSCAN_API_KEY not found in .env file");
    console.error("   Please add your Etherscan API key to continue\n");
    process.exit(1);
  }

  // Read deployment information
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

  console.log("📖 Reading deployment information...");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`📄 Contract Address: ${contractAddress}`);
  console.log(`📅 Deployment Time: ${deploymentInfo.deploymentTime}\n`);

  // Skip verification for local networks
  if (network.chainId === 31337n) {
    console.log("⚠️  Skipping verification for local network\n");
    return;
  }

  console.log("🔍 Starting Etherscan verification...\n");

  try {
    // Verify the contract
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/ConfidentialLegalFeeAllocation.sol:ConfidentialLegalFeeAllocation",
    });

    console.log("\n✅ Contract verified successfully!\n");

    // Generate Etherscan link
    const etherscanBaseUrl =
      network.chainId === 11155111n
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io";
    const verifiedUrl = `${etherscanBaseUrl}/address/${contractAddress}#code`;

    console.log("═══════════════════════════════════════════════════════");
    console.log("  Verification Complete");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`🔗 Verified Contract: ${verifiedUrl}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    deploymentInfo.verifiedUrl = verifiedUrl;

    fs.writeFileSync(
      deploymentFilePath,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Verification status saved to deployment file\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified on Etherscan\n");

      const etherscanBaseUrl =
        network.chainId === 11155111n
          ? "https://sepolia.etherscan.io"
          : "https://etherscan.io";
      const verifiedUrl = `${etherscanBaseUrl}/address/${contractAddress}#code`;

      console.log(`🔗 View verified contract: ${verifiedUrl}\n`);

      // Update deployment info
      deploymentInfo.verified = true;
      deploymentInfo.verifiedUrl = verifiedUrl;
      fs.writeFileSync(
        deploymentFilePath,
        JSON.stringify(deploymentInfo, null, 2)
      );

    } else if (error.message.includes("does not have bytecode")) {
      console.error("❌ Contract not found at the specified address");
      console.error("   Please check the deployment and try again\n");
      process.exit(1);

    } else {
      console.error("\n❌ Verification failed:\n");
      console.error(error.message);
      console.error("\n💡 Troubleshooting tips:");
      console.error("   1. Ensure ETHERSCAN_API_KEY is correct in .env");
      console.error("   2. Wait a few minutes after deployment");
      console.error("   3. Check if the contract was deployed successfully");
      console.error("   4. Verify the network configuration\n");
      process.exit(1);
    }
  }

  console.log("📝 Next steps:");
  console.log("   1. Test interaction: npm run interact");
  console.log("   2. Run simulation: npm run simulate\n");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script failed:\n");
    console.error(error);
    process.exit(1);
  });

module.exports = main;
