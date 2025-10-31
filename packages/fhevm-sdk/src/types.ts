import { ethers } from 'ethers';

/**
 * Configuration for initializing the FHEVM client
 */
export interface FhevmConfig {
  /** Web3 provider (window.ethereum, ethers provider, etc.) */
  provider: any;
  /** Network name (sepolia, localhost, etc.) */
  network: string;
  /** Optional: Gateway URL for decryption */
  gatewayUrl?: string;
  /** Optional: Chain ID */
  chainId?: number;
}

/**
 * Encrypted data returned from encryption operations
 */
export interface EncryptedData {
  /** Encrypted handle to use in contract calls */
  handle: string;
  /** Proof for verification */
  proof: string;
  /** Original value (for reference only, not sent to contract) */
  value: any;
}

/**
 * Input builder for creating encrypted inputs
 */
export interface EncryptedInput {
  /** Add encrypted uint8 */
  add8(value: number): EncryptedInput;
  /** Add encrypted uint16 */
  add16(value: number): EncryptedInput;
  /** Add encrypted uint32 */
  add32(value: number): EncryptedInput;
  /** Add encrypted uint64 */
  add64(value: bigint): EncryptedInput;
  /** Add encrypted boolean */
  addBool(value: boolean): EncryptedInput;
  /** Add encrypted address */
  addAddress(value: string): EncryptedInput;
  /** Encrypt and return handles and proof */
  encrypt(): EncryptedResult;
}

/**
 * Result from encrypting multiple inputs
 */
export interface EncryptedResult {
  /** Array of encrypted handles */
  handles: string[];
  /** Input proof for verification */
  inputProof: string;
}

/**
 * Encryption utilities
 */
export interface EncryptionUtils {
  /** Encrypt uint8 value */
  uint8(value: number): Promise<EncryptedData>;
  /** Encrypt uint16 value */
  uint16(value: number): Promise<EncryptedData>;
  /** Encrypt uint32 value */
  uint32(value: number): Promise<EncryptedData>;
  /** Encrypt uint64 value */
  uint64(value: bigint): Promise<EncryptedData>;
  /** Encrypt boolean value */
  bool(value: boolean): Promise<EncryptedData>;
  /** Encrypt address value */
  address(value: string): Promise<EncryptedData>;
}

/**
 * Decryption utilities (requires user signature)
 */
export interface DecryptionUtils {
  /** Decrypt uint8 value */
  uint8(handle: string, contractAddress: string, userAddress?: string): Promise<number>;
  /** Decrypt uint16 value */
  uint16(handle: string, contractAddress: string, userAddress?: string): Promise<number>;
  /** Decrypt uint32 value */
  uint32(handle: string, contractAddress: string, userAddress?: string): Promise<number>;
  /** Decrypt uint64 value */
  uint64(handle: string, contractAddress: string, userAddress?: string): Promise<bigint>;
  /** Decrypt boolean value */
  bool(handle: string, contractAddress: string, userAddress?: string): Promise<boolean>;
  /** Decrypt address value */
  address(handle: string, contractAddress: string, userAddress?: string): Promise<string>;
}

/**
 * Public decryption utilities (no signature required)
 */
export interface PublicDecryptionUtils {
  /** Decrypt public uint32 value */
  uint32(handle: string): Promise<number>;
  /** Decrypt public uint64 value */
  uint64(handle: string): Promise<bigint>;
}
