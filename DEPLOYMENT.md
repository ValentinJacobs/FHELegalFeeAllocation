# Deployment Guide - Confidential Legal Fee Allocation

## Overview

This guide provides comprehensive instructions for deploying, verifying, and interacting with the **Confidential Legal Fee Allocation** smart contract on Ethereum Sepolia testnet using Hardhat.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Compilation](#compilation)
5. [Deployment](#deployment)
6. [Verification](#verification)
7. [Interaction](#interaction)
8. [Simulation](#simulation)
9. [Network Information](#network-information)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the contract, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)
- **Ethereum wallet** with Sepolia testnet ETH
- **Etherscan API key** (for contract verification)

### Get Sepolia Testnet ETH

Obtain free Sepolia ETH from these faucets:

- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

---

## Installation

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Hardhat framework
- Ethers.js v6
- Hardhat toolbox
- fhEVM Solidity library
- Testing utilities

### Step 2: Verify Installation

```bash
npx hardhat --version
```

Expected output: `Hardhat version 2.22.x`

---

## Configuration

### Step 1: Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` and add your credentials:

```env
# Sepolia RPC URL
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Gas reporting
REPORT_GAS=false
```

**Security Warning:** Never commit your `.env` file or share your private key!

### Step 3: Get Etherscan API Key

1. Visit [Etherscan](https://etherscan.io/register)
2. Create a free account
3. Navigate to [API Keys](https://etherscan.io/myapikey)
4. Generate a new API key
5. Add it to your `.env` file

---

## Compilation

### Compile Smart Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeChain types
- Create artifacts in `./artifacts`
- Generate cache files

### Clean Build Artifacts

To remove old artifacts and cache:

```bash
npm run clean
npm run compile
```

---

## Deployment

### Step 1: Deploy to Sepolia

```bash
npm run deploy
```

**What happens during deployment:**

1. ✅ Validates deployer account and balance
2. ✅ Deploys `ConfidentialLegalFeeAllocation` contract
3. ✅ Waits for confirmation
4. ✅ Saves deployment information to `deployments/sepolia_deployment.json`
5. ✅ Generates Etherscan link
6. ✅ Waits for 5 block confirmations

### Step 2: Deployment Output

You will see output similar to:

```
═══════════════════════════════════════════════════════
  Confidential Legal Fee Allocation Deployment
═══════════════════════════════════════════════════════

📡 Network: sepolia (Chain ID: 11155111)
👤 Deployer: 0xYourAddress...
💰 Balance: 0.5 ETH

🚀 Starting deployment...

✅ Deployment successful!

═══════════════════════════════════════════════════════
  Deployment Information
═══════════════════════════════════════════════════════
📄 Contract Address: 0xContractAddress...
🔗 Network: sepolia
⏱️  Deployment Time: 45.23s
👤 Admin: 0xYourAddress...
═══════════════════════════════════════════════════════

🔍 Verification Links:
   Etherscan: https://sepolia.etherscan.io/address/0xContractAddress...
```

### Step 3: Deployment Information

Deployment details are saved to `deployments/sepolia_deployment.json`:

```json
{
  "contractName": "ConfidentialLegalFeeAllocation",
  "contractAddress": "0x...",
  "network": "sepolia",
  "chainId": 11155111,
  "deployer": "0x...",
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x...",
  "blockNumber": 1234567
}
```

---

## Verification

### Step 1: Verify Contract on Etherscan

After deployment, verify the contract:

```bash
npm run verify
```

### Step 2: Verification Output

```
═══════════════════════════════════════════════════════
  Contract Verification on Etherscan
═══════════════════════════════════════════════════════

📡 Network: sepolia (Chain ID: 11155111)

📄 Contract Address: 0xContractAddress...
📅 Deployment Time: 2024-01-15T10:30:00.000Z

🔍 Starting Etherscan verification...

✅ Contract verified successfully!

═══════════════════════════════════════════════════════
  Verification Complete
═══════════════════════════════════════════════════════
🔗 Verified Contract: https://sepolia.etherscan.io/address/0x.../code
═══════════════════════════════════════════════════════
```

### Manual Verification (Alternative)

If automatic verification fails:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

---

## Interaction

### Interactive Script

Run the interaction script to test contract functionality:

```bash
npm run interact
```

### What the Interaction Script Does

1. ✅ Creates a new legal case
2. ✅ Updates time spent on the case
3. ✅ Sets responsibility ratios for parties
4. ✅ Calculates fee allocation
5. ✅ Records payments
6. ✅ Settles the case

### Sample Output

```
═══════════════════════════════════════════════════════
  Full Workflow Demonstration
═══════════════════════════════════════════════════════

📊 System Statistics
   Total Cases: 0
   Active Cases: 0
   Settled Cases: 0

✅ Case created successfully!
📋 Case ID: 1
🔗 Case Hash: 0x...

⏱️  Time updated: 120 hours
⚖️  Responsibility set for all parties
🧮 Fees calculated and distributed
💰 All payments recorded

✅ Case settled!
```

---

## Simulation

### Run Comprehensive Simulation

Execute multiple scenarios to test all features:

```bash
npm run simulate
```

### Simulation Scenarios

The simulation script runs four scenarios:

1. **Simple Two-Party Case** - Equal 50-50 responsibility
2. **Complex Multi-Party Case** - Four parties with variable responsibility
3. **Quick Settlement** - Low complexity case with fast resolution
4. **Emergency Settlement** - Admin intervention scenario

### Simulation Report

Results are saved to `reports/simulation_report.json`:

```json
{
  "simulationDate": "2024-01-15T10:30:00.000Z",
  "totalCases": 4,
  "activeCases": 1,
  "settledCases": 3,
  "scenarios": [
    {
      "id": 1,
      "name": "Simple Two-Party Case",
      "caseId": 1,
      "status": "settled"
    }
  ]
}
```

---

## Network Information

### Sepolia Testnet Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Sepolia |
| **Chain ID** | 11155111 |
| **RPC URL** | https://rpc.sepolia.org |
| **Block Explorer** | https://sepolia.etherscan.io |
| **Currency Symbol** | ETH |

### Contract Information

After deployment, your contract will be available at:

- **Contract Address**: `deployments/sepolia_deployment.json`
- **Etherscan Link**: `https://sepolia.etherscan.io/address/CONTRACT_ADDRESS`
- **Verified Source**: `https://sepolia.etherscan.io/address/CONTRACT_ADDRESS#code`

---

## Available Scripts

### Core Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Test with coverage
npm run test:coverage

# Deploy to Sepolia
npm run deploy

# Deploy to local network
npm run deploy:local

# Verify contract
npm run verify

# Interact with contract
npm run interact

# Run simulation
npm run simulate

# Start local node
npm run node

# Clean artifacts
npm run clean
```

### Code Quality

```bash
# Lint JavaScript
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

---

## Troubleshooting

### Common Issues

#### 1. Insufficient Balance

**Error:** `Insufficient balance for deployment`

**Solution:**
- Get Sepolia ETH from faucets
- Ensure you have at least 0.01 ETH

#### 2. Invalid Private Key

**Error:** `Invalid private key`

**Solution:**
- Check `.env` file configuration
- Ensure private key is without `0x` prefix
- Verify you're using the correct wallet

#### 3. RPC Connection Failed

**Error:** `Failed to connect to network`

**Solution:**
- Check your `SEPOLIA_RPC_URL` in `.env`
- Try alternative RPC providers:
  - `https://sepolia.infura.io/v3/YOUR_KEY`
  - `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

#### 4. Verification Failed

**Error:** `Verification failed`

**Solution:**
- Wait 1-2 minutes after deployment
- Check `ETHERSCAN_API_KEY` is valid
- Ensure contract was deployed successfully
- Try manual verification command

#### 5. Contract Already Deployed

**Error:** `Contract already deployed`

**Solution:**
- Check `deployments/` directory
- Use existing deployment or deploy to different network

---

## Security Best Practices

1. ✅ **Never commit `.env` file** - Add to `.gitignore`
2. ✅ **Use separate wallets** - Development vs. production
3. ✅ **Backup private keys** - Store securely offline
4. ✅ **Test thoroughly** - Use testnet before mainnet
5. ✅ **Verify contracts** - Always verify on Etherscan
6. ✅ **Monitor transactions** - Check Etherscan for activity

---

## Contract Features

### Privacy Features

- **Encrypted Fee Amounts** - Using fhEVM technology
- **Confidential Responsibility Ratios** - Private to parties
- **Secure Allocations** - Only parties can view their amounts

### Core Functions

1. **createCase()** - Create new legal case
2. **updateTimeSpent()** - Track billable hours
3. **setResponsibilityRatio()** - Define party obligations
4. **calculateFeeAllocation()** - Compute encrypted fees
5. **recordPayment()** - Mark party payment
6. **emergencySettleCase()** - Admin override

---

## Support & Resources

### Documentation

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)

### Community

- [Hardhat Discord](https://hardhat.org/discord)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
- [Zama Community](https://zama.ai/community)

---

## License

MIT License - See LICENSE file for details

---

## Conclusion

You have successfully deployed the **Confidential Legal Fee Allocation** contract to Sepolia testnet! The contract is now ready for testing and interaction.

**Next Steps:**
1. Run interaction script to test functionality
2. Execute simulation scenarios
3. Monitor contract on Etherscan
4. Share contract address with stakeholders

For questions or issues, please refer to the troubleshooting section above.
