import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FundingPayload } from "../types/wallet";
import { walletService } from "../services/wallet.service";

export const walletKeys = {
  wallet: ["wallet"] as const,
  ledger: ["wallet", "ledger"] as const,
  adminWallet: (userId: string) => ["admin", "wallet", userId] as const,
  adminLedger: (userId?: string) => ["admin", "wallet-ledger", userId ?? "all"] as const,
};

export function useWallet(enabled = true, refetchInterval = 30_000) {
  return useQuery({
    queryKey: walletKeys.wallet,
    queryFn: () => walletService.getWallet(),
    enabled,
    staleTime: 15_000,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
}

export function useWalletLedger(limit = 50, enabled = true) {
  return useQuery({
    queryKey: [...walletKeys.ledger, limit],
    queryFn: () => walletService.getLedger(limit),
    enabled,
    staleTime: 15_000,
  });
}

export function useAdminWallet(userId: string, enabled = true) {
  return useQuery({
    queryKey: walletKeys.adminWallet(userId),
    queryFn: () => walletService.getAdminWallet(userId),
    enabled: enabled && userId.length === 24,
    staleTime: 10_000,
  });
}

export function useAdminWalletLedger(userId?: string, limit = 50, enabled = true) {
  return useQuery({
    queryKey: [...walletKeys.adminLedger(userId), limit],
    queryFn: () => walletService.getAdminLedger(userId, limit),
    enabled,
    staleTime: 10_000,
  });
}

export function useAdminCreditWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: FundingPayload }) =>
      walletService.creditAdminWallet(userId, payload),
    onSuccess: (_, variables) => {
      invalidateWalletQueries(queryClient, variables.userId);
    },
  });
}

export function useAdminDebitWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: FundingPayload }) =>
      walletService.debitAdminWallet(userId, payload),
    onSuccess: (_, variables) => {
      invalidateWalletQueries(queryClient, variables.userId);
    },
  });
}

function invalidateWalletQueries(queryClient: QueryClient, userId: string) {
  queryClient.invalidateQueries({ queryKey: walletKeys.wallet });
  queryClient.invalidateQueries({ queryKey: walletKeys.ledger });
  queryClient.invalidateQueries({ queryKey: walletKeys.adminWallet(userId) });
  queryClient.invalidateQueries({ queryKey: walletKeys.adminLedger(userId) });
  queryClient.invalidateQueries({ queryKey: walletKeys.adminLedger() });
  queryClient.invalidateQueries({ queryKey: ["portfolio"] });
}
