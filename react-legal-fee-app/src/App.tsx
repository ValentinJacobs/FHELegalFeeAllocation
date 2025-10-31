import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Header from './components/Header';
import WalletConnect from './components/WalletConnect';
import CreateCaseForm from './components/CreateCaseForm';
import CaseManagement from './components/CaseManagement';
import CasesList from './components/CasesList';
import { CaseInfo, SystemStats, StatusType } from './types';
import { useFHE } from './hooks/useFHE';

const CONTRACT_ADDRESS = '0x462368e2BeFEb579927821a6bdd571C68dA2EB26';
const CONTRACT_ABI = [
  'function createCase(address[] calldata _parties, uint64 _totalFee, uint32 _complexity, string calldata _caseDescription) external returns (uint256)',
  'function updateTimeSpent(uint256 _caseId, uint32 _additionalHours) external',
  'function setResponsibilityRatio(uint256 _caseId, address _party, uint32 _responsibility) external',
  'function calculateFeeAllocation(uint256 _caseId) external',
  'function recordPayment(uint256 _caseId) external',
  'function emergencySettleCase(uint256 _caseId) external',
  'function getCaseInfo(uint256 _caseId) external view returns (uint256, uint256, bool, bool, uint256, uint256, bytes32)',
  'function getPartyCases(address _party) external view returns (uint256[])',
  'function getCaseParties(uint256 _caseId) external view returns (address[])',
  'function getSystemStats() external view returns (uint256, uint256, uint256)',
  'function getPartyAllocation(uint256 _caseId, address _party) external view returns (bool, uint256)',
  'function totalCases() external view returns (uint256)',
  'event CaseCreated(uint256 indexed caseId, bytes32 indexed caseHash, uint256 partyCount)',
  'event FeeCalculated(uint256 indexed caseId, address indexed calculator)',
  'event AllocationUpdated(uint256 indexed caseId, address indexed party)',
  'event PaymentRecorded(uint256 indexed caseId, address indexed party)',
  'event CaseSettled(uint256 indexed caseId, uint256 settlementTime)',
];

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [stats, setStats] = useState<SystemStats>({
    totalCases: 0,
    activeCases: 0,
    settledCases: 0,
  });
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [parties, setParties] = useState<{ [caseId: number]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    message: string;
    type: StatusType;
  } | null>(null);

  // Initialize FHE hook
  const fhe = useFHE();

  const showStatus = useCallback((message: string, type: StatusType) => {
    setStatusMessage({ message, type });
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  }, []);

  const loadSystemStats = useCallback(async () => {
    if (!contract) return;

    try {
      const systemStats = await contract.getSystemStats();
      setStats({
        totalCases: systemStats[0].toNumber(),
        activeCases: systemStats[1].toNumber(),
        settledCases: systemStats[2].toNumber(),
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, [contract]);

  const loadCases = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const totalCases = await contract.totalCases();
      const totalCasesNum = totalCases.toNumber();

      const casesData: CaseInfo[] = [];
      const partiesData: { [caseId: number]: string[] } = {};

      for (let i = 1; i <= totalCasesNum; i++) {
        try {
          const caseInfo = await contract.getCaseInfo(i);
          const caseParties = await contract.getCaseParties(i);

          casesData.push({
            id: i,
            partyCount: caseInfo[1].toNumber(),
            isActive: caseInfo[2],
            isCalculated: caseInfo[3],
            createdAt: caseInfo[4].toNumber(),
            settledAt: caseInfo[5].toNumber(),
            caseHash: caseInfo[6],
          });

          partiesData[i] = caseParties;
        } catch (error) {
          console.error(`Failed to load case ${i}:`, error);
        }
      }

      setCases(casesData);
      setParties(partiesData);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();

        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        setProvider(web3Provider);
        setContract(contractInstance);
        setWalletAddress(address);
        setIsConnected(true);

        showStatus('Wallet connected successfully! Initializing FHE client...', 'info');

        // Initialize FHE client after wallet connection
        try {
          const network = await web3Provider.getNetwork();
          await fhe.initialize({
            provider: web3Provider,
            network: network.name === 'unknown' ? 'localhost' : network.name,
            gatewayUrl: 'https://gateway.zama.ai',
          });
          showStatus('Wallet and FHE client connected successfully!', 'success');
        } catch (fheError: any) {
          console.error('Failed to initialize FHE client:', fheError);
          showStatus('Wallet connected but FHE initialization failed: ' + fheError.message, 'error');
        }
      } else {
        showStatus('Please install MetaMask wallet!', 'error');
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      showStatus('Failed to connect wallet: ' + error.message, 'error');
    }
  };

  useEffect(() => {
    if (isConnected && contract) {
      loadSystemStats();
      loadCases();
    }
  }, [isConnected, contract, loadSystemStats, loadCases]);

  useEffect(() => {
    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          window.location.reload();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handleSuccess = () => {
    loadSystemStats();
    loadCases();
  };

  const casesForSelect = cases.map((caseItem) => ({
    id: caseItem.id,
    label: `Case #${caseItem.id} - ${caseItem.isActive ? 'Active' : 'Settled'}`,
  }));

  return (
    <div className="container">
      <Header stats={stats} />
      <WalletConnect
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnect={connectWallet}
      />

      {statusMessage && (
        <div id="statusMessage">
          <div className={`status ${statusMessage.type}`}>{statusMessage.message}</div>
        </div>
      )}

      <div className="main-content">
        <CreateCaseForm
          contract={contract}
          walletAddress={walletAddress}
          fhe={fhe}
          onSuccess={handleSuccess}
          onStatusChange={showStatus}
        />
        <CaseManagement
          contract={contract}
          walletAddress={walletAddress}
          fhe={fhe}
          cases={casesForSelect}
          onSuccess={handleSuccess}
          onStatusChange={showStatus}
        />
      </div>

      <CasesList cases={cases} parties={parties} loading={loading} />
    </div>
  );
}

export default App;
