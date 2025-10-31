/**
 * React-specific exports for FHEVM SDK
 *
 * @packageDocumentation
 */

// Re-export core functionality
export { FhevmClient } from './client/FhevmClient';
export type {
  FhevmConfig,
  EncryptedData,
  EncryptedInput,
  EncryptedResult,
  EncryptionUtils,
  DecryptionUtils,
  PublicDecryptionUtils,
} from './types';

// React hooks
export {
  useFhevmClient,
  useEncryption,
  useDecryption,
  useContract,
} from './hooks';
