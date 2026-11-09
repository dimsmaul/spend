import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as walletsApi from "@/lib/api/wallets";
import * as txApi from "@/lib/api/transactions";
import * as budgetsApi from "@/lib/api/budgets";
import * as investApi from "@/lib/api/investments";
import * as debtsApi from "@/lib/api/debts";
import * as goalsApi from "@/lib/api/goals";
import * as recurringApi from "@/lib/api/recurring";
import * as inboxApi from "@/lib/api/inbox";
import * as profileApi from "@/lib/api/profile";
import * as advisorApi from "@/lib/api/advisor";
import type { TransactionType, InboxItem } from "@/types";

// ======================== WALLETS ========================
export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: walletsApi.fetchWallets,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

export function useTransferWallets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsApi.transferBetweenWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// ======================== TRANSACTIONS ========================
export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: txApi.fetchTransactions,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: txApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: txApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

// ======================== BUDGETS ========================
export function useBudgets(period?: string) {
  return useQuery({
    queryKey: ["budgets", period],
    queryFn: () => budgetsApi.fetchBudgets(period),
  });
}

export function useUpdateBudgetTarget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, targetAmount }: { id: string; targetAmount: number }) =>
      budgetsApi.updateBudgetTarget(id, targetAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: budgetsApi.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

// ======================== INVESTMENTS ========================
export function useHoldings() {
  return useQuery({
    queryKey: ["holdings"],
    queryFn: investApi.fetchHoldings,
  });
}

export function useCreateHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investApi.createHolding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
    },
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investApi.deleteHolding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
    },
  });
}

// ======================== DEBTS ========================
export function useDebts() {
  return useQuery({
    queryKey: ["debts"],
    queryFn: debtsApi.fetchDebts,
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: debtsApi.createDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function usePayDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: debtsApi.recordDebtPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: debtsApi.deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

// ======================== GOALS ========================
export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: goalsApi.fetchGoals,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDepositGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.depositToGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

// ======================== RECURRING ========================
export function useRecurringRules() {
  return useQuery({
    queryKey: ["recurring"],
    queryFn: recurringApi.fetchRecurringRules,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.createRecurringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

export function useToggleRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPaused }: { id: string; isPaused: boolean }) =>
      recurringApi.togglePauseRecurringRule(id, isPaused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.deleteRecurringRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
    },
  });
}

// ======================== INBOX ========================
export function useInbox() {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: inboxApi.fetchInbox,
  });
}

export function useCreateInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inboxApi.createInboxItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useApproveInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      item,
      walletId,
      category,
      type,
    }: {
      item: InboxItem;
      walletId: string;
      category: string;
      type?: TransactionType;
    }) => inboxApi.approveInboxItem(item, walletId, category, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDiscardInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inboxApi.discardInboxItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

// ======================== PROFILE ========================
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ======================== ADVISOR ========================
export function useAdvisorMessages(sessionId?: string) {
  return useQuery({
    queryKey: ["advisorMessages", sessionId],
    queryFn: () => advisorApi.fetchAdvisorMessages(sessionId),
  });
}

export function useSendAdvisorMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advisorApi.saveAdvisorMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisorMessages"] });
    },
  });
}
