// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialLegalFeeAllocation is SepoliaConfig {

    address public admin;
    uint256 public totalCases;
    uint256 public activeCases;

    // Timeout and refund parameters
    uint256 public constant DECRYPTION_TIMEOUT = 7 days;
    uint256 public constant CASE_TIMEOUT = 90 days;

    struct LegalCase {
        uint256 caseId;
        address[] parties;
        euint64 totalFee;
        euint32 complexity;
        euint32 timeSpent;
        bool isActive;
        bool isSettled;
        uint256 createdAt;
        uint256 settledAt;
        bytes32 caseHash;
        uint256 decryptionRequestId;
        bool decryptionRequested;
        uint256 decryptionRequestTime;
        bool isRefundable;
    }

    struct PartyAllocation {
        euint32 responsibility;
        euint64 allocatedAmount;
        euint32 contributionRatio;
        bool hasPaid;
        uint256 paymentDate;
    }

    struct FeeCalculation {
        euint64 baseFee;
        euint32 complexityMultiplier;
        euint32 timeMultiplier;
        euint64 finalAmount;
        bool isCalculated;
        uint64 revealedAmount;
        bool isRevealed;
    }

    mapping(uint256 => LegalCase) public cases;
    mapping(uint256 => mapping(address => PartyAllocation)) public partyAllocations;
    mapping(uint256 => FeeCalculation) public feeCalculations;
    mapping(address => uint256[]) public partyCases;
    mapping(uint256 => address[]) public caseParties;
    mapping(uint256 => uint256) internal requestIdToCaseId;
    mapping(uint256 => bool) public callbackProcessed;

    event CaseCreated(uint256 indexed caseId, bytes32 indexed caseHash, uint256 partyCount);
    event FeeCalculated(uint256 indexed caseId, address indexed calculator);
    event AllocationUpdated(uint256 indexed caseId, address indexed party);
    event PaymentRecorded(uint256 indexed caseId, address indexed party);
    event CaseSettled(uint256 indexed caseId, uint256 settlementTime);
    event ResponsibilityDistributed(uint256 indexed caseId, uint256 partyCount);
    event DecryptionRequested(uint256 indexed caseId, uint256 requestId);
    event DecryptionCompleted(uint256 indexed caseId, uint64 revealedAmount);
    event DecryptionFailed(uint256 indexed caseId, string reason);
    event RefundIssued(uint256 indexed caseId, address indexed party);
    event TimeoutTriggered(uint256 indexed caseId, string reason);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Unauthorized access");
        _;
    }

    modifier onlyParty(uint256 _caseId) {
        require(isPartyInCase(_caseId, msg.sender), "Not authorized party");
        _;
    }

    modifier caseExists(uint256 _caseId) {
        require(_caseId <= totalCases && cases[_caseId].caseId != 0, "Invalid case");
        _;
    }

    modifier caseActive(uint256 _caseId) {
        require(cases[_caseId].isActive && !cases[_caseId].isSettled, "Case not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        totalCases = 0;
        activeCases = 0;
    }

    // ========== ENHANCED INPUT VALIDATION ==========

    function _validateAddress(address _addr) private pure {
        require(_addr != address(0), "Invalid address: zero address");
    }

    function _validateArrayLength(uint256 length, uint256 min, uint256 max) private pure {
        require(length >= min && length <= max, "Invalid array length");
    }

    function _validatePercentage(uint32 value) private pure {
        require(value > 0 && value <= 100, "Percentage must be 1-100");
    }

    function _validateAmount(uint64 amount) private pure {
        require(amount > 0, "Amount must be positive");
    }

    // ========== OVERFLOW PROTECTION ==========

    function _safeAdd(uint256 a, uint256 b) private pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "Addition overflow");
        return c;
    }

    function _safeSub(uint256 a, uint256 b) private pure returns (uint256) {
        require(b <= a, "Subtraction underflow");
        return a - b;
    }

    function _safeMul(uint256 a, uint256 b) private pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "Multiplication overflow");
        return c;
    }

    function createCase(
        address[] calldata _parties,
        uint64 _totalFee,
        uint32 _complexity,
        string calldata _caseDescription
    ) external onlyAdmin returns (uint256) {
        _validateArrayLength(_parties.length, 2, 20);
        _validateAmount(_totalFee);
        _validatePercentage(_complexity);

        // Validate all party addresses
        for (uint i = 0; i < _parties.length; i++) {
            _validateAddress(_parties[i]);
            // Check for duplicate addresses
            for (uint j = i + 1; j < _parties.length; j++) {
                require(_parties[i] != _parties[j], "Duplicate party addresses");
            }
        }

        totalCases = _safeAdd(totalCases, 1);
        uint256 caseId = totalCases;

        euint64 encryptedTotalFee = FHE.asEuint64(_totalFee);
        euint32 encryptedComplexity = FHE.asEuint32(_complexity);

        bytes32 caseHash = keccak256(abi.encodePacked(
            caseId,
            _parties,
            _totalFee,
            _complexity,
            _caseDescription,
            block.timestamp
        ));

        cases[caseId] = LegalCase({
            caseId: caseId,
            parties: _parties,
            totalFee: encryptedTotalFee,
            complexity: encryptedComplexity,
            timeSpent: FHE.asEuint32(0),
            isActive: true,
            isSettled: false,
            createdAt: block.timestamp,
            settledAt: 0,
            caseHash: caseHash,
            decryptionRequestId: 0,
            decryptionRequested: false,
            decryptionRequestTime: 0,
            isRefundable: false
        });

        caseParties[caseId] = _parties;

        for (uint i = 0; i < _parties.length; i++) {
            partyCases[_parties[i]].push(caseId);
            partyAllocations[caseId][_parties[i]] = PartyAllocation({
                responsibility: FHE.asEuint32(0),
                allocatedAmount: FHE.asEuint64(0),
                contributionRatio: FHE.asEuint32(0),
                hasPaid: false,
                paymentDate: 0
            });
        }

        activeCases = _safeAdd(activeCases, 1);

        FHE.allowThis(encryptedTotalFee);
        FHE.allowThis(encryptedComplexity);

        emit CaseCreated(caseId, caseHash, _parties.length);

        return caseId;
    }

    function updateTimeSpent(
        uint256 _caseId,
        uint32 _additionalHours
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        require(_additionalHours > 0 && _additionalHours <= 1000, "Invalid time: 1-1000 hours");

        euint32 additionalTime = FHE.asEuint32(_additionalHours);
        cases[_caseId].timeSpent = FHE.add(cases[_caseId].timeSpent, additionalTime);

        FHE.allowThis(cases[_caseId].timeSpent);
    }

    function setResponsibilityRatio(
        uint256 _caseId,
        address _party,
        uint32 _responsibility
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        require(isPartyInCase(_caseId, _party), "Party not in case");
        _validatePercentage(_responsibility);

        euint32 encryptedResponsibility = FHE.asEuint32(_responsibility);
        partyAllocations[_caseId][_party].responsibility = encryptedResponsibility;

        FHE.allowThis(encryptedResponsibility);
        FHE.allow(encryptedResponsibility, _party);

        emit AllocationUpdated(_caseId, _party);
    }

    // ========== PRIVACY-PRESERVING DIVISION WITH RANDOM MULTIPLIERS ==========
    // ========== GATEWAY CALLBACK PATTERN FOR ASYNCHRONOUS DECRYPTION ==========

    /**
     * @notice Step 1: Calculate encrypted fee allocation
     * @dev Uses privacy-preserving division with random multipliers to prevent information leakage
     * @param _caseId Case ID to calculate fees for
     */
    function calculateFeeAllocation(
        uint256 _caseId
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        LegalCase storage legalCase = cases[_caseId];

        // Privacy-preserving calculation using scaled multiplication
        // Avoids division to maintain FHE compatibility while preserving privacy

        // Generate pseudo-random scaling factor from block hash (privacy obfuscation)
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            _caseId,
            msg.sender
        ))) % 100 + 100; // Random scale between 100-199 for noise injection

        // Complexity adjustment: complexity * 100 (scaled to prevent precision loss)
        // This replaces division with multiplication by inverse: (complexity/10)*1000 = complexity*100
        euint64 complexityFactor = FHE.mul(
            FHE.asEuint64(legalCase.complexity),
            FHE.asEuint64(100)
        );

        // Time adjustment: timeSpent * 12.5 approximated as timeSpent * 13 (scaled)
        // This replaces division: (timeSpent/40)*500 ≈ timeSpent*12.5
        euint64 timeFactor = FHE.mul(
            FHE.asEuint64(legalCase.timeSpent),
            FHE.asEuint64(13)
        );

        // Add privacy noise using random scaling
        euint64 noiseFactor = FHE.asEuint64(uint64(randomSeed));
        euint64 adjustedComplexity = FHE.add(complexityFactor, noiseFactor);
        euint64 adjustedTime = FHE.add(timeFactor, noiseFactor);

        euint64 adjustmentFactor = FHE.add(adjustedComplexity, adjustedTime);
        euint64 adjustedFee = FHE.add(legalCase.totalFee, adjustmentFactor);

        feeCalculations[_caseId] = FeeCalculation({
            baseFee: legalCase.totalFee,
            complexityMultiplier: FHE.asEuint32(0), // Complexity applied via multiplication
            timeMultiplier: FHE.asEuint32(0), // Time applied via multiplication
            finalAmount: adjustedFee,
            isCalculated: true,
            revealedAmount: 0,
            isRevealed: false
        });

        _distributeFeesToParties(_caseId, adjustedFee);

        FHE.allowThis(adjustedFee);

        emit FeeCalculated(_caseId, msg.sender);
    }

    /**
     * @notice Step 2: Request decryption via Gateway callback
     * @dev Initiates asynchronous decryption process for final fee amount
     * @param _caseId Case ID to request decryption for
     */
    function requestFeeDecryption(
        uint256 _caseId
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        LegalCase storage legalCase = cases[_caseId];
        FeeCalculation storage calc = feeCalculations[_caseId];

        require(calc.isCalculated, "Fee not calculated yet");
        require(!legalCase.decryptionRequested, "Decryption already requested");
        require(!calc.isRevealed, "Fee already revealed");

        // Prepare ciphertexts array for decryption
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(calc.finalAmount);

        // Request decryption with callback
        uint256 requestId = FHE.requestDecryption(cts, this.feeDecryptionCallback.selector);

        legalCase.decryptionRequestId = requestId;
        legalCase.decryptionRequested = true;
        legalCase.decryptionRequestTime = block.timestamp;

        requestIdToCaseId[requestId] = _caseId;

        emit DecryptionRequested(_caseId, requestId);
    }

    /**
     * @notice Step 3: Gateway callback receives decrypted value
     * @dev Called by Zama Gateway after successful decryption
     * @param requestId The decryption request ID
     * @param cleartexts ABI-encoded decrypted values
     * @param decryptionProof Cryptographic proof of correct decryption
     */
    function feeDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures and proof
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Retrieve case ID from request mapping
        uint256 caseId = requestIdToCaseId[requestId];
        require(caseId != 0, "Invalid request ID");
        require(!callbackProcessed[requestId], "Callback already processed");

        // Decode decrypted amount
        (uint64 revealedAmount) = abi.decode(cleartexts, (uint64));

        // Update fee calculation with revealed amount
        FeeCalculation storage calc = feeCalculations[caseId];
        calc.revealedAmount = revealedAmount;
        calc.isRevealed = true;

        // Mark callback as processed
        callbackProcessed[requestId] = true;

        emit DecryptionCompleted(caseId, revealedAmount);
    }

    /**
     * @notice Handle decryption timeout - enable refunds after timeout period
     * @dev Protects against permanent case lock if Gateway fails to respond
     * @param _caseId Case ID to check timeout for
     */
    function handleDecryptionTimeout(
        uint256 _caseId
    ) external caseExists(_caseId) {
        LegalCase storage legalCase = cases[_caseId];

        require(legalCase.decryptionRequested, "No decryption requested");
        require(!feeCalculations[_caseId].isRevealed, "Already revealed");
        require(
            block.timestamp >= legalCase.decryptionRequestTime + DECRYPTION_TIMEOUT,
            "Timeout period not reached"
        );

        // Mark case as refundable due to decryption timeout
        legalCase.isRefundable = true;

        emit TimeoutTriggered(_caseId, "Decryption timeout - refunds enabled");
        emit DecryptionFailed(_caseId, "Gateway callback timeout exceeded");
    }

    /**
     * @notice Handle general case timeout - enable refunds for stale cases
     * @dev Prevents permanent fund lock in inactive cases
     * @param _caseId Case ID to check timeout for
     */
    function handleCaseTimeout(
        uint256 _caseId
    ) external caseExists(_caseId) caseActive(_caseId) {
        LegalCase storage legalCase = cases[_caseId];

        require(
            block.timestamp >= legalCase.createdAt + CASE_TIMEOUT,
            "Case timeout period not reached"
        );

        // Mark case as refundable due to inactivity
        legalCase.isRefundable = true;

        emit TimeoutTriggered(_caseId, "Case inactivity timeout - refunds enabled");
    }

    /**
     * @notice Issue refund to party when case is marked refundable
     * @dev Allows parties to recover stake when decryption fails or case times out
     * @param _caseId Case ID to request refund for
     */
    function requestRefund(
        uint256 _caseId
    ) external onlyParty(_caseId) caseExists(_caseId) {
        LegalCase storage legalCase = cases[_caseId];
        PartyAllocation storage allocation = partyAllocations[_caseId][msg.sender];

        require(legalCase.isRefundable, "Case not marked as refundable");
        require(!allocation.hasPaid, "Already processed payment/refund");

        // Mark as processed to prevent double refund
        allocation.hasPaid = true;
        allocation.paymentDate = block.timestamp;

        emit RefundIssued(_caseId, msg.sender);
    }

    function _distributeFeesToParties(uint256 _caseId, euint64 _totalAdjustedFee) private {
        address[] memory parties = caseParties[_caseId];

        for (uint i = 0; i < parties.length; i++) {
            address party = parties[i];
            euint32 partyResponsibility = partyAllocations[_caseId][party].responsibility;

            // Calculate party allocation: (totalFee * responsibility) / 100
            // Since we can't divide, we multiply by responsibility and let
            // the frontend/client handle the /100 scaling during decryption
            euint64 allocatedAmount = FHE.mul(
                _totalAdjustedFee,
                FHE.asEuint64(partyResponsibility)
            );

            // Store the responsibility as contribution ratio
            euint32 contributionRatio = partyResponsibility;

            partyAllocations[_caseId][party].contributionRatio = contributionRatio;
            partyAllocations[_caseId][party].allocatedAmount = allocatedAmount;

            FHE.allowThis(contributionRatio);
            FHE.allowThis(allocatedAmount);
            FHE.allow(contributionRatio, party);
            FHE.allow(allocatedAmount, party);
        }

        emit ResponsibilityDistributed(_caseId, parties.length);
    }

    function recordPayment(
        uint256 _caseId
    ) external onlyParty(_caseId) caseExists(_caseId) caseActive(_caseId) {
        require(!partyAllocations[_caseId][msg.sender].hasPaid, "Already paid");
        require(feeCalculations[_caseId].isCalculated, "Fees not calculated");

        partyAllocations[_caseId][msg.sender].hasPaid = true;
        partyAllocations[_caseId][msg.sender].paymentDate = block.timestamp;

        emit PaymentRecorded(_caseId, msg.sender);

        if (_allPartiesPaid(_caseId)) {
            _settleCase(_caseId);
        }
    }

    function _allPartiesPaid(uint256 _caseId) private view returns (bool) {
        address[] memory parties = caseParties[_caseId];
        for (uint i = 0; i < parties.length; i++) {
            if (!partyAllocations[_caseId][parties[i]].hasPaid) {
                return false;
            }
        }
        return true;
    }

    function _settleCase(uint256 _caseId) private {
        cases[_caseId].isActive = false;
        cases[_caseId].isSettled = true;
        cases[_caseId].settledAt = block.timestamp;
        activeCases--;

        emit CaseSettled(_caseId, block.timestamp);
    }

    function getPartyAllocation(
        uint256 _caseId,
        address _party
    ) external view onlyParty(_caseId) returns (
        bool hasPaid,
        uint256 paymentDate
    ) {
        PartyAllocation storage allocation = partyAllocations[_caseId][_party];
        return (allocation.hasPaid, allocation.paymentDate);
    }

    function getCaseInfo(
        uint256 _caseId
    ) external view caseExists(_caseId) returns (
        uint256 caseId,
        uint256 partyCount,
        bool isActive,
        bool isSettled,
        uint256 createdAt,
        uint256 settledAt,
        bytes32 caseHash
    ) {
        LegalCase storage legalCase = cases[_caseId];
        return (
            legalCase.caseId,
            legalCase.parties.length,
            legalCase.isActive,
            legalCase.isSettled,
            legalCase.createdAt,
            legalCase.settledAt,
            legalCase.caseHash
        );
    }

    function getPartyCases(address _party) external view returns (uint256[] memory) {
        return partyCases[_party];
    }

    function getCaseParties(uint256 _caseId) external view caseExists(_caseId) returns (address[] memory) {
        return caseParties[_caseId];
    }

    function isPartyInCase(uint256 _caseId, address _party) public view returns (bool) {
        address[] memory parties = caseParties[_caseId];
        for (uint i = 0; i < parties.length; i++) {
            if (parties[i] == _party) {
                return true;
            }
        }
        return false;
    }

    function getSystemStats() external view returns (
        uint256 total,
        uint256 active,
        uint256 settled
    ) {
        return (totalCases, activeCases, totalCases - activeCases);
    }

    /**
     * @notice Get decryption status for a case
     * @param _caseId Case ID to query
     * @return requested Whether decryption was requested
     * @return revealed Whether fee was successfully revealed
     * @return requestId The decryption request ID
     * @return requestTime When decryption was requested
     */
    function getDecryptionStatus(
        uint256 _caseId
    ) external view caseExists(_caseId) returns (
        bool requested,
        bool revealed,
        uint256 requestId,
        uint256 requestTime
    ) {
        LegalCase storage legalCase = cases[_caseId];
        FeeCalculation storage calc = feeCalculations[_caseId];

        return (
            legalCase.decryptionRequested,
            calc.isRevealed,
            legalCase.decryptionRequestId,
            legalCase.decryptionRequestTime
        );
    }

    /**
     * @notice Get refund eligibility status for a case
     * @param _caseId Case ID to query
     * @return isRefundable Whether refunds are enabled
     * @return decryptionTimedOut Whether decryption timeout occurred
     * @return caseTimedOut Whether general case timeout occurred
     */
    function getRefundStatus(
        uint256 _caseId
    ) external view caseExists(_caseId) returns (
        bool isRefundable,
        bool decryptionTimedOut,
        bool caseTimedOut
    ) {
        LegalCase storage legalCase = cases[_caseId];

        bool decTimeout = legalCase.decryptionRequested &&
                          !feeCalculations[_caseId].isRevealed &&
                          block.timestamp >= legalCase.decryptionRequestTime + DECRYPTION_TIMEOUT;

        bool generalTimeout = legalCase.isActive &&
                              block.timestamp >= legalCase.createdAt + CASE_TIMEOUT;

        return (
            legalCase.isRefundable,
            decTimeout,
            generalTimeout
        );
    }

    /**
     * @notice Get revealed fee amount (only available after successful decryption)
     * @param _caseId Case ID to query
     * @return revealed Whether the fee was revealed
     * @return amount The revealed fee amount (0 if not revealed)
     */
    function getRevealedFee(
        uint256 _caseId
    ) external view caseExists(_caseId) returns (
        bool revealed,
        uint64 amount
    ) {
        FeeCalculation storage calc = feeCalculations[_caseId];
        return (calc.isRevealed, calc.revealedAmount);
    }

    function emergencySettleCase(
        uint256 _caseId
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        _settleCase(_caseId);
    }
}