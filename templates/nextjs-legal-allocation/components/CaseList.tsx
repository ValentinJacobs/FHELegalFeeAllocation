'use client';

import { useState, useEffect } from 'react';
import type { FhevmClient } from '@fhevm/sdk';
import { useContract } from '@fhevm/sdk/react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
  'function getCaseInfo(uint256 _caseId) external view returns (uint256 caseId, uint256 partyCount, bool isActive, bool isSettled, uint256 createdAt, uint256 settledAt, bytes32 caseHash)',
  'function getSystemStats() external view returns (uint256 total, uint256 active, uint256 settled)',
];

interface CaseListProps {
  client: FhevmClient;
}

interface CaseInfo {
  caseId: number;
  partyCount: number;
  isActive: boolean;
  isSettled: boolean;
  createdAt: number;
  caseHash: string;
}

export default function CaseList({ client }: CaseListProps) {
  const { read, isLoading } = useContract(client, CONTRACT_ADDRESS, CONTRACT_ABI);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    settled: number;
  } | null>(null);
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);

      // Load system stats
      const statsResult = await read('getSystemStats', []);
      if (statsResult) {
        setStats({
          total: Number(statsResult[0]),
          active: Number(statsResult[1]),
          settled: Number(statsResult[2]),
        });

        // Load case details for each case
        const casePromises = [];
        for (let i = 1; i <= Number(statsResult[0]); i++) {
          casePromises.push(read('getCaseInfo', [i]));
        }

        const caseResults = await Promise.all(casePromises);
        const loadedCases: CaseInfo[] = caseResults
          .filter((result) => result !== null)
          .map((result: any) => ({
            caseId: Number(result[0]),
            partyCount: Number(result[1]),
            isActive: result[2],
            isSettled: result[3],
            createdAt: Number(result[4]),
            caseHash: result[6],
          }));

        setCases(loadedCases);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (isLoading && cases.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Case List</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Case List</h2>
        <button onClick={loadData} className="btn btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Cases</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{stats.active}</div>
            <div className="text-sm text-green-600">Active</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.settled}</div>
            <div className="text-sm text-gray-600">Settled</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {cases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No cases found. Create your first case to get started.
          </div>
        ) : (
          cases.map((caseInfo) => (
            <div
              key={caseInfo.caseId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">Case #{caseInfo.caseId}</h3>
                  <p className="text-sm text-gray-600">
                    {caseInfo.partyCount} parties
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    caseInfo.isSettled
                      ? 'bg-gray-100 text-gray-700'
                      : caseInfo.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {caseInfo.isSettled ? 'Settled' : caseInfo.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Created: {formatDate(caseInfo.createdAt)}</p>
                <p className="font-mono text-xs truncate">
                  Hash: {caseInfo.caseHash}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Privacy Note:</strong> All sensitive data (fees, allocations) are encrypted
          and stored on-chain. Only authorized parties can decrypt their allocated amounts.
        </p>
      </div>
    </div>
  );
}
