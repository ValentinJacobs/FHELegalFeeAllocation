/**
 * React adapter for FHEVM SDK
 *
 * Re-exports all React hooks from the hooks directory for convenience
 * @module adapters/react
 */

export {
  useFhevmClient,
  useEncryption,
  useDecryption,
  useContract,
} from '../hooks';
