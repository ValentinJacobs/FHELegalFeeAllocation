'use client';

import { useState, useCallback } from 'react';
import { useFHEContext } from '../components/fhe/FHEProvider';
import { FHEDataType, EncryptedData } from '../lib/fhe/types';
import { validateFormInput } from '../lib/utils/validation';

/**
 * useEncryption - Hook for encryption operations
 * Simplified encryption with built-in validation
 */
export function useEncryption() {
  const { client, isInitialized } = useFHEContext();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EncryptedData | null>(null);

  const encryptValue = useCallback(
    async (
      value: any,
      type: FHEDataType,
      contractAddress: string,
      userAddress: string
    ): Promise<EncryptedData> => {
      if (!client || !isInitialized) {
        throw new Error('FHEVM client not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        // Validate input
        const validation = validateFormInput(String(value), type);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid input');
        }

        const input = client.createEncryptedInput(contractAddress, userAddress);

        // Add value based on type
        const parsedValue = validation.parsed;
        switch (type) {
          case 'uint8':
            input.add8(parsedValue);
            break;
          case 'uint16':
            input.add16(parsedValue);
            break;
          case 'uint32':
            input.add32(parsedValue);
            break;
          case 'uint64':
            input.add64(parsedValue);
            break;
          case 'bool':
            input.addBool(parsedValue);
            break;
          case 'address':
            input.addAddress(parsedValue);
            break;
        }

        const encrypted = input.encrypt();

        const encryptedData: EncryptedData = {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          type,
        };

        setResult(encryptedData);
        return encryptedData;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Encryption failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client, isInitialized]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    encryptValue,
    isEncrypting,
    error,
    result,
    clearResult,
    isReady: isInitialized,
  };
}
