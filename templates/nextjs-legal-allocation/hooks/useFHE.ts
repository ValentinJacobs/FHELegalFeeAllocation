'use client';

import { useState, useCallback } from 'react';
import { useFHEContext } from '../components/fhe/FHEProvider';
import { FHEDataType } from '../lib/fhe/types';

/**
 * useFHE - Main hook for FHE operations
 * Provides encryption, decryption, and client management
 */
export function useFHE() {
  const { client, isInitialized, isInitializing, error: contextError, initializeClient } = useFHEContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(
    async (value: any, type: FHEDataType, contractAddress: string, userAddress: string) => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsProcessing(true);
      setError(null);

      try {
        const input = client.createEncryptedInput(contractAddress, userAddress);

        switch (type) {
          case 'uint8':
            input.add8(value);
            break;
          case 'uint16':
            input.add16(value);
            break;
          case 'uint32':
            input.add32(value);
            break;
          case 'uint64':
            input.add64(value);
            break;
          case 'bool':
            input.addBool(value);
            break;
          case 'address':
            input.addAddress(value);
            break;
          default:
            throw new Error(`Unsupported type: ${type}`);
        }

        const encrypted = input.encrypt();

        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Encryption failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [client, isInitialized]
  );

  const decrypt = useCallback(
    async (handle: string, type: FHEDataType, contractAddress: string, userAddress: string) => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsProcessing(true);
      setError(null);

      try {
        let result: any;

        switch (type) {
          case 'uint8':
            result = await client.decrypt.uint8(handle, contractAddress, userAddress);
            break;
          case 'uint16':
            result = await client.decrypt.uint16(handle, contractAddress, userAddress);
            break;
          case 'uint32':
            result = await client.decrypt.uint32(handle, contractAddress, userAddress);
            break;
          case 'uint64':
            result = await client.decrypt.uint64(handle, contractAddress, userAddress);
            break;
          case 'bool':
            result = await client.decrypt.bool(handle, contractAddress, userAddress);
            break;
          case 'address':
            result = await client.decrypt.address(handle, contractAddress, userAddress);
            break;
          default:
            throw new Error(`Unsupported type: ${type}`);
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Decryption failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [client, isInitialized]
  );

  const publicDecrypt = useCallback(
    async (handle: string, type: FHEDataType) => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsProcessing(true);
      setError(null);

      try {
        let result: any;

        switch (type) {
          case 'uint32':
            result = await client.publicDecrypt.uint32(handle);
            break;
          case 'uint64':
            result = await client.publicDecrypt.uint64(handle);
            break;
          default:
            throw new Error(`Public decrypt not supported for type: ${type}`);
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Public decryption failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [client, isInitialized]
  );

  return {
    client,
    isInitialized,
    isInitializing,
    isProcessing,
    error: error || contextError,
    encrypt,
    decrypt,
    publicDecrypt,
    initializeClient,
  };
}
