// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialLegalFeeAllocation is SepoliaConfig {

    address public admin;
    uint256 public totalCases;
    uint256 public activeCases;

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
    }

    mapping(uint256 => LegalCase) public cases;
    mapping(uint256 => mapping(address => PartyAllocation)) public partyAllocations;
    mapping(uint256 => FeeCalculation) public feeCalculations;
    mapping(address => uint256[]) public partyCases;
    mapping(uint256 => address[]) public caseParties;

    event CaseCreated(uint256 indexed caseId, bytes32 indexed caseHash, uint256 partyCount);
    event FeeCalculated(uint256 indexed caseId, address indexed calculator);
    event AllocationUpdated(uint256 indexed caseId, address indexed party);
    event PaymentRecorded(uint256 indexed caseId, address indexed party);
    event CaseSettled(uint256 indexed caseId, uint256 settlementTime);
    event ResponsibilityDistributed(uint256 indexed caseId, uint256 partyCount);

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

    function createCase(
        address[] calldata _parties,
        uint64 _totalFee,
        uint32 _complexity,
        string calldata _caseDescription
    ) external onlyAdmin returns (uint256) {
        require(_parties.length >= 2, "Minimum 2 parties required");
        require(_totalFee > 0, "Fee must be positive");
        require(_complexity > 0 && _complexity <= 100, "Invalid complexity");

        totalCases++;
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
            caseHash: caseHash
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

        activeCases++;

        FHE.allowThis(encryptedTotalFee);
        FHE.allowThis(encryptedComplexity);

        emit CaseCreated(caseId, caseHash, _parties.length);

        return caseId;
    }

    function updateTimeSpent(
        uint256 _caseId,
        uint32 _additionalHours
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        require(_additionalHours > 0, "Invalid time input");

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
        require(_responsibility <= 100, "Invalid responsibility ratio");

        euint32 encryptedResponsibility = FHE.asEuint32(_responsibility);
        partyAllocations[_caseId][_party].responsibility = encryptedResponsibility;

        FHE.allowThis(encryptedResponsibility);
        FHE.allow(encryptedResponsibility, _party);

        emit AllocationUpdated(_caseId, _party);
    }

    function calculateFeeAllocation(
        uint256 _caseId
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        LegalCase storage legalCase = cases[_caseId];

        euint32 complexityMultiplier = FHE.div(legalCase.complexity, 10);

        euint32 timeMultiplier = FHE.div(legalCase.timeSpent, 40);

        euint64 complexityFactor = FHE.mul(
            FHE.asEuint64(complexityMultiplier),
            FHE.asEuint64(1000)
        );

        euint64 timeFactor = FHE.mul(
            FHE.asEuint64(timeMultiplier),
            FHE.asEuint64(500)
        );

        euint64 adjustmentFactor = FHE.add(complexityFactor, timeFactor);
        euint64 adjustedFee = FHE.add(legalCase.totalFee, adjustmentFactor);

        feeCalculations[_caseId] = FeeCalculation({
            baseFee: legalCase.totalFee,
            complexityMultiplier: complexityMultiplier,
            timeMultiplier: timeMultiplier,
            finalAmount: adjustedFee,
            isCalculated: true
        });

        _distributeFeesToParties(_caseId, adjustedFee);

        FHE.allowThis(adjustedFee);

        emit FeeCalculated(_caseId, msg.sender);
    }

    function _distributeFeesToParties(uint256 _caseId, euint64 _totalAdjustedFee) private {
        address[] memory parties = caseParties[_caseId];
        euint32 totalResponsibility = FHE.asEuint32(0);

        for (uint i = 0; i < parties.length; i++) {
            totalResponsibility = FHE.add(
                totalResponsibility,
                partyAllocations[_caseId][parties[i]].responsibility
            );
        }

        for (uint i = 0; i < parties.length; i++) {
            address party = parties[i];
            euint32 partyResponsibility = partyAllocations[_caseId][party].responsibility;

            euint32 partyShare = FHE.mul(partyResponsibility, FHE.asEuint32(100));

            euint64 numerator = FHE.mul(_totalAdjustedFee, FHE.asEuint64(partyShare));
            euint64 allocatedAmount = FHE.div(numerator, 10000);

            euint32 contributionRatio = FHE.div(partyShare, 100);

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

    function emergencySettleCase(
        uint256 _caseId
    ) external onlyAdmin caseExists(_caseId) caseActive(_caseId) {
        _settleCase(_caseId);
    }
}