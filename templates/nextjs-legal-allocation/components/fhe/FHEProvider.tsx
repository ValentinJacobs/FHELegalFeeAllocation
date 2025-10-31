'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

interface FHEContextType {
  client: FhevmClient | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  initializeClient: () => Promise<void>;
}

const FHEContext = createContext<FHEContextType>({
  client: null,
  isInitialized: false,
  isInitializing: false,
  error: null,
  initializeClient: async () => {},
});

export const useFHEContext = () => {
  const context = useContext(FHEContext);
  if (!context) {
    throw new Error('useFHEContext must be used within FHEProvider');
  }
  return context;
};

interface FHEProviderProps {
  children: ReactNode;
  network?: string;
  gatewayUrl?: string;
  autoInit?: boolean;
}

/**
 * FHEProvider - Context provider for FHEVM client
 * Manages FHEVM client initialization and provides it to child components
 */
export function FHEProvider({
  children,
  network = 'sepolia',
  gatewayUrl = 'https://gateway.zama.ai',
  autoInit = true,
}: FHEProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = async () => {
    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    setError(null);

    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask to use FHE features.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Initialize FHEVM client
      const fhevmClient = await FhevmClient.create({
        provider: window.ethereum,
        network,
        gatewayUrl,
      });

      setClient(fhevmClient);
      setIsInitialized(true);
      console.log('FHEVM client initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHEVM client';
      setError(errorMessage);
      console.error('FHEVM initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (autoInit) {
      initializeClient();
    }
  }, [autoInit]);

  const value: FHEContextType = {
    client,
    isInitialized,
    isInitializing,
    error,
    initializeClient,
  };

  return <FHEContext.Provider value={value}>{children}</FHEContext.Provider>;
}
