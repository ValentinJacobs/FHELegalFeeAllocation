/**
 * Validation utilities
 */

import { FHEDataType } from '../fhe/types';

/**
 * Validate data type
 */
export function isValidFHEDataType(type: string): type is FHEDataType {
  const validTypes: FHEDataType[] = ['uint8', 'uint16', 'uint32', 'uint64', 'bool', 'address'];
  return validTypes.includes(type as FHEDataType);
}

/**
 * Validate uint32 value
 */
export function isValidUint32(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xFFFFFFFF;
}

/**
 * Validate uint64 value
 */
export function isValidUint64(value: bigint): boolean {
  return value >= 0n && value <= 0xFFFFFFFFFFFFFFFFn;
}

/**
 * Validate form input
 */
export function validateFormInput(
  value: string,
  type: FHEDataType
): { valid: boolean; error?: string; parsed?: any } {
  try {
    switch (type) {
      case 'uint8':
      case 'uint16':
      case 'uint32':
        const num = parseInt(value);
        if (isNaN(num) || num < 0) {
          return { valid: false, error: 'Must be a positive number' };
        }
        return { valid: true, parsed: num };

      case 'uint64':
        const bigNum = BigInt(value);
        if (bigNum < 0n) {
          return { valid: false, error: 'Must be a positive number' };
        }
        return { valid: true, parsed: bigNum };

      case 'bool':
        const lower = value.toLowerCase();
        if (lower !== 'true' && lower !== 'false') {
          return { valid: false, error: 'Must be true or false' };
        }
        return { valid: true, parsed: lower === 'true' };

      case 'address':
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          return { valid: false, error: 'Invalid Ethereum address' };
        }
        return { valid: true, parsed: value };

      default:
        return { valid: false, error: 'Invalid data type' };
    }
  } catch (error) {
    return { valid: false, error: 'Invalid value format' };
  }
}
