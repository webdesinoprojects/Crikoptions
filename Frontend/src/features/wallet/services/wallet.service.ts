import { apiClient } from "@/lib/api/client";
import { FundingPayload, FundingResponse, WalletAccount, WalletLedgerEntry } from "../types/wallet";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class WalletService {
  async getWallet(): Promise<WalletAccount> {
    const response = await apiClient.get<ApiResponse<WalletAccount>>("/v1/wallet");
    return normalizeWallet(response.data.data);
  }

  async getLedger(limit = 50): Promise<WalletLedgerEntry[]> {
    const response = await apiClient.get<ApiResponse<WalletLedgerEntry[]>>("/v1/wallet/ledger", {
      params: { limit },
    });
    return response.data.data ?? [];
  }

  async getAdminWallet(userId: string): Promise<WalletAccount> {
    const response = await apiClient.get<ApiResponse<WalletAccount>>(`/v1/admin/users/${userId}/wallet`);
    return normalizeWallet(response.data.data);
  }

  async creditAdminWallet(userId: string, payload: FundingPayload): Promise<FundingResponse> {
    const response = await apiClient.post<ApiResponse<FundingResponse>>(
      `/v1/admin/users/${userId}/wallet/credit`,
      payload
    );
    return normalizeFundingResponse(response.data.data);
  }

  async debitAdminWallet(userId: string, payload: FundingPayload): Promise<FundingResponse> {
    const response = await apiClient.post<ApiResponse<FundingResponse>>(
      `/v1/admin/users/${userId}/wallet/debit`,
      payload
    );
    return normalizeFundingResponse(response.data.data);
  }

  async topUp(amount: number): Promise<FundingResponse> {
    const response = await apiClient.post<ApiResponse<FundingResponse>>(
      "/v1/wallet/topup",
      { amount }
    );
    return normalizeFundingResponse(response.data.data);
  }

  async getAdminLedger(userId?: string, limit = 50): Promise<WalletLedgerEntry[]> {
    const response = await apiClient.get<ApiResponse<WalletLedgerEntry[]>>("/v1/admin/wallet-ledger", {
      params: { userId: userId || undefined, limit },
    });
    return response.data.data ?? [];
  }
}

export const walletService = new WalletService();

function normalizeFundingResponse(response: FundingResponse): FundingResponse {
  return {
    wallet: normalizeWallet(response.wallet),
    ledgerEntry: response.ledgerEntry,
  };
}

function normalizeWallet(wallet: WalletAccount): WalletAccount {
  return {
    ...wallet,
    cashBalance: numberOrZero(wallet?.cashBalance),
    reservedBalance: numberOrZero(wallet?.reservedBalance),
    availableBalance: numberOrZero(wallet?.availableBalance),
  };
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
