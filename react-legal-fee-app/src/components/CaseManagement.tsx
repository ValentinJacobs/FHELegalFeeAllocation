import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { UseFHEResult } from '../hooks/useFHE';

interface CaseManagementProps {
  contract: ethers.Contract | null;
  walletAddress: string;
  fhe: UseFHEResult;
  cases: Array<{ id: number; label: string }>;
  onSuccess: () => void;
  onStatusChange: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CONTRACT_ADDRESS = '0x462368e2BeFEb579927821a6bdd571C68dA2EB26';

const CaseManagement: React.FC<CaseManagementProps> = ({
  contract,
  walletAddress,
  fhe,
  cases,
  onSuccess,
  onStatusChange,
}) => {
  const [selectedCase, setSelectedCase] = useState('');
  const [additionalHours, setAdditionalHours] = useState('');
  const [parties, setParties] = useState<string[]>([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [responsibilityRatio, setResponsibilityRatio] = useState('');

  useEffect(() => {
    const loadParties = async () => {
      if (selectedCase && contract) {
        try {
          const caseParties = await contract.getCaseParties(selectedCase);
          setParties(caseParties);
        } catch (error: any) {
          console.error('Failed to load parties:', error);
          onStatusChange('Failed to load parties: ' + error.message, 'error');
        }
      } else {
        setParties([]);
      }
    };

    loadParties();
  }, [selectedCase, contract]);

  const handleUpdateTimeSpent = async () => {
    try {
      if (!contract) {
        onStatusChange('Please connect your wallet first', 'error');
        return;
      }

      if (!selectedCase || !additionalHours) {
        onStatusChange('Please select a case and enter work hours', 'error');
        return;
      }

      onStatusChange('Updating work time...', 'info');

      const tx = await contract.updateTimeSpent(selectedCase, additionalHours);
      await tx.wait();

      setAdditionalHours('');
      onStatusChange('Work time updated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to update time:', error);
      onStatusChange('Failed to update time: ' + error.message, 'error');
    }
  };

  const handleSetResponsibility = async () => {
    try {
      if (!contract) {
        onStatusChange('Please connect your wallet first', 'error');
        return;
      }

      if (!selectedCase || !selectedParty || !responsibilityRatio) {
        onStatusChange('Please select case, party and enter responsibility ratio', 'error');
        return;
      }

      onStatusChange('Setting responsibility ratio...', 'info');

      const tx = await contract.setResponsibilityRatio(
        selectedCase,
        selectedParty,
        responsibilityRatio
      );
      await tx.wait();

      setResponsibilityRatio('');
      onStatusChange('Responsibility ratio set successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to set responsibility:', error);
      onStatusChange('Failed to set responsibility: ' + error.message, 'error');
    }
  };

  const handleCalculateFees = async () => {
    try {
      if (!contract) {
        onStatusChange('Please connect your wallet first', 'error');
        return;
      }

      if (!selectedCase) {
        onStatusChange('Please select a case', 'error');
        return;
      }

      onStatusChange('Calculating fee allocation...', 'info');

      const tx = await contract.calculateFeeAllocation(selectedCase);
      await tx.wait();

      onStatusChange('Fee allocation calculation completed!', 'success');
    } catch (error: any) {
      console.error('Failed to calculate fees:', error);
      onStatusChange('Failed to calculate fees: ' + error.message, 'error');
    }
  };

  const handleRecordPayment = async () => {
    try {
      if (!contract) {
        onStatusChange('Please connect your wallet first', 'error');
        return;
      }

      if (!selectedCase) {
        onStatusChange('Please select a case', 'error');
        return;
      }

      onStatusChange('Recording payment...', 'info');

      const tx = await contract.recordPayment(selectedCase);
      await tx.wait();

      onStatusChange('Payment recorded successfully!', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      onStatusChange('Failed to record payment: ' + error.message, 'error');
    }
  };

  const handleSettleCase = async () => {
    try {
      if (!contract) {
        onStatusChange('Please connect your wallet first', 'error');
        return;
      }

      if (!selectedCase) {
        onStatusChange('Please select a case', 'error');
        return;
      }

      if (
        !window.confirm(
          'Are you sure you want to emergency settle this case? This action cannot be undone.'
        )
      ) {
        return;
      }

      onStatusChange('Settling case...', 'info');

      const tx = await contract.emergencySettleCase(selectedCase);
      await tx.wait();

      onStatusChange('Case settled successfully!', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to settle case:', error);
      onStatusChange('Failed to settle case: ' + error.message, 'error');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  return (
    <div className="card">
      <h2>Case Management</h2>
      <div className="form-group">
        <label>Select Case:</label>
        <select
          id="caseSelect"
          value={selectedCase}
          onChange={(e) => setSelectedCase(e.target.value)}
        >
          <option value="">Choose a case...</option>
          {cases.map((caseItem) => (
            <option key={caseItem.id} value={caseItem.id}>
              {caseItem.label}
            </option>
          ))}
        </select>
      </div>

      {selectedCase && (
        <div id="caseManagement">
          <div className="form-group">
            <label>Add Work Hours:</label>
            <input
              type="number"
              id="additionalHours"
              placeholder="10"
              min="1"
              value={additionalHours}
              onChange={(e) => setAdditionalHours(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={handleUpdateTimeSpent}>
              Update Time
            </button>
          </div>

          <div className="form-group">
            <label>Set Party Responsibility:</label>
            <select
              id="partySelect"
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
            >
              <option value="">Select party...</option>
              {parties.map((party) => (
                <option key={party} value={party}>
                  {formatAddress(party)}
                </option>
              ))}
            </select>
            <input
              type="number"
              id="responsibilityRatio"
              placeholder="Responsibility %"
              min="0"
              max="100"
              value={responsibilityRatio}
              onChange={(e) => setResponsibilityRatio(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={handleSetResponsibility}>
              Set Responsibility
            </button>
          </div>

          <div className="form-group">
            <button className="btn" onClick={handleCalculateFees}>
              Calculate Fee Allocation
            </button>
            <button className="btn btn-secondary" onClick={handleRecordPayment}>
              Record Payment
            </button>
            <button className="btn btn-danger" onClick={handleSettleCase}>
              Emergency Settle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
