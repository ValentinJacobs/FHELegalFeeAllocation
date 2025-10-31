# Getting Started with FHEVM SDK

Quick start guide for building confidential dApps with the Universal FHEVM SDK.

## Installation

### Install the SDK

```bash
npm install @fhevm/sdk ethers
```

For React projects, the SDK includes React hooks:

```bash
npm install @fhevm/sdk ethers react
```

## Basic Usage

### 1. Initialize the Client

```typescript
import { FhevmClient } from '@fhevm/sdk';

const client = await FhevmClient.create({
  provider: window.ethereum,     // Web3 provider
  network: 'sepolia',             // Network name
  gatewayUrl: 'https://gateway.zama.ai',  // Optional
});
```

### 2. Encrypt Data

```typescript
// Encrypt a single value
const encrypted = await client.encrypt.uint32(100);

// Use in contract call
await contract.processValue(
  encrypted.handle,   // Encrypted handle
  encrypted.proof     // Proof for verification
);
```

### 3. Encrypt Multiple Values

```typescript
const input = client.createEncryptedInput(
  contractAddress,
  userAddress
);

// Add multiple values
input.add32(100);
input.add64(1000n);
input.addBool(true);

// Get encrypted data
const { handles, inputProof } = input.encrypt();

// Use in contract
await contract.processMultiple(handles, inputProof);
```

### 4. Decrypt Results

```typescript
// User decryption (requires EIP-712 signature)
const value = await client.decrypt.uint32(
  encryptedHandle,
  contractAddress
);

// Public decryption (no signature)
const publicValue = await client.publicDecrypt.uint64(handle);
```

## React Integration

### Initialize with Hooks

```tsx
import { useFhevmClient } from '@fhevm/sdk/react';

function App() {
  const { client, initialize, isInitialized } = useFhevmClient();

  useEffect(() => {
    initialize({
      provider: window.ethereum,
      network: 'sepolia',
    });
  }, []);

  if (!isInitialized) return <div>Loading...</div>;

  return <div>Ready!</div>;
}
```

### Encryption Hook

```tsx
import { useEncryption } from '@fhevm/sdk/react';

function EncryptForm({ client }) {
  const { encrypt, isEncrypting } = useEncryption(client);

  const handleSubmit = async () => {
    const encrypted = await encrypt.uint32(100);
    // Use encrypted.handle and encrypted.proof
  };

  return (
    <button onClick={handleSubmit} disabled={isEncrypting}>
      Encrypt
    </button>
  );
}
```

### Decryption Hook

```tsx
import { useDecryption } from '@fhevm/sdk/react';

function DecryptValue({ client, handle, contractAddress }) {
  const { decrypt, isDecrypting } = useDecryption(client);
  const [value, setValue] = useState(null);

  const handleDecrypt = async () => {
    const result = await decrypt.uint32(handle, contractAddress);
    setValue(result);
  };

  return (
    <button onClick={handleDecrypt} disabled={isDecrypting}>
      Decrypt
    </button>
  );
}
```

### Contract Hook

```tsx
import { useContract } from '@fhevm/sdk/react';

function ContractInteraction({ client }) {
  const { call, read, isLoading } = useContract(
    client,
    contractAddress,
    contractABI
  );

  const handleCall = async () => {
    const tx = await call('myFunction', [arg1, arg2]);
    await tx.wait();
  };

  const handleRead = async () => {
    const result = await read('myViewFunction', []);
    console.log(result);
  };

  return (
    <div>
      <button onClick={handleCall} disabled={isLoading}>
        Call Function
      </button>
      <button onClick={handleRead} disabled={isLoading}>
        Read Value
      </button>
    </div>
  );
}
```

## Framework-Agnostic Usage

The SDK works in any JavaScript environment:

### Vue.js

```javascript
import { createFhevmClient } from '@fhevm/sdk';

export default {
  data() {
    return {
      client: null,
    };
  },
  async mounted() {
    this.client = await createFhevmClient({
      provider: window.ethereum,
      network: 'sepolia',
    });
  },
  methods: {
    async encryptValue(value) {
      return await this.client.encrypt.uint32(value);
    },
  },
};
```

### Node.js

```javascript
const { FhevmClient } = require('@fhevm/sdk');
const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/...');
  const wallet = new ethers.Wallet(privateKey, provider);

  const client = await FhevmClient.create({
    provider: wallet,
    network: 'sepolia',
  });

  const encrypted = await client.encrypt.uint32(100);
  console.log('Encrypted:', encrypted.handle);
}

main();
```

## Complete Workflow Example

```typescript
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

// 1. Initialize
const client = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
});

// 2. Get contract
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  client.getSigner()
);

// 3. Encrypt inputs
const input = client.createEncryptedInput(
  contractAddress,
  await client.getSigner().getAddress()
);

input.add32(100);
input.add64(1000n);

const { handles, inputProof } = input.encrypt();

// 4. Call contract
const tx = await contract.processData(handles, inputProof);
await tx.wait();

// 5. Get encrypted result
const encryptedResult = await contract.getResult();

// 6. Decrypt
const result = await client.decrypt.uint64(
  encryptedResult,
  contractAddress
);

console.log('Decrypted result:', result);
```

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](./examples.md) - Code examples for common use cases
- [Best Practices](./best-practices.md) - Tips and recommendations

## Troubleshooting

### MetaMask Not Detected

```typescript
if (typeof window.ethereum === 'undefined') {
  console.error('Please install MetaMask');
}
```

### Network Mismatch

```typescript
const network = await client.getProvider().getNetwork();
if (network.chainId !== 11155111n) {
  console.error('Please switch to Sepolia');
}
```

### Encryption Fails

- Ensure the provider is connected
- Check that the user has approved the connection
- Verify the contract address is correct

## Support

- GitHub Issues: [Report issues](https://github.com/...)
- Discord: [Zama Discord](https://discord.gg/zama)
- Documentation: [Zama Docs](https://docs.zama.ai/fhevm)
