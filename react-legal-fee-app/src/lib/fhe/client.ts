import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';

/**
 * Client-side FHE operations
 * Handles FHEVM client initialization and encryption/decryption on the client
 */

let clientInstance: FhevmClient | null = null;

export interface FHEClientConfig {
  provider: any;
  network: string;
  gatewayUrl?: string;
}

/**
 * Initialize FHEVM client
 */
export async function initializeFHEClient(config: FHEClientConfig): Promise<FhevmClient> {
  if (clientInstance) {
    return clientInstance;
  }

  try {
    clientInstance = await FhevmClient.create({
      provider: config.provider,
      network: config.network,
      gatewayUrl: config.gatewayUrl || 'https://gateway.zama.ai',
    });

    console.log('FHEVM client initialized successfully');
    return clientInstance;
  } catch (error) {
    console.error('Failed to initialize FHEVM client:', error);
    throw error;
  }
}

/**
 * Get the current client instance
 */
export function getFHEClient(): FhevmClient | null {
  return clientInstance;
}

/**
 * Reset client instance (useful for network changes)
 */
export function resetFHEClient(): void {
  clientInstance = null;
}

/**
 * Encrypt a uint32 value
 */
export async function encryptUint32(
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; proof: string }> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  const input = clientInstance.createEncryptedInput(contractAddress, userAddress);
  input.add32(value);
  const encrypted = input.encrypt();

  return {
    handle: encrypted.handles[0],
    proof: encrypted.inputProof,
  };
}

/**
 * Encrypt a uint64 value
 */
export async function encryptUint64(
  value: bigint,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; proof: string }> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  const input = clientInstance.createEncryptedInput(contractAddress, userAddress);
  input.add64(value);
  const encrypted = input.encrypt();

  return {
    handle: encrypted.handles[0],
    proof: encrypted.inputProof,
  };
}

/**
 * Encrypt a boolean value
 */
export async function encryptBool(
  value: boolean,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; proof: string }> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  const input = clientInstance.createEncryptedInput(contractAddress, userAddress);
  input.addBool(value);
  const encrypted = input.encrypt();

  return {
    handle: encrypted.handles[0],
    proof: encrypted.inputProof,
  };
}

/**
 * Decrypt a uint32 value (requires EIP-712 signature)
 */
export async function decryptUint32(
  handle: string,
  contractAddress: string,
  userAddress: string
): Promise<number> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  return await clientInstance.decrypt.uint32(handle, contractAddress, userAddress);
}

/**
 * Decrypt a uint64 value (requires EIP-712 signature)
 */
export async function decryptUint64(
  handle: string,
  contractAddress: string,
  userAddress: string
): Promise<bigint> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  return await clientInstance.decrypt.uint64(handle, contractAddress, userAddress);
}

/**
 * Public decrypt a uint32 value (no signature required)
 */
export async function publicDecryptUint32(handle: string): Promise<number> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  return await clientInstance.publicDecrypt.uint32(handle);
}

/**
 * Public decrypt a uint64 value (no signature required)
 */
export async function publicDecryptUint64(handle: string): Promise<bigint> {
  if (!clientInstance) {
    throw new Error('FHEVM client not initialized');
  }

  return await clientInstance.publicDecrypt.uint64(handle);
}
