/**
 * Security utilities for FHE operations
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate encrypted handle format
 */
export function isValidHandle(handle: string): boolean {
  return typeof handle === 'string' && handle.length > 0;
}

/**
 * Sanitize input value for encryption
 */
export function sanitizeEncryptionInput(value: any, type: string): any {
  switch (type) {
    case 'uint8':
    case 'uint16':
    case 'uint32':
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        throw new Error(`Invalid ${type} value`);
      }
      return num;

    case 'uint64':
      try {
        return BigInt(value);
      } catch {
        throw new Error('Invalid uint64 value');
      }

    case 'bool':
      return Boolean(value);

    case 'address':
      if (!isValidAddress(value)) {
        throw new Error('Invalid address');
      }
      return value;

    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

/**
 * Validate FHE operation parameters
 */
export function validateFHEParams(params: {
  contractAddress?: string;
  userAddress?: string;
  handle?: string;
}): { valid: boolean; error?: string } {
  if (params.contractAddress && !isValidAddress(params.contractAddress)) {
    return { valid: false, error: 'Invalid contract address' };
  }

  if (params.userAddress && !isValidAddress(params.userAddress)) {
    return { valid: false, error: 'Invalid user address' };
  }

  if (params.handle && !isValidHandle(params.handle)) {
    return { valid: false, error: 'Invalid encrypted handle' };
  }

  return { valid: true };
}
