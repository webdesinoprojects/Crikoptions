export interface WalletAccount {
  _id: string;
  userId: string;
  currency: "PAPER_INR" | string;
  cashBalance: number;
  reservedBalance: number;
  availableBalance: number;
  status: "ACTIVE" | string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletLedgerEntry {
  _id: string;
  walletId: string;
  userId: string;
  type: "ADMIN_CREDIT" | "ADMIN_DEBIT" | string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface FundingPayload {
  amount: number;
  reason?: string;
}

export interface FundingResponse {
  wallet: WalletAccount;
  ledgerEntry: WalletLedgerEntry;
}
