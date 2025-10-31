'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import type { FhevmClient } from '@fhevm/sdk';
import { useEncryption, useContract } from '@fhevm/sdk/react';

// Import contract ABI (you would need to generate this from your contract)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
  'function createCase(address[] calldata _parties, uint64 _totalFee, uint32 _complexity, string calldata _caseDescription) external returns (uint256)',
  'event CaseCreated(uint256 indexed caseId, bytes32 indexed caseHash, uint256 partyCount)',
];

interface CreateCaseFormProps {
  client: FhevmClient;
}

export default function CreateCaseForm({ client }: CreateCaseFormProps) {
  const { encrypt, isEncrypting } = useEncryption(client);
  const { call, isLoading } = useContract(client, CONTRACT_ADDRESS, CONTRACT_ABI);

  const [parties, setParties] = useState<string>('');
  const [totalFee, setTotalFee] = useState<string>('');
  const [complexity, setComplexity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      // Validate inputs
      const partyAddresses = parties.split(',').map((addr) => addr.trim());
      if (partyAddresses.length < 2) {
        throw new Error('At least 2 parties are required');
      }

      // Validate addresses
      for (const addr of partyAddresses) {
        if (!ethers.isAddress(addr)) {
          throw new Error(`Invalid address: ${addr}`);
        }
      }

      const feeValue = parseInt(totalFee);
      const complexityValue = parseInt(complexity);

      if (feeValue <= 0 || complexityValue <= 0 || complexityValue > 100) {
        throw new Error('Invalid fee or complexity value');
      }

      // Encrypt sensitive data using SDK
      setStatus({ type: 'success', message: 'Encrypting data...' });
      const encryptedFee = await encrypt.uint64(BigInt(feeValue));
      const encryptedComplexity = await encrypt.uint32(complexityValue);

      if (!encryptedFee || !encryptedComplexity) {
        throw new Error('Encryption failed');
      }

      // Call smart contract
      setStatus({ type: 'success', message: 'Creating case...' });
      const tx = await call('createCase', [
        partyAddresses,
        encryptedFee.handle,
        encryptedComplexity.handle,
        description,
      ]);

      if (!tx) {
        throw new Error('Transaction failed');
      }

      setStatus({ type: 'success', message: 'Waiting for confirmation...' });
      await tx.wait();

      setStatus({
        type: 'success',
        message: 'Case created successfully! (Check console for details)',
      });

      // Reset form
      setParties('');
      setTotalFee('');
      setComplexity('');
      setDescription('');
    } catch (err: any) {
      console.error('Error creating case:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Failed to create case',
      });
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Create New Case</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            Party Addresses (comma-separated)
          </label>
          <textarea
            className="input"
            rows={3}
            value={parties}
            onChange={(e) => setParties(e.target.value)}
            placeholder="0x123..., 0x456..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter at least 2 Ethereum addresses separated by commas
          </p>
        </div>

        <div>
          <label className="label">Total Fee (encrypted)</label>
          <input
            type="number"
            className="input"
            value={totalFee}
            onChange={(e) => setTotalFee(e.target.value)}
            placeholder="50000"
            required
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Fee amount (will be encrypted using FHEVM SDK)
          </p>
        </div>

        <div>
          <label className="label">Complexity (1-100, encrypted)</label>
          <input
            type="number"
            className="input"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            placeholder="50"
            required
            min="1"
            max="100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Case complexity rating (will be encrypted)
          </p>
        </div>

        <div>
          <label className="label">Case Description</label>
          <textarea
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Commercial dispute regarding contract terms..."
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isEncrypting || isLoading}
        >
          {isEncrypting
            ? 'Encrypting...'
            : isLoading
            ? 'Creating Case...'
            : 'Create Case'}
        </button>
      </form>

      {status && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm ${
              status.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {status.message}
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>SDK Integration:</strong> This form uses the FHEVM SDK to encrypt
          sensitive data (fee and complexity) before sending to the smart contract,
          ensuring complete privacy.
        </p>
      </div>
    </div>
  );
}
