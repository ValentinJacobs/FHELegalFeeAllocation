/**
 * API-related TypeScript type definitions
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FHEEncryptRequest {
  value: any;
  type: string;
  contractAddress: string;
  userAddress: string;
}

export interface FHEDecryptRequest {
  handle: string;
  type: string;
  contractAddress: string;
  userAddress?: string;
  isPublic?: boolean;
}

export interface FHEComputeRequest {
  operation: string;
  operands: string[];
  contractAddress: string;
}

export interface FHEKeyRequest {
  action: 'generate' | 'refresh' | 'public' | 'status';
  data?: any;
}
