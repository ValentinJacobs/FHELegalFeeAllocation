'use client';

import { useState, useEffect } from 'react';
import { useFhevmClient } from '@fhevm/sdk/react';
import CreateCaseForm from '../components/CreateCaseForm';
import CaseList from '../components/CaseList';
import WalletConnect from '../components/WalletConnect';

export default function Home() {
  const { client, initialize, isInitialized, isLoading, error } = useFhevmClient();
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async (provider: any) => {
    try {
      await initialize({
        provider,
        network: 'sepolia',
        gatewayUrl: 'https://gateway.zama.ai',
      });
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to initialize FHEVM client:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome</h2>
          <p className="text-gray-600 mb-6">
            This dApp demonstrates the FHEVM SDK with confidential legal fee allocation.
            Connect your wallet to get started.
          </p>
          <WalletConnect onConnect={handleConnect} />

          <div className="mt-8 text-left bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Framework-agnostic FHEVM SDK</li>
              <li>✅ Encrypted case management</li>
              <li>✅ Private fee allocation</li>
              <li>✅ Secure payment tracking</li>
              <li>✅ Wagmi-like API</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-600">Initializing FHEVM client...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  if (!isInitialized || !client) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Client not initialized</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium">
          ✅ FHEVM SDK initialized successfully
        </p>
        <p className="text-green-600 text-sm mt-1">
          You can now create cases and manage allocations with full encryption
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <CreateCaseForm client={client} />
        <CaseList client={client} />
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          About the FHEVM SDK
        </h3>
        <p className="text-blue-800 text-sm">
          This example uses the Universal FHEVM SDK - a framework-agnostic development kit
          for building confidential dApps. The SDK provides a wagmi-like API that works
          with React, Next.js, Vue, or any JavaScript environment.
        </p>
      </div>
    </div>
  );
}
