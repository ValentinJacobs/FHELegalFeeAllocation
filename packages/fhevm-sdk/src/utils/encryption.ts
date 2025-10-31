/**
 * Encryption utility functions
 * @module utils/encryption
 */

import type { EncryptedData } from '../types';

/**
 * Validate encrypted data structure
 */
export function validateEncryptedData(data: EncryptedData): boolean {
  return (
    data !== null &&
    typeof data === 'object' &&
    'handle' in data &&
    'proof' in data &&
    'value' in data
  );
}

/**
 * Format encrypted handle for display
 */
export function formatEncryptedHandle(handle: string): string {
  if (!handle || handle.length < 10) return handle;
  return `${handle.substring(0, 6)}...${handle.substring(handle.length - 4)}`;
}

/**
 * Check if a value is within safe encryption bounds
 */
export function isWithinBounds(value: number | bigint, bits: 8 | 16 | 32 | 64): boolean {
  const maxValues = {
    8: 255,
    16: 65535,
    32: 4294967295,
    64: BigInt('18446744073709551615'),
  };

  const maxValue = maxValues[bits];
  const numValue = typeof value === 'bigint' ? value : BigInt(value);

  return numValue >= BigInt(0) && numValue <= maxValue;
}

/**
 * Convert a number to the appropriate type for encryption
 */
export function toEncryptionValue(value: number | bigint, bits: 8 | 16 | 32 | 64): number | bigint {
  if (bits === 64) {
    return typeof value === 'bigint' ? value : BigInt(value);
  }
  return typeof value === 'number' ? value : Number(value);
}
