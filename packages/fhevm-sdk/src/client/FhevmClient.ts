import { ethers } from 'ethers';
import { createInstance } from 'fhevmjs';
import type {
  FhevmConfig,
  EncryptedInput,
  EncryptedResult,
  EncryptedData,
  EncryptionUtils,
  DecryptionUtils,
  PublicDecryptionUtils,
} from '../types';

/**
 * Main FHEVM client for all encryption and decryption operations
 *
 * @example
 * ```typescript
 * const client = await FhevmClient.create({
 *   provider: window.ethereum,
 *   network: 'sepolia',
 * });
 * ```
 */
export class FhevmClient {
  private instance: any;
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer;
  private network: string;
  private gatewayUrl?: string;

  private constructor(
    instance: any,
    provider: ethers.BrowserProvider,
    signer: ethers.Signer,
    network: string,
    gatewayUrl?: string
  ) {
    this.instance = instance;
    this.provider = provider;
    this.signer = signer;
    this.network = network;
    this.gatewayUrl = gatewayUrl;
  }

  /**
   * Create a new FhevmClient instance
   */
  static async create(config: FhevmConfig): Promise<FhevmClient> {
    const provider = new ethers.BrowserProvider(config.provider);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    // Initialize fhevmjs instance
    const instance = await createInstance({
      chainId: config.chainId || Number(network.chainId),
      networkUrl: config.provider,
      gatewayUrl: config.gatewayUrl,
    });

    return new FhevmClient(
      instance,
      provider,
      signer,
      config.network,
      config.gatewayUrl
    );
  }

  /**
   * Create an encrypted input builder
   *
   * @param contractAddress - Contract address to encrypt for
   * @param userAddress - User address (defaults to signer address)
   */
  createEncryptedInput(
    contractAddress: string,
    userAddress?: string
  ): EncryptedInput {
    const input = this.instance.createEncryptedInput(
      contractAddress,
      userAddress || this.signer.getAddress()
    );

    return {
      add8: (value: number) => {
        input.add8(value);
        return this.createEncryptedInput(contractAddress, userAddress);
      },
      add16: (value: number) => {
        input.add16(value);
        return this.createEncryptedInput(contractAddress, userAddress);
      },
      add32: (value: number) => {
        input.add32(value);
        return this.createEncryptedInput(contractAddress, userAddress);
      },
      add64: (value: bigint) => {
        input.add64(value);
        return this.createEncryptedInput(contractAddress, userAddress);
      },
      addBool: (value: boolean) => {
        input.addBool(value);
        return this.createEncryptedInput(contractAddress, userAddress);
      },
      addAddress: (value: string) => {
        input.addAddress(value);
        return this.createEncryptedInput(contractAddress, userAddress);
      },
      encrypt: (): EncryptedResult => {
        const encrypted = input.encrypt();
        return {
          handles: encrypted.handles,
          inputProof: encrypted.inputProof,
        };
      },
    };
  }

  /**
   * Encryption utilities
   */
  get encrypt(): EncryptionUtils {
    return {
      uint8: async (value: number): Promise<EncryptedData> => {
        const input = this.instance.createEncryptedInput('0x0000000000000000000000000000000000000000', await this.signer.getAddress());
        input.add8(value);
        const encrypted = input.encrypt();
        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          value,
        };
      },
      uint16: async (value: number): Promise<EncryptedData> => {
        const input = this.instance.createEncryptedInput('0x0000000000000000000000000000000000000000', await this.signer.getAddress());
        input.add16(value);
        const encrypted = input.encrypt();
        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          value,
        };
      },
      uint32: async (value: number): Promise<EncryptedData> => {
        const input = this.instance.createEncryptedInput('0x0000000000000000000000000000000000000000', await this.signer.getAddress());
        input.add32(value);
        const encrypted = input.encrypt();
        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          value,
        };
      },
      uint64: async (value: bigint): Promise<EncryptedData> => {
        const input = this.instance.createEncryptedInput('0x0000000000000000000000000000000000000000', await this.signer.getAddress());
        input.add64(value);
        const encrypted = input.encrypt();
        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          value,
        };
      },
      bool: async (value: boolean): Promise<EncryptedData> => {
        const input = this.instance.createEncryptedInput('0x0000000000000000000000000000000000000000', await this.signer.getAddress());
        input.addBool(value);
        const encrypted = input.encrypt();
        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          value,
        };
      },
      address: async (value: string): Promise<EncryptedData> => {
        const input = this.instance.createEncryptedInput('0x0000000000000000000000000000000000000000', await this.signer.getAddress());
        input.addAddress(value);
        const encrypted = input.encrypt();
        return {
          handle: encrypted.handles[0],
          proof: encrypted.inputProof,
          value,
        };
      },
    };
  }

  /**
   * Decryption utilities (requires EIP-712 signature)
   */
  get decrypt(): DecryptionUtils {
    return {
      uint8: async (handle: string, contractAddress: string, userAddress?: string): Promise<number> => {
        const addr = userAddress || await this.signer.getAddress();
        return this.instance.decrypt(contractAddress, handle, addr);
      },
      uint16: async (handle: string, contractAddress: string, userAddress?: string): Promise<number> => {
        const addr = userAddress || await this.signer.getAddress();
        return this.instance.decrypt(contractAddress, handle, addr);
      },
      uint32: async (handle: string, contractAddress: string, userAddress?: string): Promise<number> => {
        const addr = userAddress || await this.signer.getAddress();
        return this.instance.decrypt(contractAddress, handle, addr);
      },
      uint64: async (handle: string, contractAddress: string, userAddress?: string): Promise<bigint> => {
        const addr = userAddress || await this.signer.getAddress();
        return this.instance.decrypt(contractAddress, handle, addr);
      },
      bool: async (handle: string, contractAddress: string, userAddress?: string): Promise<boolean> => {
        const addr = userAddress || await this.signer.getAddress();
        return this.instance.decrypt(contractAddress, handle, addr);
      },
      address: async (handle: string, contractAddress: string, userAddress?: string): Promise<string> => {
        const addr = userAddress || await this.signer.getAddress();
        return this.instance.decrypt(contractAddress, handle, addr);
      },
    };
  }

  /**
   * Public decryption utilities (no signature required)
   */
  get publicDecrypt(): PublicDecryptionUtils {
    return {
      uint32: async (handle: string): Promise<number> => {
        return this.instance.publicDecrypt(handle);
      },
      uint64: async (handle: string): Promise<bigint> => {
        return this.instance.publicDecrypt(handle);
      },
    };
  }

  /**
   * Get the ethers provider
   */
  getProvider(): ethers.BrowserProvider {
    return this.provider;
  }

  /**
   * Get the ethers signer
   */
  getSigner(): ethers.Signer {
    return this.signer;
  }

  /**
   * Get the network name
   */
  getNetwork(): string {
    return this.network;
  }
}
