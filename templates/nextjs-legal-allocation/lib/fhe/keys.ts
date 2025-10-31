import { getFHEClient } from './client';

/**
 * Key management utilities
 * Handles FHE key retrieval and management
 */

export interface KeyInfo {
  publicKey: string | null;
  keyLength: number;
  isInitialized: boolean;
}

/**
 * Get the public key from the FHEVM client
 */
export function getPublicKey(): string | null {
  const client = getFHEClient();
  if (!client) {
    console.warn('FHEVM client not initialized');
    return null;
  }

  try {
    return client.getPublicKey();
  } catch (error) {
    console.error('Failed to get public key:', error);
    return null;
  }
}

/**
 * Get key information
 */
export function getKeyInfo(): KeyInfo {
  const publicKey = getPublicKey();

  return {
    publicKey,
    keyLength: publicKey?.length || 0,
    isInitialized: !!publicKey,
  };
}

/**
 * Check if keys are initialized
 */
export function areKeysInitialized(): boolean {
  const client = getFHEClient();
  return !!client;
}
