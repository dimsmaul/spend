import { supabase } from "@/lib/supabase";
import type { Transaction, TransactionType } from "@/types";

const FALLBACK_TRANSACTIONS: Transaction[] = [
  { id: "1", type: "EXPENSE", amount: 65000, category: "Kuliner", description: "Makan Siang & Es Kopi", date: "2026-11-08", wallet_id: "11111111-1111-1111-1111-111111111111", wallet_name: "BCA" },
  { id: "2", type: "EXPENSE", amount: 1000000, category: "Investasi", description: "Top up Reksadana", date: "2026-11-07", wallet_id: "22222222-2222-2222-2222-222222222222", wallet_name: "Mandiri" },
  { id: "3", type: "INCOME", amount: 15000000, category: "Pendapatan", description: "Gaji Pokok", date: "2026-11-01", wallet_id: "22222222-2222-2222-2222-222222222222", wallet_name: "Mandiri" },
  { id: "4", type: "EXPENSE", amount: 150000, category: "Transport", description: "Bensin Mobil", date: "2026-10-30", wallet_id: "44444444-4444-4444-4444-444444444444", wallet_name: "Tunai / Dompet" },
];

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, wallets!transactions_wallet_id_fkey(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Supabase] fetchTransactions fallback:", error.message);
    return FALLBACK_TRANSACTIONS;
  }
  if (!data || data.length === 0) return FALLBACK_TRANSACTIONS;

  return data.map((t) => ({
    id: t.id,
    type: t.type as TransactionType,
    amount: Number(t.amount),
    category: t.category,
    description: t.description,
    date: t.date,
    wallet_id: t.wallet_id || "",
    wallet_name: t.wallets?.name || "Dompet",
    receipt_url: t.receipt_url,
  }));
}

export async function createTransaction(tx: {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  wallet_id: string;
  date?: string;
  receipt_url?: string | null;
}): Promise<Transaction> {
  const dateStr = tx.date || new Date().toISOString().split("T")[0];

  // 1. Insert transaction
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      wallet_id: tx.wallet_id,
      date: dateStr,
      receipt_url: tx.receipt_url,
    })
    .select("*, wallets!transactions_wallet_id_fkey(name)")
    .single();

  if (error) throw error;

  // 2. Adjust wallet balance
  if (tx.wallet_id) {
    const { data: w } = await supabase
      .from("wallets")
      .select("balance")
      .eq("id", tx.wallet_id)
      .single();

    if (w) {
      const current = Number(w.balance);
      const updated = tx.type === "INCOME" ? current + tx.amount : current - tx.amount;
      await supabase.from("wallets").update({ balance: updated }).eq("id", tx.wallet_id);
    }
  }

  // 3. Update budget spent if EXPENSE
  if (tx.type === "EXPENSE") {
    const period = dateStr.slice(0, 7);
    const { data: b } = await supabase
      .from("budgets")
      .select("id, spent_amount")
      .eq("category", tx.category)
      .eq("period", period)
      .maybeSingle();

    if (b) {
      await supabase
        .from("budgets")
        .update({ spent_amount: Number(b.spent_amount) + tx.amount })
        .eq("id", b.id);
    }
  }

  return {
    id: data.id,
    type: data.type as TransactionType,
    amount: Number(data.amount),
    category: data.category,
    description: data.description,
    date: data.date,
    wallet_id: data.wallet_id,
    wallet_name: data.wallets?.name || "Dompet",
    receipt_url: data.receipt_url,
  };
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}
