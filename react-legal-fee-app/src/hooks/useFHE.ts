import { useState, useCallback } from 'react';
import {
  initializeFHEClient,
  getFHEClient,
  encryptUint32,
  encryptUint64,
  encryptBool,
  decryptUint32,
  decryptUint64,
  publicDecryptUint32,
  publicDecryptUint64,
  FHEClientConfig,
} from '../lib/fhe/client';

export interface UseFHEResult {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  initialize: (config: FHEClientConfig) => Promise<void>;
  encryptUint32: (value: number, contractAddress: string, userAddress: string) => Promise<{ handle: string; proof: string }>;
  encryptUint64: (value: bigint, contractAddress: string, userAddress: string) => Promise<{ handle: string; proof: string }>;
  encryptBool: (value: boolean, contractAddress: string, userAddress: string) => Promise<{ handle: string; proof: string }>;
  decryptUint32: (handle: string, contractAddress: string, userAddress: string) => Promise<number>;
  decryptUint64: (handle: string, contractAddress: string, userAddress: string) => Promise<bigint>;
  publicDecryptUint32: (handle: string) => Promise<number>;
  publicDecryptUint64: (handle: string) => Promise<bigint>;
}

/**
 * React hook for FHE operations
 */
export function useFHE(): UseFHEResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async (config: FHEClientConfig) => {
    if (isInitialized || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await initializeFHEClient(config);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHE client';
      setError(errorMessage);
      console.error('FHE initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, isInitializing]);

  const handleEncryptUint32 = useCallback(
    async (value: number, contractAddress: string, userAddress: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await encryptUint32(value, contractAddress, userAddress);
    },
    [isInitialized]
  );

  const handleEncryptUint64 = useCallback(
    async (value: bigint, contractAddress: string, userAddress: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await encryptUint64(value, contractAddress, userAddress);
    },
    [isInitialized]
  );

  const handleEncryptBool = useCallback(
    async (value: boolean, contractAddress: string, userAddress: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await encryptBool(value, contractAddress, userAddress);
    },
    [isInitialized]
  );

  const handleDecryptUint32 = useCallback(
    async (handle: string, contractAddress: string, userAddress: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await decryptUint32(handle, contractAddress, userAddress);
    },
    [isInitialized]
  );

  const handleDecryptUint64 = useCallback(
    async (handle: string, contractAddress: string, userAddress: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await decryptUint64(handle, contractAddress, userAddress);
    },
    [isInitialized]
  );

  const handlePublicDecryptUint32 = useCallback(
    async (handle: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await publicDecryptUint32(handle);
    },
    [isInitialized]
  );

  const handlePublicDecryptUint64 = useCallback(
    async (handle: string) => {
      if (!isInitialized) {
        throw new Error('FHE client not initialized');
      }
      return await publicDecryptUint64(handle);
    },
    [isInitialized]
  );

  return {
    isInitialized,
    isInitializing,
    error,
    initialize,
    encryptUint32: handleEncryptUint32,
    encryptUint64: handleEncryptUint64,
    encryptBool: handleEncryptBool,
    decryptUint32: handleDecryptUint32,
    decryptUint64: handleDecryptUint64,
    publicDecryptUint32: handlePublicDecryptUint32,
    publicDecryptUint64: handlePublicDecryptUint64,
  };
}
