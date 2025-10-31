/**
 * Node.js adapter for FHEVM SDK
 *
 * Provides utilities for using FHEVM SDK in Node.js environments (CLI, server, etc.)
 * @module adapters/nodejs
 */

import { FhevmClient } from '../core/fhevm';
import type { FhevmConfig } from '../types';

/**
 * Create FHEVM client for Node.js environment
 *
 * @example
 * ```typescript
 * import { createNodeClient } from '@fhevm/sdk/adapters/nodejs';
 *
 * const client = await createNodeClient({
 *   provider: 'https://sepolia.infura.io/v3/YOUR_KEY',
 *   network: 'sepolia',
 *   privateKey: process.env.PRIVATE_KEY,
 * });
 * ```
 */
export async function createNodeClient(
  config: FhevmConfig & { privateKey?: string }
): Promise<FhevmClient> {
  // For Node.js, we might need to handle private key-based authentication
  // This is a simplified version - full implementation would need ethers Wallet
  return FhevmClient.create(config);
}

/**
 * Utility to load configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<FhevmConfig> {
  return {
    network: process.env.FHEVM_NETWORK || 'sepolia',
    gatewayUrl: process.env.FHEVM_GATEWAY_URL,
    chainId: process.env.FHEVM_CHAIN_ID
      ? parseInt(process.env.FHEVM_CHAIN_ID, 10)
      : undefined,
  };
}

/**
 * Check if running in Node.js environment
 */
export function isNodeEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}
