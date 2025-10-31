# React + FHEVM SDK Basic Example

A simple React application demonstrating FHEVM SDK integration using Vite.

## Features

- ✓ FHEVM client initialization
- ✓ Encryption of values
- ✓ MetaMask integration
- ✓ TypeScript support
- ✓ Fast development with Vite

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

## Usage

1. Click "Initialize FHEVM Client" to connect with MetaMask
2. Enter a contract address
3. Enter a value to encrypt
4. Click "Encrypt Value" to see the encrypted result

## SDK Integration

This example shows how to use @fhevm/sdk in a React application:

```typescript
import { FhevmClient } from '@fhevm/sdk';

// Initialize client
const client = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
});

// Encrypt data
const input = client.createEncryptedInput(contractAddress, userAddress);
input.add32(value);
const encrypted = input.encrypt();
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
