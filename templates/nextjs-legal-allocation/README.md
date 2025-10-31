# Next.js Legal Allocation Example

Next.js 14 example demonstrating the FHEVM SDK with Confidential Legal Fee Allocation.

## Features

- ✅ Next.js 14 App Router
- ✅ Server and Client Components
- ✅ FHEVM SDK integration with React hooks
- ✅ TypeScript support
- ✅ Tailwind CSS styling
- ✅ MetaMask wallet connection
- ✅ Encrypted case management
- ✅ Private fee allocation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your deployed contract address:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x_your_contract_address
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## SDK Integration

This example demonstrates the FHEVM SDK integration with Next.js:

### Client Initialization

```typescript
import { useFhevmClient } from '@fhevm/sdk/react';

const { client, initialize } = useFhevmClient();

await initialize({
  provider: window.ethereum,
  network: 'sepolia',
  gatewayUrl: 'https://gateway.zama.ai',
});
```

### Encryption

```typescript
import { useEncryption } from '@fhevm/sdk/react';

const { encrypt } = useEncryption(client);
const encryptedFee = await encrypt.uint64(BigInt(50000));
```

### Contract Interaction

```typescript
import { useContract } from '@fhevm/sdk/react';

const { call } = useContract(client, contractAddress, abi);
const tx = await call('createCase', [parties, fee, complexity, description]);
```

## Project Structure

```
nextjs-legal-allocation/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── WalletConnect.tsx   # Wallet connection
│   ├── CreateCaseForm.tsx  # Case creation with encryption
│   └── CaseList.tsx        # Display cases
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama fhEVM](https://docs.zama.ai/fhevm)

## License

MIT
