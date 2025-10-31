# API Reference

Complete API documentation for the Universal FHEVM SDK.

## Core Classes

### FhevmClient

Main client class for all FHEVM operations.

#### `FhevmClient.create(config)`

Create a new FhevmClient instance.

**Parameters:**

```typescript
interface FhevmConfig {
  provider: any;            // Web3 provider
  network: string;          // Network name (e.g., 'sepolia')
  gatewayUrl?: string;      // Optional: Gateway URL for decryption
  chainId?: number;         // Optional: Chain ID
}
```

**Returns:** `Promise<FhevmClient>`

**Example:**

```typescript
const client = await FhevmClient.create({
  provider: window.ethereum,
  network: 'sepolia',
  gatewayUrl: 'https://gateway.zama.ai',
});
```

#### `client.createEncryptedInput(contractAddress, userAddress)`

Create an encrypted input builder for multiple values.

**Parameters:**
- `contractAddress: string` - Contract address to encrypt for
- `userAddress?: string` - User address (defaults to signer)

**Returns:** `EncryptedInput`

**Example:**

```typescript
const input = client.createEncryptedInput(
  '0x123...',
  '0xabc...'
);
```

#### `client.encrypt`

Encryption utilities for individual values.

**Methods:**

```typescript
encrypt.uint8(value: number): Promise<EncryptedData>
encrypt.uint16(value: number): Promise<EncryptedData>
encrypt.uint32(value: number): Promise<EncryptedData>
encrypt.uint64(value: bigint): Promise<EncryptedData>
encrypt.bool(value: boolean): Promise<EncryptedData>
encrypt.address(value: string): Promise<EncryptedData>
```

**Returns:**

```typescript
interface EncryptedData {
  handle: string;    // Encrypted handle for contract
  proof: string;     // Proof for verification
  value: any;        // Original value (reference)
}
```

**Example:**

```typescript
const encrypted = await client.encrypt.uint32(100);
await contract.processValue(encrypted.handle, encrypted.proof);
```

#### `client.decrypt`

Decryption utilities (requires EIP-712 signature).

**Methods:**

```typescript
decrypt.uint8(handle, contractAddress, userAddress?): Promise<number>
decrypt.uint16(handle, contractAddress, userAddress?): Promise<number>
decrypt.uint32(handle, contractAddress, userAddress?): Promise<number>
decrypt.uint64(handle, contractAddress, userAddress?): Promise<bigint>
decrypt.bool(handle, contractAddress, userAddress?): Promise<boolean>
decrypt.address(handle, contractAddress, userAddress?): Promise<string>
```

**Parameters:**
- `handle: string` - Encrypted handle from contract
- `contractAddress: string` - Contract address
- `userAddress?: string` - User address (defaults to signer)

**Example:**

```typescript
const value = await client.decrypt.uint32(
  encryptedHandle,
  contractAddress
);
```

#### `client.publicDecrypt`

Public decryption utilities (no signature required).

**Methods:**

```typescript
publicDecrypt.uint32(handle: string): Promise<number>
publicDecrypt.uint64(handle: string): Promise<bigint>
```

**Example:**

```typescript
const publicValue = await client.publicDecrypt.uint64(handle);
```

#### `client.getProvider()`

Get the ethers provider.

**Returns:** `ethers.BrowserProvider`

#### `client.getSigner()`

Get the ethers signer.

**Returns:** `ethers.Signer`

#### `client.getNetwork()`

Get the network name.

**Returns:** `string`

---

## EncryptedInput Interface

Builder for creating multiple encrypted inputs.

### Methods

#### `add8(value: number)`

Add encrypted uint8 value.

**Returns:** `EncryptedInput` (chainable)

#### `add16(value: number)`

Add encrypted uint16 value.

**Returns:** `EncryptedInput` (chainable)

#### `add32(value: number)`

Add encrypted uint32 value.

**Returns:** `EncryptedInput` (chainable)

#### `add64(value: bigint)`

Add encrypted uint64 value.

**Returns:** `EncryptedInput` (chainable)

#### `addBool(value: boolean)`

Add encrypted boolean value.

**Returns:** `EncryptedInput` (chainable)

#### `addAddress(value: string)`

Add encrypted address value.

**Returns:** `EncryptedInput` (chainable)

#### `encrypt()`

Encrypt all added values and get handles.

**Returns:**

```typescript
interface EncryptedResult {
  handles: string[];      // Array of encrypted handles
  inputProof: string;     // Proof for all inputs
}
```

### Example

```typescript
const input = client.createEncryptedInput(contractAddress, userAddress);
input.add32(100);
input.add64(1000n);
input.addBool(true);

const { handles, inputProof } = input.encrypt();

await contract.processMultiple(
  handles[0],
  handles[1],
  handles[2],
  inputProof
);
```

---

## React Hooks

### useFhevmClient()

Hook for managing FHEVM client instance.

**Returns:**

```typescript
{
  client: FhevmClient | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: (config: FhevmConfig) => Promise<void>;
}
```

**Example:**

```typescript
const { client, initialize, isInitialized } = useFhevmClient();

useEffect(() => {
  initialize({
    provider: window.ethereum,
    network: 'sepolia',
  });
}, []);
```

### useEncryption(client)

Hook for encryption operations.

**Parameters:**
- `client: FhevmClient | null`

**Returns:**

```typescript
{
  encrypt: {
    uint8: (value: number) => Promise<EncryptedData | null>;
    uint16: (value: number) => Promise<EncryptedData | null>;
    uint32: (value: number) => Promise<EncryptedData | null>;
    uint64: (value: bigint) => Promise<EncryptedData | null>;
    bool: (value: boolean) => Promise<EncryptedData | null>;
    address: (value: string) => Promise<EncryptedData | null>;
  };
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example:**

```typescript
const { encrypt, isEncrypting } = useEncryption(client);

const handleEncrypt = async () => {
  const encrypted = await encrypt.uint32(100);
  if (encrypted) {
    console.log('Encrypted:', encrypted.handle);
  }
};
```

### useDecryption(client)

Hook for decryption operations.

**Parameters:**
- `client: FhevmClient | null`

**Returns:**

```typescript
{
  decrypt: {
    uint8: (handle, contractAddress, userAddress?) => Promise<number | null>;
    uint16: (handle, contractAddress, userAddress?) => Promise<number | null>;
    uint32: (handle, contractAddress, userAddress?) => Promise<number | null>;
    uint64: (handle, contractAddress, userAddress?) => Promise<bigint | null>;
    bool: (handle, contractAddress, userAddress?) => Promise<boolean | null>;
    address: (handle, contractAddress, userAddress?) => Promise<string | null>;
  };
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**

```typescript
const { decrypt, isDecrypting } = useDecryption(client);

const handleDecrypt = async () => {
  const value = await decrypt.uint32(handle, contractAddress);
  if (value !== null) {
    console.log('Decrypted:', value);
  }
};
```

### useContract(client, contractAddress, abi)

Hook for contract interactions.

**Parameters:**
- `client: FhevmClient | null`
- `contractAddress: string`
- `abi: any[]`

**Returns:**

```typescript
{
  call: (functionName: string, args: any[]) => Promise<ethers.ContractTransactionResponse | null>;
  read: (functionName: string, args: any[]) => Promise<any | null>;
  isLoading: boolean;
  error: Error | null;
}
```

**Example:**

```typescript
const { call, read, isLoading } = useContract(
  client,
  contractAddress,
  contractABI
);

// Call state-changing function
const handleCall = async () => {
  const tx = await call('myFunction', [arg1, arg2]);
  if (tx) {
    await tx.wait();
  }
};

// Read view function
const handleRead = async () => {
  const result = await read('myViewFunction', []);
  console.log(result);
};
```

---

## Type Definitions

### FhevmConfig

```typescript
interface FhevmConfig {
  provider: any;
  network: string;
  gatewayUrl?: string;
  chainId?: number;
}
```

### EncryptedData

```typescript
interface EncryptedData {
  handle: string;
  proof: string;
  value: any;
}
```

### EncryptedResult

```typescript
interface EncryptedResult {
  handles: string[];
  inputProof: string;
}
```

---

## Error Handling

All SDK methods may throw errors. Use try-catch blocks:

```typescript
try {
  const encrypted = await client.encrypt.uint32(100);
} catch (error) {
  console.error('Encryption failed:', error);
}
```

React hooks return errors in their state:

```typescript
const { encrypt, error } = useEncryption(client);

if (error) {
  console.error('Encryption error:', error);
}
```

---

## See Also

- [Getting Started](./getting-started.md)
- [Examples](./examples.md)
- [Best Practices](./best-practices.md)
