# Examples

Common use cases and code examples for the FHEVM SDK.

## Table of Contents

1. [Basic Encryption & Decryption](#basic-encryption--decryption)
2. [Multiple Encrypted Inputs](#multiple-encrypted-inputs)
3. [Contract Integration](#contract-integration)
4. [React Integration](#react-integration)
5. [Vue.js Integration](#vuejs-integration)
6. [Node.js CLI](#nodejs-cli)
7. [Error Handling](#error-handling)
8. [Advanced Patterns](#advanced-patterns)

---

## Basic Encryption & Decryption

### Simple Encryption

```typescript
import { FhevmClient } from '@fhevm/sdk';

const client = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
});

// Encrypt different types
const encryptedUint32 = await client.encrypt.uint32(100);
const encryptedUint64 = await client.encrypt.uint64(1000n);
const encryptedBool = await client.encrypt.bool(true);
const encryptedAddress = await client.encrypt.address('0x123...');

console.log('Encrypted uint32:', encryptedUint32.handle);
```

### Simple Decryption

```typescript
// User decryption (requires signature)
const value = await client.decrypt.uint32(
  encryptedHandle,
  contractAddress
);

console.log('Decrypted value:', value);

// Public decryption (no signature)
const publicValue = await client.publicDecrypt.uint64(encryptedHandle);
```

---

## Multiple Encrypted Inputs

### Creating Multiple Inputs

```typescript
const input = client.createEncryptedInput(
  contractAddress,
  userAddress
);

// Chain multiple additions
input
  .add32(100)
  .add64(1000n)
  .addBool(true)
  .addAddress('0x123...');

// Encrypt all at once
const { handles, inputProof } = input.encrypt();

// Use in contract
await contract.processMultiple(
  handles[0],   // uint32
  handles[1],   // uint64
  handles[2],   // bool
  handles[3],   // address
  inputProof
);
```

---

## Contract Integration

### Complete Workflow

```typescript
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

// 1. Initialize client
const client = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
});

// 2. Setup contract
const contractABI = [
  'function processValue(uint64 encrypted, bytes calldata proof) external',
  'function getResult() external view returns (uint64)',
];

const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  client.getSigner()
);

// 3. Encrypt input
const encrypted = await client.encrypt.uint64(1000n);

// 4. Call contract
const tx = await contract.processValue(
  encrypted.handle,
  encrypted.proof
);
await tx.wait();

// 5. Get encrypted result
const encryptedResult = await contract.getResult();

// 6. Decrypt result
const result = await client.decrypt.uint64(
  encryptedResult,
  contractAddress
);

console.log('Final result:', result);
```

### Batch Processing

```typescript
async function processBatch(values: number[]) {
  const input = client.createEncryptedInput(contractAddress, userAddress);

  // Add all values
  values.forEach((value) => input.add32(value));

  const { handles, inputProof } = input.encrypt();

  // Process in one transaction
  const tx = await contract.processBatch(handles, inputProof);
  await tx.wait();
}

await processBatch([100, 200, 300, 400, 500]);
```

---

## React Integration

### Complete React Component

```tsx
import { useState, useEffect } from 'react';
import { useFhevmClient, useEncryption, useContract } from '@fhevm/sdk/react';

function EncryptedForm() {
  const { client, initialize, isInitialized } = useFhevmClient();
  const { encrypt, isEncrypting, error: encryptError } = useEncryption(client);
  const { call, isLoading, error: contractError } = useContract(
    client,
    CONTRACT_ADDRESS,
    CONTRACT_ABI
  );

  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    initialize({
      provider: window.ethereum,
      network: 'sepolia',
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Encrypting...');

    // Encrypt value
    const encrypted = await encrypt.uint32(parseInt(value));
    if (!encrypted) {
      setStatus('Encryption failed');
      return;
    }

    setStatus('Sending transaction...');

    // Call contract
    const tx = await call('processValue', [encrypted.handle, encrypted.proof]);
    if (!tx) {
      setStatus('Transaction failed');
      return;
    }

    setStatus('Waiting for confirmation...');
    await tx.wait();

    setStatus('Success!');
    setValue('');
  };

  if (!isInitialized) {
    return <div>Initializing...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value to encrypt"
      />
      <button
        type="submit"
        disabled={isEncrypting || isLoading}
      >
        {isEncrypting ? 'Encrypting...' : 'Submit'}
      </button>

      {status && <p>{status}</p>}
      {encryptError && <p>Error: {encryptError.message}</p>}
      {contractError && <p>Error: {contractError.message}</p>}
    </form>
  );
}
```

### React Context Provider

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { FhevmClient } from '@fhevm/sdk';

const FhevmContext = createContext<FhevmClient | null>(null);

export function FhevmProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<FhevmClient | null>(null);

  useEffect(() => {
    async function init() {
      const newClient = await FhevmClient.create({
        provider: window.ethereum,
        network: 'sepolia',
      });
      setClient(newClient);
    }
    init();
  }, []);

  return (
    <FhevmContext.Provider value={client}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }
  return context;
}
```

---

## Vue.js Integration

### Vue Composition API

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="value" type="number" placeholder="Enter value" />
      <button :disabled="isEncrypting || isLoading">
        {{ isEncrypting ? 'Encrypting...' : 'Submit' }}
      </button>
    </form>
    <p v-if="status">{{ status }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

const client = ref(null);
const value = ref('');
const status = ref('');
const isEncrypting = ref(false);
const isLoading = ref(false);

onMounted(async () => {
  client.value = await FhevmClient.create({
    provider: window.ethereum,
    network: 'sepolia',
  });
});

async function handleSubmit() {
  isEncrypting.value = true;
  status.value = 'Encrypting...';

  try {
    // Encrypt
    const encrypted = await client.value.encrypt.uint32(parseInt(value.value));

    // Setup contract
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      client.value.getSigner()
    );

    isEncrypting.value = false;
    isLoading.value = true;
    status.value = 'Sending transaction...';

    // Call contract
    const tx = await contract.processValue(encrypted.handle, encrypted.proof);
    await tx.wait();

    status.value = 'Success!';
    value.value = '';
  } catch (error) {
    status.value = `Error: ${error.message}`;
  } finally {
    isEncrypting.value = false;
    isLoading.value = false;
  }
}
</script>
```

---

## Node.js CLI

### Complete CLI Example

```javascript
const { FhevmClient } = require('@fhevm/sdk');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  console.log('Initializing FHEVM client...');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Initialize client
  const client = await FhevmClient.create({
    provider: wallet,
    network: 'sepolia',
  });

  console.log('✅ Client initialized');

  // Encrypt value
  console.log('Encrypting value...');
  const encrypted = await client.encrypt.uint32(100);
  console.log('✅ Encrypted:', encrypted.handle);

  // Setup contract
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ['function processValue(uint64, bytes) external'],
    wallet
  );

  // Send transaction
  console.log('Sending transaction...');
  const tx = await contract.processValue(encrypted.handle, encrypted.proof);
  console.log('Transaction hash:', tx.hash);

  // Wait for confirmation
  console.log('Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log('✅ Confirmed in block:', receipt.blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## Error Handling

### Comprehensive Error Handling

```typescript
async function safeEncryptAndProcess(value: number) {
  try {
    // Validate input
    if (value < 0 || value > 1000000) {
      throw new Error('Value out of range');
    }

    // Check client initialization
    if (!client) {
      throw new Error('Client not initialized');
    }

    // Encrypt with error handling
    let encrypted;
    try {
      encrypted = await client.encrypt.uint32(value);
    } catch (err) {
      throw new Error(`Encryption failed: ${err.message}`);
    }

    // Contract call with error handling
    let tx;
    try {
      tx = await contract.processValue(encrypted.handle, encrypted.proof);
    } catch (err) {
      if (err.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction');
      } else if (err.code === 'USER_REJECTED') {
        throw new Error('Transaction rejected by user');
      } else {
        throw new Error(`Transaction failed: ${err.message}`);
      }
    }

    // Wait for confirmation
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error('Transaction reverted');
    }

    return receipt;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}
```

---

## Advanced Patterns

### Retry Logic

```typescript
async function encryptWithRetry(
  value: number,
  maxRetries: number = 3
): Promise<EncryptedData> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.encrypt.uint32(value);
    } catch (error) {
      lastError = error;
      console.warn(`Encryption attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error(`Encryption failed after ${maxRetries} attempts: ${lastError.message}`);
}
```

### Batch Operations with Progress

```typescript
async function processBatchWithProgress(
  values: number[],
  onProgress: (current: number, total: number) => void
) {
  const results = [];

  for (let i = 0; i < values.length; i++) {
    const encrypted = await client.encrypt.uint32(values[i]);
    const tx = await contract.processValue(encrypted.handle, encrypted.proof);
    await tx.wait();

    results.push(tx.hash);
    onProgress(i + 1, values.length);
  }

  return results;
}

// Usage
await processBatchWithProgress(
  [100, 200, 300],
  (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  }
);
```

### Caching Encrypted Values

```typescript
class EncryptionCache {
  private cache = new Map<string, EncryptedData>();

  async encrypt(client: FhevmClient, value: number): Promise<EncryptedData> {
    const key = `uint32:${value}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const encrypted = await client.encrypt.uint32(value);
    this.cache.set(key, encrypted);

    return encrypted;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new EncryptionCache();
const encrypted = await cache.encrypt(client, 100);
```

---

## See Also

- [Getting Started](./getting-started.md)
- [API Reference](./api-reference.md)
- [Best Practices](./best-practices.md)
