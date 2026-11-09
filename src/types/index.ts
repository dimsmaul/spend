export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  wallet_id: string;
  wallet_name?: string;
  receipt_url?: string | null;
}

export type WalletType = "BANK" | "E_WALLET" | "CASH" | "INVESTMENT";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  icon?: string;
  accountNumber?: string;
}

export interface Budget {
  id: string;
  category: string;
  target_amount: number;
  spent_amount: number;
  period: string; // YYYY-MM
  color?: string;
}

export type InvestmentType = "STOCK" | "CRYPTO" | "GOLD" | "MUTUAL_FUND" | "DEPOSITO";

export interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  units: number;
  avg_buy_price: number;
  current_price: number;
  currency: string;
}

export interface AIAdvisorMessage {
  id: string;
  role: "user" | "model";
  text: string;
  created_at: string;
}

export type DebtType = "PAYABLE" | "RECEIVABLE";
export type DebtStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Debt {
  id: string;
  type: DebtType;
  person_name: string;
  amount: number;
  remaining_amount: number;
  due_date: string;
  status: DebtStatus;
  wallet_id?: string | null;
  wallet_name?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  wallet_id?: string | null;
  wallet_name?: string | null;
  icon?: string | null;
  is_emergency_fund?: boolean;
  created_at?: string;
}

export interface RecurringRule {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  interval: "MONTHLY" | "WEEKLY" | "YEARLY";
  next_due_date: string;
  wallet_id?: string | null;
  wallet_name?: string | null;
  category: string;
  is_paused: boolean;
  created_at?: string;
}

export interface InboxItem {
  id: string;
  source: "RECEIPT" | "BANK_CSV" | "RECURRING" | "MANUAL";
  description: string;
  amount: number;
  date: string;
  category: string;
  wallet_id?: string | null;
  wallet_name?: string | null;
  status: "PENDING" | "APPROVED" | "DISCARDED";
  confidence_score?: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  currency: string;
  use_decimals: boolean;
  pin_enabled: boolean;
}
