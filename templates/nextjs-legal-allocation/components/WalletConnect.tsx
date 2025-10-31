'use client';

import { useState } from 'react';

interface WalletConnectProps {
  onConnect: (provider: any) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Call the parent component's connect handler
      onConnect(window.ethereum);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn btn-primary text-lg px-8 py-3"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Make sure you have:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>MetaMask or compatible wallet installed</li>
          <li>Connected to Sepolia testnet</li>
          <li>Some test ETH for transactions</li>
        </ul>
      </div>
    </div>
  );
}
