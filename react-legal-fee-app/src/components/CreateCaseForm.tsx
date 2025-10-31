import React, { useState } from 'react';
import { ethers } from 'ethers';
import { UseFHEResult } from '../hooks/useFHE';

interface CreateCaseFormProps {
  contract: ethers.Contract | null;
  walletAddress: string;
  fhe: UseFHEResult;
  onSuccess: () => void;
  onStatusChange: (message: string, type: 'success' | 'error' | 'info') => void;
}

const CONTRACT_ADDRESS = '0x462368e2BeFEb579927821a6bdd571C68dA2EB26';

const CreateCaseForm: React.FC<CreateCaseFormProps> = ({
  contract,
  walletAddress,
  fhe,
  onSuccess,
  onStatusChange,
}) => {
  const [caseDescription, setCaseDescription] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [complexity, setComplexity] = useState('');
  const [partyAddresses, setPartyAddresses] = useState('');

  const handleCreateCase = async () => {
    try {
      if (!contract) {
        onStatusChange('Please connect your wallet first', 'error');
        return;
      }

      if (!fhe.isInitialized) {
        onStatusChange('FHE client is not initialized. Please reconnect your wallet.', 'error');
        return;
      }

      if (!caseDescription || !totalFee || !complexity || !partyAddresses) {
        onStatusChange('Please fill in all required information', 'error');
        return;
      }

      const addresses = partyAddresses
        .split('\n')
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0);

      if (addresses.length < 2) {
        onStatusChange('At least 2 party addresses are required', 'error');
        return;
      }

      onStatusChange('Encrypting case data...', 'info');

      try {
        // Convert totalFee to Wei and then to BigInt for uint64 encryption
        const feeWei = ethers.utils.parseEther(totalFee);
        const feeWeiBigInt = BigInt(feeWei.toString());

        // Encrypt totalFee as uint64
        const encryptedFee = await fhe.encryptUint64(
          feeWeiBigInt,
          CONTRACT_ADDRESS,
          walletAddress
        );

        // Encrypt complexity as uint32
        const complexityNum = parseInt(complexity);
        const encryptedComplexity = await fhe.encryptUint32(
          complexityNum,
          CONTRACT_ADDRESS,
          walletAddress
        );

        onStatusChange('Creating case with encrypted data...', 'info');

        // Call contract with encrypted values
        const tx = await contract.createCase(
          addresses,
          encryptedFee.handle,
          encryptedComplexity.handle,
          caseDescription,
          encryptedFee.proof
        );
        await tx.wait();

        // Clear form
        setCaseDescription('');
        setTotalFee('');
        setComplexity('');
        setPartyAddresses('');

        onStatusChange('Case created successfully with encrypted data!', 'success');
        onSuccess();
      } catch (encryptError: any) {
        console.error('Encryption or transaction failed:', encryptError);
        onStatusChange('Failed to encrypt data or create case: ' + encryptError.message, 'error');
      }
    } catch (error: any) {
      console.error('Failed to create case:', error);
      onStatusChange('Failed to create case: ' + error.message, 'error');
    }
  };

  return (
    <div className="card">
      <h2>Create New Case</h2>
      <div className="form-group">
        <label>Case Description:</label>
        <textarea
          id="caseDescription"
          placeholder="Enter case description..."
          rows={3}
          value={caseDescription}
          onChange={(e) => setCaseDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Total Fee (ETH):</label>
        <input
          type="number"
          id="totalFee"
          placeholder="0.1"
          step="0.001"
          min="0"
          value={totalFee}
          onChange={(e) => setTotalFee(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Complexity (1-100):</label>
        <input
          type="number"
          id="complexity"
          placeholder="50"
          min="1"
          max="100"
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Party Addresses (one per line):</label>
        <textarea
          id="partyAddresses"
          placeholder="0x123...&#10;0x456...&#10;0x789..."
          rows={4}
          value={partyAddresses}
          onChange={(e) => setPartyAddresses(e.target.value)}
        />
      </div>
      <button className="btn" onClick={handleCreateCase}>
        Create Case
      </button>
    </div>
  );
};

export default CreateCaseForm;
