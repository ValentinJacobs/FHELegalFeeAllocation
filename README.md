# Confidential Legal Fee Allocation System

A privacy-preserving blockchain solution for transparent and confidential legal fee distribution using Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine) technology.

🎥 **Demo Video**: Download `demo.mp4` to watch the demonstration (video links cannot be opened directly)

🌐 **Live Demo**: [https://fhe-legal-fee-allocation.vercel.app/](https://fhe-legal-fee-allocation.vercel.app/)

📦 **GitHub Repository**: [https://github.com/ValentinJacobs/FHELegalFeeAllocation](https://github.com/ValentinJacobs/FHELegalFeeAllocation)

---

## Overview

The **Confidential Legal Fee Allocation System** enables law firms, legal departments, and mediation services to fairly distribute legal fees among multiple parties while maintaining complete privacy of individual allocations. Using advanced homomorphic encryption, the system ensures that:

- Fee calculations are transparent and verifiable
- Individual party allocations remain confidential
- Only authorized parties can view their own fee amounts
- The entire process is immutable and auditable on the blockchain

---

## Core Concepts

### FHE Contract for Confidential Legal Fee Distribution

This project implements **Fully Homomorphic Encryption (FHE)** to enable **privacy-preserving legal fee calculations** on the blockchain.

#### Key Concepts:

**1. Encrypted Fee Management**
- All fee amounts are encrypted using fhEVM before being stored on-chain
- Calculations are performed on encrypted data without revealing actual values
- Only authorized parties can decrypt their allocated amounts

**2. Privacy-Preserving Calculations**
- **Complexity-based adjustments**: Case complexity factors (0-100) are encrypted
- **Time-based billing**: Billable hours are encrypted and used in calculations
- **Responsibility distribution**: Party responsibility percentages are encrypted
- **Fee allocation**: Final amounts are calculated using homomorphic operations

**3. Confidential Legal Fee Allocation**
- Each party's allocated fee amount remains private
- Only the party can decrypt their own allocation
- Admin cannot see individual encrypted amounts
- Transparent process with private results

**4. Secure Multi-Party Computation**
- Multiple parties can participate without revealing their financial obligations
- Calculations ensure fair distribution based on encrypted responsibility ratios
- Payment tracking maintains privacy while ensuring accountability

#### How FHE Enables Privacy:

```
Traditional Smart Contract:
User Input (100) → Contract Storage (100) → Everyone Can See (100)

FHE Smart Contract:
User Input (100) → Encryption (0xEncrypted...) → Contract Storage (0xEncrypted...)
                                                    ↓
Only Authorized Party Can Decrypt → Decrypted Result (100)
```

#### Privacy Legal Fee Calculation Formula:

All calculations are performed on **encrypted values**:

```
Encrypted Complexity Factor = (encrypted_complexity / 10) * 1000
Encrypted Time Factor = (encrypted_timeSpent / 40) * 500
Encrypted Adjusted Fee = Encrypted Base Fee + Complexity Factor + Time Factor

Encrypted Party Allocation = Encrypted Adjusted Fee * (Encrypted Responsibility / 100)
```

The beauty of FHE is that these calculations happen **without ever decrypting the values**, preserving complete privacy throughout the entire process.

---

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

---

## Technical Stack

### Smart Contract Layer
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract Language**: Solidity ^0.8.24
- **Development Framework**: Hardhat 2.22.x
- **Privacy Technology**: Zama fhEVM
- **Libraries**:
  - @fhevm/solidity (FHE operations)
  - OpenZeppelin security patterns

### Frontend Application Layer
- **Framework**: React 18.2.0 with TypeScript 5.3.0
- **Build Tool**: Vite 5.0.0 (development server on port 3003)
- **Web3 Integration**: ethers.js v6.4.0
- **FHE SDK**: @fhevm/sdk (Zama's encryption library)
- **Deployment**: Vercel (production-ready hosting)
- **Development Tools**:
  - ESLint 8.53.0 with React plugins
  - TypeScript strict mode
  - React Fast Refresh for HMR

---

## Project Structure

```
confidential-legal-fee-allocation/
├── contracts/
│   └── ConfidentialLegalFeeAllocation.sol    # Main FHE smart contract
│
├── react-legal-fee-app/                       # 🆕 React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx              # MetaMask integration
│   │   │   ├── CreateCaseForm.tsx             # Case creation interface
│   │   │   ├── CaseManagement.tsx             # Case operations UI
│   │   │   ├── CasesList.tsx                  # Cases display
│   │   │   └── Header.tsx                     # System stats header
│   │   ├── hooks/
│   │   │   └── useFHE.ts                      # FHE operations React hook
│   │   ├── lib/
│   │   │   └── fhe/
│   │   │       └── client.ts                  # FHE client wrapper
│   │   ├── types/
│   │   │   └── index.ts                       # TypeScript interfaces
│   │   ├── App.tsx                            # Main application
│   │   ├── App.css                            # Styles
│   │   └── main.tsx                           # Entry point
│   ├── public/                                # Static assets
│   ├── index.html                             # Root HTML
│   ├── package.json                           # Frontend dependencies
│   ├── vite.config.ts                         # Vite configuration
│   ├── tsconfig.json                          # TypeScript config
│   ├── vercel.json                            # Vercel deployment
│   └── README.md                              # Frontend docs
│
├── scripts/
│   ├── deploy.js           # Deployment script
│   ├── verify.js           # Etherscan verification
│   ├── interact.js         # Interactive testing
│   └── simulate.js         # Scenario simulations
│
├── test/
│   ├── ConfidentialLegalFeeAllocation.test.js  # Unit tests
│   ├── IntegrationWorkflow.test.js             # Integration tests
│   ├── EdgeCasesAndSecurity.test.js            # Security tests
│   └── helpers.js                               # Test utilities
│
├── .github/
│   └── workflows/          # CI/CD automation
├── deployments/            # Deployment records (generated)
├── reports/                # Simulation reports (generated)
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Root dependencies and scripts
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deployment guide
├── TESTING.md              # Testing documentation
├── demo.mp4               # Video demonstration
└── README.md              # This file
```

---

## Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- Ethereum wallet with Sepolia ETH (MetaMask recommended)
- Etherscan API key (for contract verification)

### Installation

#### Smart Contract Setup

```bash
# Clone the repository
git clone https://github.com/ValentinJacobs/FHELegalFeeAllocation
cd FHELegalFeeAllocation

# Install smart contract dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

#### React Frontend Setup

```bash
# Navigate to React app directory
cd react-legal-fee-app

# Install frontend dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3003
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

### Testing

```bash
# Run all tests (75+ test cases)
npm run test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run test:gas
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

---

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
Creates a new legal case with encrypted fee parameters.

**updateTimeSpent**
```solidity
function updateTimeSpent(
    uint256 _caseId,
    uint32 _additionalHours
) external onlyAdmin
```
Records additional billable hours (encrypted).

**setResponsibilityRatio**
```solidity
function setResponsibilityRatio(
    uint256 _caseId,
    address _party,
    uint32 _responsibility
) external onlyAdmin
```
Assigns encrypted responsibility percentage to a party.

**calculateFeeAllocation**
```solidity
function calculateFeeAllocation(
    uint256 _caseId
) external onlyAdmin
```
Performs encrypted calculations to distribute fees.

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
Retrieves public case information (encrypted amounts remain private).

**getPartyAllocation**
```solidity
function getPartyAllocation(
    uint256 _caseId,
    address _party
) external view returns (...)
```
Gets payment status for a party.

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

---

## React Frontend Application

### Overview

The **react-legal-fee-app** is a modern, production-ready web application built with React 18 and TypeScript that provides a user-friendly interface for interacting with the Confidential Legal Fee Allocation smart contract. It enables legal professionals to manage cases with complete privacy using Zama's FHE technology.

### Architecture

The frontend follows a component-based architecture with clear separation of concerns:

```
React App Architecture
├── Components Layer          # UI components
│   ├── WalletConnect        # MetaMask integration
│   ├── CreateCaseForm       # Case creation interface
│   ├── CaseManagement       # Case operations
│   ├── CasesList            # Cases display
│   └── Header               # System statistics
│
├── Hooks Layer              # Custom React hooks
│   └── useFHE               # FHE operations hook
│
├── Library Layer            # Core functionality
│   └── fhe/client           # FHE client wrapper
│
└── Types Layer              # TypeScript definitions
    └── interfaces           # Type safety
```

### Key Features

#### 1. Wallet Integration
- **MetaMask Connection**: One-click wallet connection
- **Network Detection**: Automatic Sepolia testnet detection
- **Account Management**: Real-time account change detection
- **Chain Validation**: Ensures correct network usage

#### 2. Case Creation
- **Multi-Party Setup**: Add multiple parties to a legal case
- **Encrypted Fee Input**: Total fee amount encrypted before submission
- **Complexity Rating**: Case complexity (1-100) encrypted
- **Description**: Plain text case description
- **Real-time Validation**: Input validation before submission

#### 3. Case Management Operations

**Time Tracking**
```typescript
// Add billable hours (encrypted)
await contract.updateTimeSpent(caseId, additionalHours);
```

**Responsibility Distribution**
```typescript
// Set party responsibility percentage (encrypted)
await contract.setResponsibilityRatio(caseId, partyAddress, percentage);
```

**Fee Calculation**
```typescript
// Calculate encrypted fee allocations
await contract.calculateFeeAllocation(caseId);
```

**Payment Recording**
```typescript
// Record payment completion
await contract.recordPayment(caseId);
```

**Emergency Settlement**
```typescript
// Admin-only emergency settlement
await contract.emergencySettleCase(caseId);
```

#### 4. Client-Side Encryption

The app uses **@fhevm/sdk** for client-side encryption:

```typescript
// Initialize FHE client
const fheClient = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
  gatewayUrl: 'https://gateway.zama.ai'
});

// Encrypt uint64 values (fees)
const encryptedFee = await fheClient.encrypt.uint64(totalFeeInWei);

// Encrypt uint32 values (complexity, hours, responsibility)
const encryptedComplexity = await fheClient.encrypt.uint32(complexityScore);

// Use encrypted data in contract call
await contract.createCase(
  parties,
  encryptedFee.handle,
  encryptedComplexity.handle,
  description,
  encryptedFee.proof
);
```

#### 5. System Statistics Dashboard

Real-time statistics display:
- **Total Cases**: All cases created
- **Active Cases**: Currently processing
- **Settled Cases**: Completed cases

### Tech Stack Details

**Core Framework**
- React 18.2.0 with Hooks API
- TypeScript 5.3.0 (strict mode)
- Vite 5.0.0 for blazing-fast HMR

**Web3 Integration**
- ethers.js 6.4.0 for blockchain interaction
- @fhevm/sdk for FHE encryption/decryption
- MetaMask as Web3 provider

**Development Experience**
- Hot Module Replacement (HMR)
- TypeScript IntelliSense
- ESLint for code quality
- Component-based architecture

**Deployment**
- Vercel hosting
- Automatic deployments from Git
- Production-optimized builds
- CDN distribution

### Component Documentation

#### WalletConnect Component

Handles MetaMask wallet connection and account management.

**Features:**
- Connect/disconnect wallet
- Display connected address
- Network detection
- Account change listeners

**Usage:**
```tsx
<WalletConnect
  onConnect={handleWalletConnect}
  onDisconnect={handleWalletDisconnect}
/>
```

#### CreateCaseForm Component

Form for creating new legal cases with encrypted data.

**Features:**
- Multi-party address input
- Fee amount encryption (Wei conversion)
- Complexity slider (1-100)
- Case description field
- Form validation

**Encrypted Fields:**
- Total Fee (euint64)
- Complexity Score (euint32)

#### CaseManagement Component

Interface for managing existing cases.

**Operations:**
- Add work hours
- Set responsibility ratios
- Calculate allocations
- Record payments
- Emergency settlement

#### CasesList Component

Displays all cases with details.

**Information Shown:**
- Case ID and status
- Party addresses
- Creation timestamp
- Settlement status
- Case hash

#### Header Component

Shows system-wide statistics.

**Metrics:**
- Total cases count
- Active cases count
- Settled cases count

### Custom Hooks

#### useFHE Hook

React hook for FHE operations with state management.

**API:**
```typescript
const {
  fheClient,           // FHE client instance
  isInitialized,       // Initialization status
  error,               // Error state
  initializeFHE,       // Initialize client
  encryptUint32,       // Encrypt uint32
  encryptUint64,       // Encrypt uint64
  encryptBool          // Encrypt boolean
} = useFHE();
```

**Example:**
```tsx
function MyComponent() {
  const { fheClient, initializeFHE, encryptUint64 } = useFHE();

  useEffect(() => {
    initializeFHE(window.ethereum);
  }, []);

  const handleSubmit = async (fee: bigint) => {
    const encrypted = await encryptUint64(fee);
    await contract.createCase(..., encrypted.handle, encrypted.proof);
  };
}
```

### Running the Frontend

**Development Mode:**
```bash
cd react-legal-fee-app
npm run dev
```
Access at `http://localhost:3003`

**Production Build:**
```bash
npm run build
# Output in dist/ directory
```

**Preview Production Build:**
```bash
npm run preview
```

### Contract Integration

The frontend connects to the deployed smart contract:

**Contract Address (Sepolia):**
```
0x462368e2BeFEb579927821a6bdd571C68dA2EB26
```

**Integration Code:**
```typescript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);
```

### Privacy Flow in Frontend

```
User Input → Client-Side Encryption → Smart Contract → On-Chain Storage
   ↓                ↓                        ↓              ↓
 Plain Text    FHE SDK Encrypt         Encrypted Data   Encrypted State
  (100 ETH)    → (0xEncrypted...)    → euint64        → Permanent Storage

Only authorized parties can decrypt their allocated amounts
```

### Environment Variables

Frontend environment configuration:

```env
VITE_CONTRACT_ADDRESS=0x462368e2BeFEb579927821a6bdd571C68dA2EB26
VITE_NETWORK=sepolia
VITE_GATEWAY_URL=https://gateway.zama.ai
```

### Deployment

**Vercel Deployment:**

1. Connect GitHub repository to Vercel
2. Set build configuration:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. Configure environment variables in Vercel dashboard

4. Deploy automatically on Git push

**Live Demo:**
- URL: https://fhe-legal-fee-allocation.vercel.app/
- Network: Sepolia Testnet
- Contract: Pre-deployed and verified

---

## Usage Examples

### Creating a Case with Encrypted Data

```javascript
// All sensitive data is encrypted before being stored
const tx = await contract.createCase(
    ["0xParty1...", "0xParty2...", "0xParty3..."],
    50000,    // Base fee (will be encrypted)
    75,       // Complexity 0-100 (will be encrypted)
    "Complex commercial litigation"
);
```

### Setting Encrypted Responsibilities

```javascript
// Responsibility percentages are encrypted
await contract.setResponsibilityRatio(caseId, party1Address, 40); // 40%
await contract.setResponsibilityRatio(caseId, party2Address, 35); // 35%
await contract.setResponsibilityRatio(caseId, party3Address, 25); // 25%
```

### Recording Encrypted Time

```javascript
// Billable hours are encrypted
await contract.updateTimeSpent(caseId, 120); // 120 hours
```

### Calculating Encrypted Fees

```javascript
// All calculations performed on encrypted values
await contract.calculateFeeAllocation(caseId);
// Each party's fee is now calculated and encrypted
```

### Recording Payment

```javascript
// Party records their payment
await contract.connect(partySigner).recordPayment(caseId);
```

---

## Privacy-Preserving Fee Calculation

The system performs all calculations on encrypted values using FHE:

```
Step 1: Encrypt Input Data
  Base Fee (50000) → euint64
  Complexity (75) → euint32
  Time (120 hours) → euint32

Step 2: Calculate on Encrypted Values
  Complexity Factor = (encrypted_75 / 10) * 1000 = encrypted_7500
  Time Factor = (encrypted_120 / 40) * 500 = encrypted_1500
  Adjusted Fee = encrypted_50000 + encrypted_7500 + encrypted_1500

Step 3: Distribute Encrypted Fees
  Party 1 (40%) = encrypted_AdjustedFee * encrypted_40 / 100
  Party 2 (35%) = encrypted_AdjustedFee * encrypted_35 / 100
  Party 3 (25%) = encrypted_AdjustedFee * encrypted_25 / 100

Step 4: Decryption (Only by Authorized Party)
  Party 1 can decrypt their own allocation
  Party 2 can decrypt their own allocation
  Party 3 can decrypt their own allocation
  Admin cannot decrypt individual allocations
```

---

## Events

The contract emits the following events:

- `CaseCreated(uint256 caseId, bytes32 caseHash, uint256 partyCount)`
- `FeeCalculated(uint256 caseId, address calculator)`
- `AllocationUpdated(uint256 caseId, address party)`
- `PaymentRecorded(uint256 caseId, address party)`
- `CaseSettled(uint256 caseId, uint256 settlementTime)`
- `ResponsibilityDistributed(uint256 caseId, uint256 partyCount)`

---

## Testing & Quality Assurance

The project includes comprehensive testing:

- **75+ Test Cases** covering all functionality
- **Unit Tests**: Individual function testing
- **Integration Tests**: Complete workflow testing
- **Security Tests**: Edge cases and attack vectors
- **>95% Code Coverage**: Ensuring quality
- **CI/CD Automation**: Automated testing on every commit

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Run with gas analysis
npm run test:gas
```

---

## Security Considerations

### Privacy Guarantees
- Individual fee amounts are never exposed on-chain
- Only encrypted ciphertext is stored
- Parties can only decrypt their own allocations
- Admin cannot view individual encrypted amounts
- All calculations preserve encryption

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

---

## Available Scripts

### Smart Contract Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test
npm run test:unit
npm run test:integration
npm run test:security
npm run test:coverage
npm run test:gas

# Deploy
npm run deploy
npm run deploy:local

# Verify contract
npm run verify

# Interact with contract
npm run interact
npm run simulate

# Start local node
npm run node

# Clean artifacts
npm run clean
```

### React Frontend Commands

```bash
# Navigate to frontend directory
cd react-legal-fee-app

# Development server (port 3003)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Code Quality

```bash
# Lint JavaScript
npm run lint
npm run lint:fix

# Lint Solidity
npm run lint:sol
npm run lint:sol:fix

# Format code
npm run format
npm run format:check

# Security audit
npm run audit
npm run security
```

---

## Live Demo

Visit the live application to see the system in action:

**Web Application**: [https://fhe-legal-fee-allocation.vercel.app/](https://fhe-legal-fee-allocation.vercel.app/)

**Demo Video**: Download `demo.mp4` from the repository to watch a comprehensive demonstration of all features.

**GitHub Repository**: [https://github.com/ValentinJacobs/FHELegalFeeAllocation](https://github.com/ValentinJacobs/FHELegalFeeAllocation)

---

## Documentation

Comprehensive documentation is available:

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment guide
- **[TESTING.md](TESTING.md)** - Testing documentation
- **[SECURITY_AND_PERFORMANCE.md](SECURITY_AND_PERFORMANCE.md)** - Security audit and optimization guide
- **[TOOLCHAIN.md](TOOLCHAIN.md)** - Complete toolchain integration
- **[CI_CD.md](CI_CD.md)** - CI/CD pipeline documentation

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Run linting and formatting
6. Submit a pull request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For questions, issues, or feature requests:
- **GitHub Issues**: [https://github.com/ValentinJacobs/FHELegalFeeAllocation/issues](https://github.com/ValentinJacobs/FHELegalFeeAllocation/issues)
- **Documentation**: Check the docs folder
- **Zama fhEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)

---

## Acknowledgments

- **Zama** - For fhEVM technology enabling confidential smart contracts
- **Hardhat** - For the excellent development framework
- **Ethereum Foundation** - For the Sepolia testnet
- **OpenZeppelin** - For security best practices

---

## Disclaimer

This software is provided "as is" without warranty of any kind. This is experimental technology using cutting-edge cryptographic techniques. Use at your own risk and always audit code before production deployment.

---

**Built with ❤️ using Zama fhEVM and Hardhat**
