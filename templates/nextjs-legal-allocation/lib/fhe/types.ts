/**
 * Type definitions for FHE operations
 */

export type FHEDataType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'bool' | 'address';

export interface EncryptedData {
  handle: string;
  proof: string;
  type: FHEDataType;
}

export interface EncryptionInput {
  value: any;
  type: FHEDataType;
  contractAddress: string;
  userAddress: string;
}

export interface DecryptionInput {
  handle: string;
  type: FHEDataType;
  contractAddress: string;
  userAddress?: string;
  isPublic?: boolean;
}

export interface FHEOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ComputationOperation {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'eq' | 'ne' | 'lt' | 'gt' | 'lte' | 'gte' | 'and' | 'or' | 'xor' | 'not' | 'min' | 'max' | 'select';
  operands: string[];
  description: string;
}
