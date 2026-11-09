import { supabase } from "@/lib/supabase";
import type { RecurringRule, TransactionType } from "@/types";

const FALLBACK_RECURRING: RecurringRule[] = [
  {
    id: "r1",
    name: "Internet IndiHome / Biznet",
    amount: 450000,
    type: "EXPENSE",
    interval: "MONTHLY",
    next_due_date: "2026-11-15",
    category: "Tagihan",
    is_paused: false,
    wallet_id: "11111111-1111-1111-1111-111111111111",
    wallet_name: "BCA",
  },
  {
    id: "r2",
    name: "Netflix Premium Family",
    amount: 186000,
    type: "EXPENSE",
    interval: "MONTHLY",
    next_due_date: "2026-11-20",
    category: "Tagihan",
    is_paused: false,
    wallet_id: "33333333-3333-3333-3333-333333333333",
    wallet_name: "GoPay",
  },
  {
    id: "r3",
    name: "Spotify Premium",
    amount: 86000,
    type: "EXPENSE",
    interval: "MONTHLY",
    next_due_date: "2026-11-28",
    category: "Tagihan",
    is_paused: true,
    wallet_id: "33333333-3333-3333-3333-333333333333",
    wallet_name: "GoPay",
  },
];

export async function fetchRecurringRules(): Promise<RecurringRule[]> {
  const { data, error } = await supabase
    .from("recurring_rules")
    .select("*, wallets!recurring_rules_wallet_id_fkey(name)")
    .order("next_due_date", { ascending: true });

  if (error) {
    console.warn("[Supabase] fetchRecurringRules fallback:", error.message);
    return FALLBACK_RECURRING;
  }
  if (!data || data.length === 0) return FALLBACK_RECURRING;

  return data.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    type: r.type as TransactionType,
    interval: r.interval as "MONTHLY" | "WEEKLY" | "YEARLY",
    next_due_date: r.next_due_date,
    category: r.category,
    is_paused: r.is_paused,
    wallet_id: r.wallet_id,
    wallet_name: r.wallets?.name || "Dompet",
    created_at: r.created_at,
  }));
}

export async function createRecurringRule(rule: {
  name: string;
  amount: number;
  type?: TransactionType;
  interval?: "MONTHLY" | "WEEKLY" | "YEARLY";
  next_due_date: string;
  category: string;
  wallet_id?: string;
}): Promise<RecurringRule> {
  const { data, error } = await supabase
    .from("recurring_rules")
    .insert({
      name: rule.name,
      amount: rule.amount,
      type: rule.type || "EXPENSE",
      interval: rule.interval || "MONTHLY",
      next_due_date: rule.next_due_date,
      category: rule.category || "Tagihan",
      wallet_id: rule.wallet_id || null,
      is_paused: false,
    })
    .select("*, wallets!recurring_rules_wallet_id_fkey(name)")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    type: data.type as TransactionType,
    interval: data.interval,
    next_due_date: data.next_due_date,
    category: data.category,
    is_paused: data.is_paused,
    wallet_id: data.wallet_id,
    wallet_name: data.wallets?.name || "Dompet",
  };
}

export async function togglePauseRecurringRule(id: string, is_paused: boolean): Promise<void> {
  const { error } = await supabase
    .from("recurring_rules")
    .update({ is_paused, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteRecurringRule(id: string): Promise<void> {
  const { error } = await supabase.from("recurring_rules").delete().eq("id", id);
  if (error) throw error;
}
