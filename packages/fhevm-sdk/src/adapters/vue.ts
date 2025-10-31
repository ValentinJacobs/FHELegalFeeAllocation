/**
 * Vue 3 adapter for FHEVM SDK
 * @module adapters/vue
 */

import { ref, computed, type Ref } from 'vue';
import { FhevmClient } from '../core/fhevm';
import type { FhevmConfig, EncryptedData } from '../types';

/**
 * Vue composable for FHEVM client
 */
export function useFhevmClient(config: FhevmConfig) {
  const client: Ref<FhevmClient | null> = ref(null);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error: Ref<Error | null> = ref(null);

  const initialize = async () => {
    if (isLoading.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      client.value = await FhevmClient.create(config);
      isInitialized.value = true;
    } catch (err) {
      error.value = err as Error;
      console.error('Failed to initialize FHEVM client:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    client: computed(() => client.value),
    isInitialized: computed(() => isInitialized.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    initialize,
  };
}

/**
 * Vue composable for encryption operations
 */
export function useEncryption(client: Ref<FhevmClient | null>) {
  const isEncrypting = ref(false);
  const encryptionError: Ref<Error | null> = ref(null);

  const encryptUint32 = async (value: number): Promise<EncryptedData | null> => {
    if (!client.value) {
      encryptionError.value = new Error('Client not initialized');
      return null;
    }

    isEncrypting.value = true;
    encryptionError.value = null;

    try {
      const encrypted = await client.value.encrypt.uint32(value);
      return encrypted;
    } catch (err) {
      encryptionError.value = err as Error;
      console.error('Encryption failed:', err);
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const encryptUint64 = async (value: bigint): Promise<EncryptedData | null> => {
    if (!client.value) {
      encryptionError.value = new Error('Client not initialized');
      return null;
    }

    isEncrypting.value = true;
    encryptionError.value = null;

    try {
      const encrypted = await client.value.encrypt.uint64(value);
      return encrypted;
    } catch (err) {
      encryptionError.value = err as Error;
      console.error('Encryption failed:', err);
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  const encryptBool = async (value: boolean): Promise<EncryptedData | null> => {
    if (!client.value) {
      encryptionError.value = new Error('Client not initialized');
      return null;
    }

    isEncrypting.value = true;
    encryptionError.value = null;

    try {
      const encrypted = await client.value.encrypt.bool(value);
      return encrypted;
    } catch (err) {
      encryptionError.value = err as Error;
      console.error('Encryption failed:', err);
      return null;
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    isEncrypting: computed(() => isEncrypting.value),
    encryptionError: computed(() => encryptionError.value),
    encryptUint32,
    encryptUint64,
    encryptBool,
  };
}

/**
 * Vue composable for decryption operations
 */
export function useDecryption(client: Ref<FhevmClient | null>) {
  const isDecrypting = ref(false);
  const decryptionError: Ref<Error | null> = ref(null);

  const decryptUint32 = async (
    handle: string,
    contractAddress: string
  ): Promise<number | null> => {
    if (!client.value) {
      decryptionError.value = new Error('Client not initialized');
      return null;
    }

    isDecrypting.value = true;
    decryptionError.value = null;

    try {
      const decrypted = await client.value.decrypt.uint32(handle, contractAddress);
      return decrypted;
    } catch (err) {
      decryptionError.value = err as Error;
      console.error('Decryption failed:', err);
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  const decryptUint64 = async (
    handle: string,
    contractAddress: string
  ): Promise<bigint | null> => {
    if (!client.value) {
      decryptionError.value = new Error('Client not initialized');
      return null;
    }

    isDecrypting.value = true;
    decryptionError.value = null;

    try {
      const decrypted = await client.value.decrypt.uint64(handle, contractAddress);
      return decrypted;
    } catch (err) {
      decryptionError.value = err as Error;
      console.error('Decryption failed:', err);
      return null;
    } finally {
      isDecrypting.value = false;
    }
  };

  return {
    isDecrypting: computed(() => isDecrypting.value),
    decryptionError: computed(() => decryptionError.value),
    decryptUint32,
    decryptUint64,
  };
}
