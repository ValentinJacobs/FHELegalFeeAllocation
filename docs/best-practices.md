# Best Practices

Guidelines and recommendations for building production-ready confidential dApps with the FHEVM SDK.

## Table of Contents

1. [Security Best Practices](#security-best-practices)
2. [Performance Optimization](#performance-optimization)
3. [Error Handling](#error-handling)
4. [User Experience](#user-experience)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Security Best Practices

### 1. Never Expose Private Keys

```typescript
// ❌ Bad - Hardcoded private key
const wallet = new ethers.Wallet('0x1234...', provider);

// ✅ Good - Use environment variables
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ✅ Better - Use hardware wallets or secure key management
const provider = new ethers.BrowserProvider(window.ethereum);
```

### 2. Validate User Inputs

```typescript
// ✅ Always validate before encryption
function validateValue(value: number): void {
  if (value < 0) {
    throw new Error('Value must be non-negative');
  }
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new Error('Value exceeds maximum safe integer');
  }
}

// Use before encryption
validateValue(userInput);
const encrypted = await client.encrypt.uint32(userInput);
```

### 3. Verify Contract Addresses

```typescript
// ✅ Verify contract address format
import { ethers } from 'ethers';

function validateContractAddress(address: string): void {
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid contract address');
  }
}
```

### 4. Handle Sensitive Data Securely

```typescript
// ✅ Clear sensitive data after use
let privateValue = 123456;
const encrypted = await client.encrypt.uint32(privateValue);

// Clear the original value
privateValue = 0;

// Use the encrypted data
await contract.processValue(encrypted.handle, encrypted.proof);
```

### 5. Implement Access Control

```typescript
// ✅ Verify user authorization before decryption
async function decryptForUser(
  client: FhevmClient,
  encryptedHandle: string,
  contractAddress: string
): Promise<number> {
  // Check if user is authorized
  const userAddress = await client.getSigner().getAddress();
  const isAuthorized = await contract.isAuthorized(userAddress);

  if (!isAuthorized) {
    throw new Error('Unauthorized: User cannot decrypt this value');
  }

  return await client.decrypt.uint32(encryptedHandle, contractAddress);
}
```

---

## Performance Optimization

### 1. Batch Operations

```typescript
// ❌ Bad - Multiple separate transactions
for (const value of values) {
  const encrypted = await client.encrypt.uint32(value);
  const tx = await contract.process(encrypted.handle, encrypted.proof);
  await tx.wait();
}

// ✅ Good - Batch in single transaction
const input = client.createEncryptedInput(contractAddress, userAddress);
values.forEach((v) => input.add32(v));
const { handles, inputProof } = input.encrypt();

const tx = await contract.processBatch(handles, inputProof);
await tx.wait();
```

### 2. Cache Client Instance

```typescript
// ✅ Reuse client instance
let clientInstance: FhevmClient | null = null;

async function getClient(): Promise<FhevmClient> {
  if (!clientInstance) {
    clientInstance = await FhevmClient.create({
      provider: window.ethereum,
      network: 'sepolia',
    });
  }
  return clientInstance;
}
```

### 3. Lazy Initialization

```typescript
// ✅ Initialize only when needed
function App() {
  const [client, setClient] = useState<FhevmClient | null>(null);

  // Don't initialize immediately
  const handleConnect = async () => {
    if (!client) {
      const newClient = await FhevmClient.create({
        provider: window.ethereum,
        network: 'sepolia',
      });
      setClient(newClient);
    }
  };

  return <button onClick={handleConnect}>Connect</button>;
}
```

### 4. Optimize Gas Usage

```typescript
// ✅ Use appropriate data types
// Use smaller types when possible
const encrypted8 = await client.encrypt.uint8(100);   // 0-255
const encrypted16 = await client.encrypt.uint16(1000); // 0-65535
const encrypted32 = await client.encrypt.uint32(100000); // Larger range

// Don't use uint64 if uint32 suffices
```

### 5. Minimize Decryption Operations

```typescript
// ❌ Bad - Decrypt same value multiple times
const value1 = await client.decrypt.uint32(handle, contractAddress);
const value2 = await client.decrypt.uint32(handle, contractAddress);

// ✅ Good - Decrypt once and reuse
const value = await client.decrypt.uint32(handle, contractAddress);
// Use value multiple times
```

---

## Error Handling

### 1. Comprehensive Try-Catch

```typescript
// ✅ Handle all possible errors
async function processValue(value: number) {
  try {
    // Input validation
    if (value < 0) {
      throw new Error('Invalid value');
    }

    // Encryption
    const encrypted = await client.encrypt.uint32(value);

    // Transaction
    const tx = await contract.processValue(encrypted.handle, encrypted.proof);
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error('Transaction reverted');
    }

    return receipt;
  } catch (error: any) {
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Not enough funds');
    } else if (error.code === 'USER_REJECTED') {
      console.error('User rejected transaction');
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}
```

### 2. User-Friendly Error Messages

```typescript
// ✅ Provide clear error messages
function handleError(error: any): string {
  const errorMap: Record<string, string> = {
    'INSUFFICIENT_FUNDS': 'You don\'t have enough funds for this transaction.',
    'USER_REJECTED': 'Transaction was rejected. Please try again.',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'ENCRYPTION_FAILED': 'Failed to encrypt data. Please try again.',
  };

  return errorMap[error.code] || 'An unexpected error occurred.';
}

// Usage
try {
  await processValue(100);
} catch (error: any) {
  const message = handleError(error);
  showToast(message);
}
```

### 3. Retry Logic for Transient Failures

```typescript
// ✅ Implement retry mechanism
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const encrypted = await withRetry(() => client.encrypt.uint32(100));
```

---

## User Experience

### 1. Show Loading States

```tsx
// ✅ Provide feedback during operations
function EncryptButton() {
  const { encrypt, isEncrypting } = useEncryption(client);

  return (
    <button disabled={isEncrypting}>
      {isEncrypting ? (
        <>
          <Spinner /> Encrypting...
        </>
      ) : (
        'Encrypt Value'
      )}
    </button>
  );
}
```

### 2. Display Transaction Progress

```tsx
// ✅ Show multi-step progress
function TransactionProgress() {
  const [step, setStep] = useState(0);

  const steps = [
    'Encrypting data...',
    'Waiting for signature...',
    'Sending transaction...',
    'Confirming...',
    'Complete!',
  ];

  return (
    <div>
      <p>{steps[step]}</p>
      <ProgressBar value={(step / steps.length) * 100} />
    </div>
  );
}
```

### 3. Handle Network Changes

```typescript
// ✅ Detect and handle network changes
function useNetworkChange(onNetworkChange: () => void) {
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        onNetworkChange();
        // Reinitialize client
      });
    }

    return () => {
      window.ethereum?.removeListener('chainChanged', onNetworkChange);
    };
  }, []);
}
```

### 4. Wallet Connection Flow

```typescript
// ✅ Proper wallet connection
async function connectWallet() {
  // Check if wallet is installed
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Check network
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== '0xaa36a7') { // Sepolia
    throw new Error('Please switch to Sepolia network');
  }

  // Initialize client
  return await FhevmClient.create({
    provider: window.ethereum,
    network: 'sepolia',
  });
}
```

---

## Testing

### 1. Unit Testing

```typescript
// ✅ Test encryption/decryption
describe('FHEVM SDK', () => {
  let client: FhevmClient;

  beforeAll(async () => {
    client = await FhevmClient.create({
      provider: mockProvider,
      network: 'localhost',
    });
  });

  it('should encrypt uint32 values', async () => {
    const encrypted = await client.encrypt.uint32(100);
    expect(encrypted.handle).toBeDefined();
    expect(encrypted.proof).toBeDefined();
  });

  it('should decrypt uint32 values', async () => {
    const encrypted = await client.encrypt.uint32(100);
    const decrypted = await client.decrypt.uint32(
      encrypted.handle,
      contractAddress
    );
    expect(decrypted).toBe(100);
  });
});
```

### 2. Integration Testing

```typescript
// ✅ Test end-to-end flow
describe('Contract Integration', () => {
  it('should process encrypted values', async () => {
    // Encrypt
    const encrypted = await client.encrypt.uint32(100);

    // Send transaction
    const tx = await contract.processValue(
      encrypted.handle,
      encrypted.proof
    );
    await tx.wait();

    // Verify result
    const result = await contract.getResult();
    expect(result).toBeDefined();
  });
});
```

### 3. Mock Provider for Testing

```typescript
// ✅ Use mock provider for tests
import { MockProvider } from '@ethersproject/test-helpers';

const mockProvider = new MockProvider();
const [wallet] = mockProvider.getWallets();

const testClient = await FhevmClient.create({
  provider: wallet,
  network: 'localhost',
});
```

---

## Deployment

### 1. Environment Configuration

```typescript
// ✅ Use environment-specific configs
const config = {
  development: {
    network: 'localhost',
    gatewayUrl: 'http://localhost:8080',
  },
  production: {
    network: 'sepolia',
    gatewayUrl: 'https://gateway.zama.ai',
  },
};

const env = process.env.NODE_ENV || 'development';
const clientConfig = config[env];
```

### 2. Contract Address Management

```typescript
// ✅ Centralize contract addresses
const CONTRACT_ADDRESSES = {
  sepolia: '0x123...',
  mainnet: '0x456...',
  localhost: '0x789...',
};

function getContractAddress(network: string): string {
  const address = CONTRACT_ADDRESSES[network];
  if (!address) {
    throw new Error(`No contract address for network: ${network}`);
  }
  return address;
}
```

### 3. Build Optimization

```javascript
// next.config.js
module.exports = {
  // ✅ Optimize for production
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

### 4. Monitoring and Logging

```typescript
// ✅ Implement logging
function logOperation(operation: string, data: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service
    analytics.track(operation, data);
  } else {
    console.log(operation, data);
  }
}

// Usage
logOperation('encryption_started', { value: 100 });
const encrypted = await client.encrypt.uint32(100);
logOperation('encryption_completed', { handle: encrypted.handle });
```

---

## Summary Checklist

### Security ✅
- [ ] Never expose private keys
- [ ] Validate all user inputs
- [ ] Verify contract addresses
- [ ] Handle sensitive data securely
- [ ] Implement access control

### Performance ✅
- [ ] Batch operations when possible
- [ ] Cache client instances
- [ ] Use lazy initialization
- [ ] Optimize gas usage
- [ ] Minimize decryption operations

### Error Handling ✅
- [ ] Comprehensive try-catch blocks
- [ ] User-friendly error messages
- [ ] Retry logic for transient failures
- [ ] Graceful degradation

### User Experience ✅
- [ ] Show loading states
- [ ] Display transaction progress
- [ ] Handle network changes
- [ ] Proper wallet connection flow

### Testing ✅
- [ ] Unit tests for encryption/decryption
- [ ] Integration tests for contracts
- [ ] Mock providers for testing
- [ ] End-to-end testing

### Deployment ✅
- [ ] Environment-specific configuration
- [ ] Contract address management
- [ ] Build optimization
- [ ] Monitoring and logging

---

## See Also

- [Getting Started](./getting-started.md)
- [API Reference](./api-reference.md)
- [Examples](./examples.md)
