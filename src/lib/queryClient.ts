import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Centralized query keys for easy invalidation
export const queryKeys = {
  wallets: ["wallets"] as const,
  transactions: (walletId?: string) => ["transactions", { walletId }] as const,
  budgets: (periodId?: string) => ["budgets", { periodId }] as const,
  investments: ["investments"] as const,
  netWorth: ["netWorth"] as const,
  advisorMessages: (sessionId?: string) => ["advisor", { sessionId }] as const,
};
