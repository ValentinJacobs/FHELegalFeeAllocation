<template>
  <div class="container">
    <h1>Vue + FHEVM SDK</h1>
    <p class="subtitle">Vue 3 Composition API example with FHEVM SDK integration</p>

    <div class="card">
      <div v-if="!isInitialized">
        <p>Initialize the FHEVM client to get started</p>
        <button @click="initializeClient" :disabled="isInitializing">
          {{ isInitializing ? 'Initializing...' : 'Initialize FHEVM Client' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <div v-else>
        <div class="status success">
          ✓ FHEVM Client Initialized
        </div>

        <div class="form-group">
          <label>Contract Address:</label>
          <input
            v-model="contractAddress"
            type="text"
            placeholder="0x..."
          />
        </div>

        <div class="form-group">
          <label>User Address:</label>
          <input
            v-model="userAddress"
            type="text"
            placeholder="0x..."
          />
        </div>

        <div class="form-group">
          <label>Value to Encrypt (uint32):</label>
          <input
            v-model="encryptValue"
            type="number"
            placeholder="Enter a number"
          />
        </div>

        <button @click="handleEncrypt">Encrypt Value</button>

        <div v-if="encryptedData" class="result">
          <h3>Encrypted Data:</h3>
          <p><strong>Handle:</strong></p>
          <code>{{ encryptedData.handle }}</code>
          <p><strong>Proof:</strong></p>
          <code>{{ encryptedData.proof.substring(0, 50) }}...</code>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>

    <div class="info">
      <h2>Features:</h2>
      <ul>
        <li>✓ Vue 3 Composition API</li>
        <li>✓ FHEVM client initialization</li>
        <li>✓ Encryption of uint32 values</li>
        <li>✓ Integration with MetaMask</li>
        <li>✓ TypeScript support</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FhevmClient } from '@fhevm/sdk';

const client = ref<FhevmClient | null>(null);
const isInitialized = ref(false);
const isInitializing = ref(false);
const error = ref<string | null>(null);

const encryptValue = ref('');
const encryptedData = ref<any>(null);
const contractAddress = ref('');
const userAddress = ref('');

declare global {
  interface Window {
    ethereum?: any;
  }
}

const initializeClient = async () => {
  if (!window.ethereum) {
    error.value = 'MetaMask not found. Please install MetaMask.';
    return;
  }

  isInitializing.value = true;
  error.value = null;

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const fhevmClient = await FhevmClient.create({
      provider: window.ethereum,
      network: 'sepolia',
      gatewayUrl: 'https://gateway.zama.ai',
    });

    client.value = fhevmClient;
    isInitialized.value = true;

    // Get user address
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      userAddress.value = accounts[0];
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to initialize';
  } finally {
    isInitializing.value = false;
  }
};

const handleEncrypt = async () => {
  if (!client.value || !contractAddress.value || !userAddress.value) {
    error.value = 'Please set contract and user addresses';
    return;
  }

  try {
    const input = client.value.createEncryptedInput(
      contractAddress.value,
      userAddress.value
    );
    input.add32(parseInt(encryptValue.value));
    const encrypted = input.encrypt();

    encryptedData.value = {
      handle: encrypted.handles[0],
      proof: encrypted.inputProof,
    };
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Encryption failed';
  }
};
</script>

<style scoped>
/* Component styles are in the main style.css */
</style>
