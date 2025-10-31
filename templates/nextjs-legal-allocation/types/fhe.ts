/**
 * FHE-related TypeScript type definitions
 */

export type FHEDataType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address';

export interface FHEEncryptedValue {
  handle: string;
  proof: string;
  type: FHEDataType;
}

export interface FHEDecryptionRequest {
  handle: string;
  type: FHEDataType;
  contractAddress: string;
  userAddress: string;
  isPublic?: boolean;
}

export interface FHEClientConfig {
  provider: any;
  network: string;
  gatewayUrl?: string;
}

export interface FHEClientState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  publicKey: string | null;
}
