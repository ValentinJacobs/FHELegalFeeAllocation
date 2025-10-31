# Node.js CLI + FHEVM SDK Example

A Node.js CLI application demonstrating framework-agnostic FHEVM SDK usage.

## Features

- ✓ Pure Node.js (no browser dependencies)
- ✓ FHEVM client initialization
- ✓ Interactive CLI interface
- ✓ Encryption of values
- ✓ TypeScript support
- ✓ Framework-agnostic SDK usage

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run CLI

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Usage

When you run the CLI, you'll be prompted to:

1. Enter RPC URL (or use default)
2. Enter your private key
3. Enter contract address
4. Select network

Then you can:
- Encrypt values
- View client information
- Exit

## Example Session

```
=== FHEVM CLI Configuration ===

Enter RPC URL (default: http://localhost:8545):
Enter private key: 0x...
Enter contract address: 0x...
Enter network (default: sepolia):

=== Initializing FHEVM Client ===

Wallet address: 0x...
✓ FHEVM client initialized successfully

=== FHEVM CLI Menu ===
1. Encrypt a value
2. Show client info
3. Exit

Choose an option: 1

=== Encrypt Value ===

Enter value to encrypt (uint32): 100

✓ Encryption successful:
  Handle: 0x...
  Proof: 0x...
  Proof length: 1234 bytes
```

## SDK Integration

This example shows how to use @fhevm/sdk in a Node.js environment:

```typescript
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Create provider and wallet
const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

// Initialize client
const client = await FhevmClient.create({
  provider: provider,
  network: 'sepolia',
});

// Encrypt data
const input = client.createEncryptedInput(contractAddress, wallet.address);
input.add32(value);
const encrypted = input.encrypt();
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Node.js Documentation](https://nodejs.org)
- [Ethers.js Documentation](https://docs.ethers.org)
