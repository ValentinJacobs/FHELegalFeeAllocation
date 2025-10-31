import { useState, useCallback } from 'react';
import type { FhevmClient } from '../client/FhevmClient';
import type { EncryptedData } from '../types';

/**
 * React hook for encryption operations
 *
 * @example
 * ```tsx
 * function EncryptForm({ client }) {
 *   const { encrypt, isEncrypting, error } = useEncryption(client);
 *
 *   const handleEncrypt = async () => {
 *     const encrypted = await encrypt.uint32(100);
 *     console.log('Encrypted:', encrypted.handle);
 *   };
 *
 *   return (
 *     <button onClick={handleEncrypt} disabled={isEncrypting}>
 *       Encrypt Value
 *     </button>
 *   );
 * }
 * ```
 */
export function useEncryption(client: FhevmClient | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = {
    uint8: useCallback(
      async (value: number): Promise<EncryptedData | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsEncrypting(true);
        setError(null);

        try {
          const encrypted = await client.encrypt.uint8(value);
          return encrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Encryption failed');
          setError(error);
          return null;
        } finally {
          setIsEncrypting(false);
        }
      },
      [client]
    ),

    uint16: useCallback(
      async (value: number): Promise<EncryptedData | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsEncrypting(true);
        setError(null);

        try {
          const encrypted = await client.encrypt.uint16(value);
          return encrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Encryption failed');
          setError(error);
          return null;
        } finally {
          setIsEncrypting(false);
        }
      },
      [client]
    ),

    uint32: useCallback(
      async (value: number): Promise<EncryptedData | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsEncrypting(true);
        setError(null);

        try {
          const encrypted = await client.encrypt.uint32(value);
          return encrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Encryption failed');
          setError(error);
          return null;
        } finally {
          setIsEncrypting(false);
        }
      },
      [client]
    ),

    uint64: useCallback(
      async (value: bigint): Promise<EncryptedData | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsEncrypting(true);
        setError(null);

        try {
          const encrypted = await client.encrypt.uint64(value);
          return encrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Encryption failed');
          setError(error);
          return null;
        } finally {
          setIsEncrypting(false);
        }
      },
      [client]
    ),

    bool: useCallback(
      async (value: boolean): Promise<EncryptedData | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsEncrypting(true);
        setError(null);

        try {
          const encrypted = await client.encrypt.bool(value);
          return encrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Encryption failed');
          setError(error);
          return null;
        } finally {
          setIsEncrypting(false);
        }
      },
      [client]
    ),

    address: useCallback(
      async (value: string): Promise<EncryptedData | null> => {
        if (!client) {
          setError(new Error('Client not initialized'));
          return null;
        }

        setIsEncrypting(true);
        setError(null);

        try {
          const encrypted = await client.encrypt.address(value);
          return encrypted;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Encryption failed');
          setError(error);
          return null;
        } finally {
          setIsEncrypting(false);
        }
      },
      [client]
    ),
  };

  return {
    encrypt,
    isEncrypting,
    error,
  };
}
