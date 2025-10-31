# Deployment Instructions

## Contract Deployment

To deploy the smart contract, you can use any Ethereum development framework like Hardhat or Remix IDE.

### Using Remix IDE (Recommended for beginners)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Upload the `contracts/ConfidentialLegalFeeAllocation.sol` file
3. Compile the contract
4. Connect MetaMask to Sepolia testnet
5. Deploy the contract
6. Copy the deployed contract address

### Using Hardhat

If you prefer using Hardhat, create a new project and copy the contract file, then use standard Hardhat deployment scripts.

## Frontend Deployment

### Deploy to Vercel

1. Push this repository to GitHub
2. Connect your GitHub account to Vercel
3. Import the repository
4. Vercel will automatically detect the configuration
5. Deploy with one click

### Update Contract Address

After deploying the contract, update the `CONTRACT_ADDRESS` in `public/index.html`:

```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
```

## Testing

1. Ensure MetaMask is connected to Sepolia testnet
2. Have some Sepolia ETH for gas fees (get from faucet)
3. Test all functionality: create case, set responsibilities, calculate fees
4. Verify privacy features are working correctly

## Production Considerations

- Deploy contract to Ethereum mainnet for production
- Consider gas optimization for contract functions
- Implement proper access controls
- Add additional security audits for production use
- Monitor contract events for system health