'use client';

import React, { useState, useEffect } from 'react';
import { useFHEContext } from './FHEProvider';

/**
 * KeyManager - Component for managing FHE keys
 * Displays key information and provides key management functionality
 */
export function KeyManager() {
  const { client, isInitialized, initializeClient, isInitializing } = useFHEContext();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyInfo, setKeyInfo] = useState<any>(null);

  useEffect(() => {
    if (client && isInitialized) {
      try {
        const pubKey = client.getPublicKey();
        setPublicKey(pubKey);

        setKeyInfo({
          keyLength: pubKey?.length || 0,
          keyType: 'TFHE Public Key',
          status: 'Active',
          source: 'FHEVM Network',
        });
      } catch (error) {
        console.error('Error getting public key:', error);
      }
    }
  }, [client, isInitialized]);

  const handleRefreshKeys = async () => {
    // Reinitialize the client to refresh keys
    await initializeClient();
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Key Manager</h2>

      {!isInitialized ? (
        <div className="space-y-4">
          <p className="text-gray-600">FHEVM client not initialized</p>
          <button
            onClick={initializeClient}
            disabled={isInitializing}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isInitializing ? 'Initializing...' : 'Initialize Client'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">Client Status</h3>
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                Active
              </span>
            </div>
            <p className="text-sm text-green-700">FHEVM client is initialized and ready</p>
          </div>

          {keyInfo && (
            <div className="space-y-3">
              <h3 className="font-semibold">Key Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Key Type</div>
                  <div className="font-medium">{keyInfo.keyType}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium">{keyInfo.status}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Key Length</div>
                  <div className="font-medium">{keyInfo.keyLength} bytes</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Source</div>
                  <div className="font-medium">{keyInfo.source}</div>
                </div>
              </div>
            </div>
          )}

          {publicKey && (
            <div>
              <h3 className="font-semibold mb-2">Public Key</h3>
              <div className="p-3 bg-gray-900 text-green-400 rounded font-mono text-xs break-all">
                {publicKey.substring(0, 100)}...
                <div className="text-gray-500 mt-2">
                  ({publicKey.length} bytes total)
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Key Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleRefreshKeys}
                disabled={isInitializing}
                className="p-3 border rounded hover:bg-gray-50 transition-colors disabled:bg-gray-100"
              >
                <div className="font-medium">Refresh Keys</div>
                <div className="text-sm text-gray-600">Reinitialize client and keys</div>
              </button>
              <div className="p-3 border rounded bg-gray-50">
                <div className="font-medium">Auto-managed</div>
                <div className="text-sm text-gray-600">Keys are automatically managed by SDK</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Key Management Info</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Public keys are retrieved from the FHEVM network</li>
              <li>• Private keys are managed client-side by the SDK</li>
              <li>• Gateway keys are managed by Zama Gateway</li>
              <li>• Keys are automatically refreshed when needed</li>
              <li>• EIP-712 signatures are used for user decryption</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
