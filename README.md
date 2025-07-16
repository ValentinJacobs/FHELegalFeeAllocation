# Confidential Legal Fee Allocation System

A privacy-preserving blockchain solution for transparent and confidential legal fee distribution using Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine) technology.

## Overview

The **Confidential Legal Fee Allocation System** enables law firms, legal departments, and mediation services to fairly distribute legal fees among multiple parties while maintaining complete privacy of individual allocations. Using advanced homomorphic encryption, the system ensures that:

- Fee calculations are transparent and verifiable
- Individual party allocations remain confidential
- Only authorized parties can view their own fee amounts
- The entire process is immutable and auditable on the blockchain

## Key Features

### Privacy & Security
- **Encrypted Fee Amounts** - All fee data is encrypted using fhEVM
- **Confidential Allocations** - Individual party amounts are private
- **Secure Calculations** - Homomorphic operations preserve privacy
- **Access Control** - Only authorized parties can view their data

### Case Management
- **Multi-Party Support** - Handle cases with 2+ parties
- **Complexity Tracking** - Factor in case complexity (0-100 scale)
- **Time Tracking** - Record billable hours for accurate billing
- **Responsibility Distribution** - Assign percentage-based obligations
- **Automated Settlement** - Cases settle when all parties pay

### Administrative Features
- **Emergency Settlement** - Admin override for special circumstances
- **Case Statistics** - Track total, active, and settled cases
- **Event Logging** - Comprehensive on-chain audit trail
- **Party Management** - View all parties involved in cases

## Technical Stack

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract Language**: Solidity ^0.8.24
- **Development Framework**: Hardhat 2.22.x
- **Privacy Technology**: Zama fhEVM
- **Libraries**:
  - ethers.js v6
  - @fhevm/solidity
  - OpenZeppelin (implied security patterns)

## Project Structure

```
confidential-legal-fee-allocation/
├── contracts/
│   └── ConfidentialLegalFeeAllocation.sol    # Main smart contract
├── scripts/
│   ├── deploy.js           # Deployment script
│   ├── verify.js           # Etherscan verification
│   ├── interact.js         # Interactive testing
│   └── simulate.js         # Scenario simulations
├── test/                   # Test files (to be added)
├── deployments/            # Deployment records (generated)
├── reports/                # Simulation reports (generated)
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Dependencies and scripts
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- Ethereum wallet with Sepolia ETH
- Etherscan API key (for verification)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd confidential-legal-fee-allocation

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Configuration

Edit `.env` file:

```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Compilation

```bash
npm run compile
```

### Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy

# Verify on Etherscan
npm run verify
```

### Interaction

```bash
# Run interactive demo
npm run interact

# Run comprehensive simulation
npm run simulate
```

## Smart Contract Architecture

### Core Data Structures

#### LegalCase
```solidity
struct LegalCase {
    uint256 caseId;
    address[] parties;
    euint64 totalFee;           // Encrypted
    euint32 complexity;         // Encrypted
    euint32 timeSpent;          // Encrypted
    bool isActive;
    bool isSettled;
    uint256 createdAt;
    uint256 settledAt;
    bytes32 caseHash;
}
```

#### PartyAllocation
```solidity
struct PartyAllocation {
    euint32 responsibility;      // Encrypted %
    euint64 allocatedAmount;     // Encrypted fee
    euint32 contributionRatio;   // Encrypted ratio
    bool hasPaid;
    uint256 paymentDate;
}
```

#### FeeCalculation
```solidity
struct FeeCalculation {
    euint64 baseFee;            // Encrypted
    euint32 complexityMultiplier;
    euint32 timeMultiplier;
    euint64 finalAmount;        // Encrypted
    bool isCalculated;
}
```

### Main Functions

#### Administrative Functions

**createCase**
```solidity
function createCase(
    address[] calldata _parties,
    uint64 _totalFee,
    uint32 _complexity,
    string calldata _caseDescription
) external onlyAdmin returns (uint256)
```
Creates a new legal case with specified parties and parameters.

**updateTimeSpent**
```solidity
function updateTimeSpent(
    uint256 _caseId,
    uint32 _additionalHours
) external onlyAdmin
```
Records additional billable hours for a case.

**setResponsibilityRatio**
```solidity
function setResponsibilityRatio(
    uint256 _caseId,
    address _party,
    uint32 _responsibility
) external onlyAdmin
```
Assigns responsibility percentage to a party (0-100%).

**calculateFeeAllocation**
```solidity
function calculateFeeAllocation(
    uint256 _caseId
) external onlyAdmin
```
Calculates and distributes fees based on complexity, time, and responsibility.

**emergencySettleCase**
```solidity
function emergencySettleCase(
    uint256 _caseId
) external onlyAdmin
```
Forces settlement in exceptional circumstances.

#### Party Functions

**recordPayment**
```solidity
function recordPayment(
    uint256 _caseId
) external onlyParty(_caseId)
```
Records that a party has paid their allocated fee.

#### View Functions

**getCaseInfo**
```solidity
function getCaseInfo(
    uint256 _caseId
) external view returns (...)
```
Retrieves public case information.

**getPartyAllocation**
```solidity
function getPartyAllocation(
    uint256 _caseId,
    address _party
) external view returns (...)
```
Gets payment status for a party (encrypted amounts remain private).

**getSystemStats**
```solidity
function getSystemStats()
    external view returns (
        uint256 total,
        uint256 active,
        uint256 settled
    )
```
Returns overall system statistics.

## Usage Examples

### Creating a Case

```javascript
const tx = await contract.createCase(
    ["0xParty1...", "0xParty2...", "0xParty3..."],
    50000,    // Base fee
    75,       // Complexity (0-100)
    "Complex commercial litigation"
);
```

### Setting Responsibilities

```javascript
await contract.setResponsibilityRatio(caseId, party1Address, 40); // 40%
await contract.setResponsibilityRatio(caseId, party2Address, 35); // 35%
await contract.setResponsibilityRatio(caseId, party3Address, 25); // 25%
```

### Recording Time

```javascript
await contract.updateTimeSpent(caseId, 120); // 120 hours
```

### Calculating Fees

```javascript
await contract.calculateFeeAllocation(caseId);
// Fees are now calculated and encrypted for each party
```

### Recording Payment

```javascript
// Party records their payment
await contract.connect(partySigner).recordPayment(caseId);
```

## Fee Calculation Formula

The system calculates final fees using the following formula:

```
Complexity Factor = (complexity / 10) * 1000
Time Factor = (timeSpent / 40) * 500
Adjusted Fee = Base Fee + Complexity Factor + Time Factor

Party Allocation = Adjusted Fee * (Party Responsibility / 100)
```

All calculations are performed on encrypted values using homomorphic encryption.

## Events

The contract emits the following events:

- `CaseCreated(uint256 caseId, bytes32 caseHash, uint256 partyCount)`
- `FeeCalculated(uint256 caseId, address calculator)`
- `AllocationUpdated(uint256 caseId, address party)`
- `PaymentRecorded(uint256 caseId, address party)`
- `CaseSettled(uint256 caseId, uint256 settlementTime)`
- `ResponsibilityDistributed(uint256 caseId, uint256 partyCount)`

## Testing

```bash
# Run test suite
npm run test

# Run with coverage
npm run test:coverage

# Run specific test
npx hardhat test test/ConfidentialLegalFeeAllocation.test.js
```

## Deployment Information

After deployment, contract information is saved to:
- `deployments/sepolia_deployment.json`

Example deployment data:
```json
{
  "contractName": "ConfidentialLegalFeeAllocation",
  "contractAddress": "0x...",
  "network": "sepolia",
  "chainId": 11155111,
  "deployer": "0x...",
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x..."
}
```

## Security Considerations

### Privacy Guarantees
- Individual fee amounts are never exposed on-chain
- Only encrypted ciphertext is stored
- Parties can only decrypt their own allocations
- Admin cannot view individual encrypted amounts

### Access Control
- Only admin can create cases and set parameters
- Only case parties can record payments
- Modifiers enforce authorization checks
- Emergency settlement requires admin role

### Data Integrity
- Case hashes prevent tampering
- All state changes emit events
- Immutable blockchain storage
- Automated settlement when conditions met

## Gas Optimization

The contract implements several gas optimization techniques:
- Efficient struct packing
- Minimal storage reads
- Batch operations where possible
- Event emission for off-chain indexing

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

## Roadmap

- [ ] Multi-signature admin control
- [ ] Upgradeable proxy pattern
- [ ] Payment escrow functionality
- [ ] Dispute resolution mechanism
- [ ] Integration with legal document storage (IPFS)
- [ ] Mobile application interface
- [ ] Advanced analytics dashboard
- [ ] Mainnet deployment

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
- Review Hardhat documentation
- Visit Zama fhEVM docs

## Acknowledgments

- **Zama** - For fhEVM technology enabling confidential smart contracts
- **Hardhat** - For the excellent development framework
- **Ethereum Foundation** - For the Sepolia testnet
- **OpenZeppelin** - For security best practices

## Disclaimer

This software is provided "as is" without warranty of any kind. This is experimental technology using cutting-edge cryptographic techniques. Use at your own risk and always audit code before production deployment.

---

Built with ❤️ using Zama fhEVM and Hardhat
