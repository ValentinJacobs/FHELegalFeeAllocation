export interface CaseInfo {
  id: number;
  partyCount: number;
  isActive: boolean;
  isCalculated: boolean;
  createdAt: number;
  settledAt: number;
  caseHash: string;
}

export interface SystemStats {
  totalCases: number;
  activeCases: number;
  settledCases: number;
}

export interface PartyAllocation {
  hasAllocation: boolean;
  amount: number;
}

export type StatusType = 'success' | 'error' | 'info';

export interface StatusMessage {
  message: string;
  type: StatusType;
}
