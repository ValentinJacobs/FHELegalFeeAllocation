'use client';

import React, { useState } from 'react';
import { useFHEContext } from './FHEProvider';

/**
 * EncryptionDemo - Component demonstrating FHE encryption
 * Shows how to encrypt different data types using the FHEVM SDK
 */
export function EncryptionDemo() {
  const { client, isInitialized } = useFHEContext();
  const [value, setValue] = useState('');
  const [dataType, setDataType] = useState<'uint32' | 'uint64' | 'bool'>('uint32');
  const [contractAddress, setContractAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEncrypt = async () => {
    if (!client || !isInitialized) {
      setError('FHEVM client not initialized');
      return;
    }

    if (!value || !contractAddress || !userAddress) {
      setError('Please fill in all fields');
      return;
    }

    setIsEncrypting(true);
    setError(null);

    try {
      // Create encrypted input
      const input = client.createEncryptedInput(contractAddress, userAddress);

      // Add value based on type
      switch (dataType) {
        case 'uint32':
          input.add32(parseInt(value));
          break;
        case 'uint64':
          input.add64(BigInt(value));
          break;
        case 'bool':
          input.addBool(value.toLowerCase() === 'true');
          break;
      }

      // Encrypt
      const encrypted = input.encrypt();

      setEncryptedData({
        handles: encrypted.handles,
        inputProof: encrypted.inputProof,
        type: dataType,
        originalValue: value,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      console.error('Encryption error:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Encryption Demo</h2>

      {!isInitialized ? (
        <p className="text-gray-600">Initializing FHEVM client...</p>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data Type</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="uint32">uint32</option>
                <option value="uint64">uint64</option>
                <option value="bool">bool</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Value {dataType === 'bool' ? '(true/false)' : '(number)'}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={dataType === 'bool' ? 'true or false' : 'Enter a number'}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contract Address</label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">User Address</label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={handleEncrypt}
              disabled={isEncrypting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isEncrypting ? 'Encrypting...' : 'Encrypt'}
            </button>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {encryptedData && (
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold mb-2">Encrypted Data:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Type:</strong> {encryptedData.type}</p>
                  <p><strong>Original Value:</strong> {encryptedData.originalValue}</p>
                  <p className="break-all"><strong>Handle:</strong> {encryptedData.handles[0]}</p>
                  <p className="break-all"><strong>Proof:</strong> {encryptedData.inputProof.substring(0, 50)}...</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
