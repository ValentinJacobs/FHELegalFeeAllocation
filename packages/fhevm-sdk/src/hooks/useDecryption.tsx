import { useState, useCallback } from 'react';
import type { FhevmClient } from '../client/FhevmClient';

/**
 * React hook for decryption operations
 *
 * @example
 * ```tsx
 * function DecryptValue({ client, encryptedHandle, contractAddress }) {
 *   const { decrypt, isDecrypting, error } = useDecryption(client);
 *   const [value, setValue] = useState(null);
 *
 *   const handleDecrypt = async () => {
 *     const decrypted = await decrypt.uint32(encryptedHandle, contractAddress);
 *     setValue(decrypted);
 *   };
 *
 *   return (
 *     <button onClick={handleDecrypt} disabled={isDecrypting}>
 *       Decrypt Value
 *     </button>
 *   );
 * }
 * ```
 */
export function useDecryption(client: FhevmClient | null) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = {
    uint8: useCallback(
      async (handle: string, contractAddress: string, userAddress?: string): Promise<number | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsDecrypting(true);
        setError(null);

        try {
          const decrypted = await client.decrypt.uint8(handle, contractAddress, userAddress);
          return decrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Decryption failed');
          setError(error);
          return null;
        } finally {
          setIsDecrypting(false);
        }
      },
      [client]
    ),

    uint16: useCallback(
      async (handle: string, contractAddress: string, userAddress?: string): Promise<number | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsDecrypting(true);
        setError(null);

        try {
          const decrypted = await client.decrypt.uint16(handle, contractAddress, userAddress);
          return decrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Decryption failed');
          setError(error);
          return null;
        } finally {
          setIsDecrypting(false);
        }
      },
      [client]
    ),

    uint32: useCallback(
      async (handle: string, contractAddress: string, userAddress?: string): Promise<number | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsDecrypting(true);
        setError(null);

        try {
          const decrypted = await client.decrypt.uint32(handle, contractAddress, userAddress);
          return decrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Decryption failed');
          setError(error);
          return null;
        } finally {
          setIsDecrypting(false);
        }
      },
      [client]
    ),

    uint64: useCallback(
      async (handle: string, contractAddress: string, userAddress?: string): Promise<bigint | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsDecrypting(true);
        setError(null);

        try {
          const decrypted = await client.decrypt.uint64(handle, contractAddress, userAddress);
          return decrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Decryption failed');
          setError(error);
          return null;
        } finally {
          setIsDecrypting(false);
        }
      },
      [client]
    ),

    bool: useCallback(
      async (handle: string, contractAddress: string, userAddress?: string): Promise<boolean | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsDecrypting(true);
        setError(null);

        try {
          const decrypted = await client.decrypt.bool(handle, contractAddress, userAddress);
          return decrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Decryption failed');
          setError(error);
          return null;
        } finally {
          setIsDecrypting(false);
        }
      },
      [client]
    ),

    address: useCallback(
      async (handle: string, contractAddress: string, userAddress?: string): Promise<string | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsDecrypting(true);
        setError(null);

        try {
          const decrypted = await client.decrypt.address(handle, contractAddress, userAddress);
          return decrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Decryption failed');
          setError(error);
          return null;
        } finally {
          setIsDecrypting(false);
        }
      },
      [client]
    ),
  };

  return {
    decrypt,
    isDecrypting,
    error,
  };
}
