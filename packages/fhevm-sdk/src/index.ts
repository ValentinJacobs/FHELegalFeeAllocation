/**
 * Universal FHEVM SDK
 *
 * Framework-agnostic development kit for building confidential applications
 * with Zama's Fully Homomorphic Encryption technology.
 *
 * @packageDocumentation
 */

// Core client (maintain backward compatibility)
export { FhevmClient } from './client/FhevmClient';
export { FhevmClient as FhevmClientCore } from './core/fhevm';

// Types
export type {
  FhevmConfig,
  EncryptedData,
  EncryptedInput,
  EncryptedResult,
  EncryptionUtils,
  DecryptionUtils,
  PublicDecryptionUtils,
} from './types';

// Utilities
export * from './utils';

// Standalone utility functions for framework-agnostic usage
export async function createFhevmClient(config: import('./types').FhevmConfig) {
  const { FhevmClient } = await import('./client/FhevmClient');
  return FhevmClient.create(config);
}
