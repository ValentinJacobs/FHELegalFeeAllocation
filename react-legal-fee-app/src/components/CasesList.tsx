import React from 'react';
import { CaseInfo } from '../types';

interface CasesListProps {
  cases: CaseInfo[];
  parties: { [caseId: number]: string[] };
  loading: boolean;
}

const CasesList: React.FC<CasesListProps> = ({ cases, parties, loading }) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  if (loading) {
    return (
      <div className="card case-list">
        <h2>Cases List</h2>
        <div id="casesList">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading case data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card case-list">
      <h2>Cases List</h2>
      <div id="casesList">
        {cases.length === 0 ? (
          <p className="status info">No cases found. Create a new case to get started.</p>
        ) : (
          cases.map((caseItem) => (
            <div key={caseItem.id} className="case-item">
              <div className="case-header">
                <div className="case-id">Case #{caseItem.id}</div>
                <div className={`case-status ${caseItem.isActive ? 'active' : 'settled'}`}>
                  {caseItem.isActive ? 'Active' : 'Settled'}
                </div>
              </div>
              <p>
                <strong>Number of Parties:</strong> {caseItem.partyCount}
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {new Date(caseItem.createdAt * 1000).toLocaleString()}
              </p>
              {caseItem.settledAt > 0 && (
                <p>
                  <strong>Settled:</strong>{' '}
                  {new Date(caseItem.settledAt * 1000).toLocaleString()}
                </p>
              )}
              {parties[caseItem.id] && parties[caseItem.id].length > 0 && (
                <div className="parties-list">
                  {parties[caseItem.id].map((party) => (
                    <span key={party} className="party-tag">
                      {formatAddress(party)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CasesList;
