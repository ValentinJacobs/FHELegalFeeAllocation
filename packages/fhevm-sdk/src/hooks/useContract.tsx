import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import type { FhevmClient } from '../client/FhevmClient';

/**
 * React hook for interacting with smart contracts
 *
 * @example
 * ```tsx
 * function ContractInteraction({ client, contractAddress, abi }) {
 *   const { call, read, isLoading, error } = useContract(client, contractAddress, abi);
 *
 *   const handleCall = async () => {
 *     const tx = await call('myFunction', [arg1, arg2]);
 *     await tx.wait();
 *   };
 *
 *   const handleRead = async () => {
 *     const result = await read('myViewFunction', []);
 *     console.log('Result:', result);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCall} disabled={isLoading}>Call Function</button>
 *       <button onClick={handleRead} disabled={isLoading}>Read Value</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useContract(
  client: FhevmClient | null,
  contractAddress: string,
  abi: any[]
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(
    async (functionName: string, args: any[]): Promise<ethers.ContractTransactionResponse | null> => {
      if (!client) {
        setError(new Error('Client not initialized'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const contract = new ethers.Contract(
          contractAddress,
          abi,
          client.getSigner()
        );

        const tx = await contract[functionName](...args);
        return tx;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract call failed');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, contractAddress, abi]
  );

  const read = useCallback(
    async (functionName: string, args: any[]): Promise<any | null> => {
      if (!client) {
        setError(new Error('Client not initialized'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const contract = new ethers.Contract(
          contractAddress,
          abi,
          client.getProvider()
        );

        const result = await contract[functionName](...args);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract read failed');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, contractAddress, abi]
  );

  return {
    call,
    read,
    isLoading,
    error,
  };
}
