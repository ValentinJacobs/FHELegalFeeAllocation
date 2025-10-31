import React from 'react';

interface WalletConnectProps {
  isConnected: boolean;
  walletAddress: string;
  onConnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  walletAddress,
  onConnect,
}) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  return (
    <div className="wallet-info">
      {!isConnected ? (
        <div id="connectWallet">
          <button className="btn" onClick={onConnect}>
            Connect Wallet
          </button>
          <p>Please connect your MetaMask wallet to use this application</p>
        </div>
      ) : (
        <div id="walletConnected">
          <p>
            <strong>Connected Account:</strong> {formatAddress(walletAddress)}
          </p>
          <p>
            <strong>Network:</strong> <span id="networkName">Sepolia Testnet</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
