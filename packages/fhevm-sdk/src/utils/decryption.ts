/**
 * Decryption utility functions
 * @module utils/decryption
 */

/**
 * Format decrypted value for display
 */
export function formatDecryptedValue(
  value: number | bigint | boolean | string,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address'
): string {
  switch (type) {
    case 'bool':
      return value ? 'true' : 'false';
    case 'address':
      return String(value);
    case 'uint64':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Validate decryption handle format
 */
export function isValidHandle(handle: string): boolean {
  return (
    typeof handle === 'string' &&
    handle.length > 0 &&
    handle.startsWith('0x')
  );
}

/**
 * Parse decryption result based on type
 */
export function parseDecryptionResult(
  result: any,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address'
): number | bigint | boolean | string {
  switch (type) {
    case 'bool':
      return Boolean(result);
    case 'address':
      return String(result);
    case 'uint64':
      return BigInt(result);
    case 'uint8':
    case 'uint16':
    case 'uint32':
      return Number(result);
    default:
      return result;
  }
}
