import { useState, useEffect, useCallback } from 'react';
import { FhevmClient } from '../client/FhevmClient';
import type { FhevmConfig } from '../types';

/**
 * React hook for managing FHEVM client instance
 *
 * @example
 * ```tsx
 * function App() {
 *   const { client, isInitialized, error, initialize } = useFhevmClient();
 *
 *   useEffect(() => {
 *     initialize({
 *       provider: window.ethereum,
 *       network: 'sepolia',
 *     });
 *   }, []);
 *
 *   if (!isInitialized) return <div>Initializing...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return <div>Client ready!</div>;
 * }
 * ```
 */
export function useFhevmClient() {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialize = useCallback(async (config: FhevmConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const newClient = await FhevmClient.create(config);
      setClient(newClient);
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM client'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    client,
    isInitialized,
    isLoading,
    error,
    initialize,
  };
}
