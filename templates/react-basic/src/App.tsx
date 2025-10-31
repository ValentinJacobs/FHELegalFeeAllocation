import { useState } from 'react';
import { FhevmClient } from '@fhevm/sdk';
import './App.css';

function App() {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Encryption state
  const [encryptValue, setEncryptValue] = useState('');
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');

  const initializeClient = async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask.');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const fhevmClient = await FhevmClient.create({
        provider: window.ethereum,
        network: 'sepolia',
        gatewayUrl: 'https://gateway.zama.ai',
      });

      setClient(fhevmClient);
      setIsInitialized(true);

      // Get user address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleEncrypt = async () => {
    if (!client || !contractAddress || !userAddress) {
      setError('Please initialize client and set addresses');
      return;
    }

    try {
      const input = client.createEncryptedInput(contractAddress, userAddress);
      input.add32(parseInt(encryptValue));
      const encrypted = input.encrypt();

      setEncryptedData({
        handle: encrypted.handles[0],
        proof: encrypted.inputProof,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
    }
  };

  return (
    <div className="container">
      <h1>React + FHEVM SDK</h1>
      <p className="subtitle">Basic example demonstrating FHEVM SDK integration</p>

      <div className="card">
        {!isInitialized ? (
          <div>
            <p>Initialize the FHEVM client to get started</p>
            <button onClick={initializeClient} disabled={isInitializing}>
              {isInitializing ? 'Initializing...' : 'Initialize FHEVM Client'}
            </button>
            {error && <p className="error">{error}</p>}
          </div>
        ) : (
          <div>
            <div className="status success">
              ✓ FHEVM Client Initialized
            </div>

            <div className="form-group">
              <label>Contract Address:</label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="form-group">
              <label>User Address:</label>
              <input
                type="text"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="form-group">
              <label>Value to Encrypt (uint32):</label>
              <input
                type="number"
                value={encryptValue}
                onChange={(e) => setEncryptValue(e.target.value)}
                placeholder="Enter a number"
              />
            </div>

            <button onClick={handleEncrypt}>Encrypt Value</button>

            {encryptedData && (
              <div className="result">
                <h3>Encrypted Data:</h3>
                <p><strong>Handle:</strong></p>
                <code>{encryptedData.handle}</code>
                <p><strong>Proof:</strong></p>
                <code>{encryptedData.proof.substring(0, 50)}...</code>
              </div>
            )}

            {error && <p className="error">{error}</p>}
          </div>
        )}
      </div>

      <div className="info">
        <h2>Features:</h2>
        <ul>
          <li>✓ FHEVM client initialization</li>
          <li>✓ Encryption of uint32 values</li>
          <li>✓ Integration with MetaMask</li>
          <li>✓ Generate encrypted handles and proofs</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
