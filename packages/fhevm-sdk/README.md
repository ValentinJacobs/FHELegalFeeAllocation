# @fhevm/sdk

Universal FHEVM SDK - Framework-agnostic development kit for building confidential dApps with Zama's Fully Homomorphic Encryption technology.

## Features

✅ **Framework Agnostic** - Works with React, Next.js, Vue, Node.js, or any JavaScript environment
✅ **Wagmi-like API** - Familiar patterns for Web3 developers
✅ **Type-Safe** - Full TypeScript support
✅ **React Hooks** - Optional React integration
✅ **Simple API** - < 10 lines to get started

## Installation

```bash
npm install @fhevm/sdk ethers
```

## Quick Start

### Framework-Agnostic Usage

```typescript
import { FhevmClient } from '@fhevm/sdk';

// Initialize client
const client = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
});

// Encrypt data
const encrypted = await client.encrypt.uint32(100);

// Call contract
await contract.processValue(encrypted.handle, encrypted.proof);

// Decrypt result
const result = await client.decrypt.uint32(encryptedResult, contractAddress);
```

### React Usage

```tsx
import { useFhevmClient, useEncryption } from '@fhevm/sdk/react';

function App() {
  const { client, initialize } = useFhevmClient();
  const { encrypt } = useEncryption(client);

  useEffect(() => {
    initialize({
      provider: window.ethereum,
      network: 'sepolia',
    });
  }, []);

  const handleEncrypt = async () => {
    const encrypted = await encrypt.uint32(100);
    console.log('Encrypted:', encrypted.handle);
  };

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

## API Reference

### FhevmClient

Main client for all FHEVM operations.

```typescript
const client = await FhevmClient.create(config);
```

### Encryption

```typescript
// Encrypt individual values
const encrypted = await client.encrypt.uint32(100);
const { handle, proof } = encrypted;

// Create encrypted input with multiple values
const input = client.createEncryptedInput(contractAddress, userAddress);
input.add32(100);
input.add64(1000n);
const { handles, inputProof } = input.encrypt();
```

### Decryption

```typescript
// User decryption (requires EIP-712 signature)
const value = await client.decrypt.uint32(handle, contractAddress);

// Public decryption (no signature)
const publicValue = await client.publicDecrypt.uint64(handle);
```

### React Hooks

```typescript
// Initialize client
const { client, initialize, isInitialized } = useFhevmClient();

// Encryption
const { encrypt, isEncrypting } = useEncryption(client);

// Decryption
const { decrypt, isDecrypting } = useDecryption(client);

// Contract interaction
const { call, read, isLoading } = useContract(client, address, abi);
```

## License

MIT
