import { supabase } from "@/lib/supabase";
import type { Budget } from "@/types";

const FALLBACK_BUDGETS: Budget[] = [
  { id: "b1", category: "Kuliner", target_amount: 2500000, spent_amount: 1650000, period: "2026-11", color: "bg-orange-500" },
  { id: "b2", category: "Belanja", target_amount: 1500000, spent_amount: 950000, period: "2026-11", color: "bg-blue-500" },
  { id: "b3", category: "Transport", target_amount: 1000000, spent_amount: 720000, period: "2026-11", color: "bg-emerald-500" },
  { id: "b4", category: "Tagihan", target_amount: 1200000, spent_amount: 1200000, period: "2026-11", color: "bg-red-500" },
  { id: "b5", category: "Investasi", target_amount: 3000000, spent_amount: 3000000, period: "2026-11", color: "bg-purple-500" },
];

export async function fetchBudgets(period?: string): Promise<Budget[]> {
  const currentPeriod = period || new Date().toISOString().slice(0, 7);
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("period", currentPeriod);

  if (error) {
    console.warn("[Supabase] fetchBudgets fallback:", error.message);
    return FALLBACK_BUDGETS;
  }
  if (!data || data.length === 0) return FALLBACK_BUDGETS;

  return data.map((b) => ({
    id: b.id,
    category: b.category,
    target_amount: Number(b.target_amount),
    spent_amount: Number(b.spent_amount),
    period: b.period,
    color: b.color,
  }));
}

export async function updateBudgetTarget(id: string, newTarget: number): Promise<void> {
  const { error } = await supabase
    .from("budgets")
    .update({ target_amount: newTarget, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function createBudget(budget: Omit<Budget, "id">): Promise<Budget> {
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      category: budget.category,
      target_amount: budget.target_amount,
      spent_amount: budget.spent_amount || 0,
      period: budget.period,
      color: budget.color,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    category: data.category,
    target_amount: Number(data.target_amount),
    spent_amount: Number(data.spent_amount),
    period: data.period,
    color: data.color,
  };
}
