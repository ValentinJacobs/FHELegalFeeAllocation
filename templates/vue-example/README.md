# Vue + FHEVM SDK Example

A Vue 3 application demonstrating FHEVM SDK integration using the Composition API.

## Features

- ✓ Vue 3 Composition API
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

The application will be available at `http://localhost:3002`

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

This example shows how to use @fhevm/sdk in a Vue 3 application:

```typescript
import { ref } from 'vue';
import { FhevmClient } from '@fhevm/sdk';

const client = ref<FhevmClient | null>(null);

// Initialize client
const initClient = async () => {
  client.value = await FhevmClient.create({
    provider: window.ethereum,
    network: 'sepolia',
  });
};

// Encrypt data
const encrypt = async (value: number) => {
  const input = client.value!.createEncryptedInput(contractAddress, userAddress);
  input.add32(value);
  const encrypted = input.encrypt();
  return encrypted;
};
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Vue Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)
