/**
 * Validation utility functions
 * @module utils/validation
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate network name
 */
export function isValidNetwork(network: string): boolean {
  const validNetworks = ['mainnet', 'sepolia', 'localhost', 'hardhat'];
  return validNetworks.includes(network.toLowerCase());
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validate gateway URL format
 */
export function isValidGatewayUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate contract address and ensure it's not zero address
 */
export function isValidContractAddress(address: string): boolean {
  return (
    isValidAddress(address) &&
    address !== '0x0000000000000000000000000000000000000000'
  );
}

/**
 * Validate uint value for specific bit size
 */
export function isValidUint(value: number | bigint, bits: 8 | 16 | 32 | 64): boolean {
  const numValue = typeof value === 'bigint' ? value : BigInt(value);

  if (numValue < BigInt(0)) return false;

  const maxValues = {
    8: BigInt(255),
    16: BigInt(65535),
    32: BigInt(4294967295),
    64: BigInt('18446744073709551615'),
  };

  return numValue <= maxValues[bits];
}

/**
 * Sanitize user input for encryption
 */
export function sanitizeInput(value: any): any {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}
