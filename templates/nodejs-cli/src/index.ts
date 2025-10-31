#!/usr/bin/env node

import { FhevmClient } from '@fhevm/sdk';
import { ethers } from 'ethers';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

/**
 * Node.js CLI example for FHEVM SDK
 * Demonstrates framework-agnostic usage without browser dependencies
 */

const rl = readline.createInterface({ input, output });

interface Config {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  network: string;
}

async function loadConfig(): Promise<Config> {
  console.log('=== FHEVM CLI Configuration ===\n');

  const rpcUrl = await rl.question('Enter RPC URL (default: http://localhost:8545): ');
  const privateKey = await rl.question('Enter private key: ');
  const contractAddress = await rl.question('Enter contract address: ');
  const network = await rl.question('Enter network (default: sepolia): ');

  return {
    rpcUrl: rpcUrl || 'http://localhost:8545',
    privateKey,
    contractAddress,
    network: network || 'sepolia',
  };
}

async function initializeClient(config: Config): Promise<FhevmClient> {
  console.log('\n=== Initializing FHEVM Client ===\n');

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    // Create wallet
    const wallet = new ethers.Wallet(config.privateKey, provider);
    console.log(`Wallet address: ${wallet.address}`);

    // Initialize FHEVM client
    const client = await FhevmClient.create({
      provider: provider as any,
      network: config.network,
    });

    console.log('✓ FHEVM client initialized successfully\n');
    return client;
  } catch (error) {
    console.error('Failed to initialize client:', error);
    throw error;
  }
}

async function encryptValue(
  client: FhevmClient,
  contractAddress: string,
  userAddress: string
): Promise<void> {
  console.log('=== Encrypt Value ===\n');

  const value = await rl.question('Enter value to encrypt (uint32): ');
  const numValue = parseInt(value);

  if (isNaN(numValue)) {
    console.error('Invalid number');
    return;
  }

  try {
    const input = client.createEncryptedInput(contractAddress, userAddress);
    input.add32(numValue);
    const encrypted = input.encrypt();

    console.log('\n✓ Encryption successful:');
    console.log(`  Handle: ${encrypted.handles[0]}`);
    console.log(`  Proof: ${encrypted.inputProof.substring(0, 50)}...`);
    console.log(`  Proof length: ${encrypted.inputProof.length} bytes\n`);
  } catch (error) {
    console.error('Encryption failed:', error);
  }
}

async function showMenu(): Promise<string> {
  console.log('=== FHEVM CLI Menu ===');
  console.log('1. Encrypt a value');
  console.log('2. Show client info');
  console.log('3. Exit');
  console.log('');

  const choice = await rl.question('Choose an option: ');
  return choice;
}

async function showClientInfo(client: FhevmClient): Promise<void> {
  console.log('\n=== Client Information ===\n');

  try {
    const publicKey = client.getPublicKey();
    console.log('Public Key Information:');
    console.log(`  Length: ${publicKey.length} bytes`);
    console.log(`  Preview: ${publicKey.substring(0, 50)}...`);
    console.log('');
  } catch (error) {
    console.error('Failed to get client info:', error);
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   FHEVM SDK - Node.js CLI Example     ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const config = await loadConfig();
    const client = await initializeClient(config);

    // Get wallet for user address
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.privateKey, provider);

    let running = true;
    while (running) {
      const choice = await showMenu();

      switch (choice) {
        case '1':
          await encryptValue(client, config.contractAddress, wallet.address);
          break;

        case '2':
          await showClientInfo(client);
          break;

        case '3':
          console.log('\nExiting...');
          running = false;
          break;

        default:
          console.log('\nInvalid option. Please try again.\n');
      }
    }
  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
