import { supabase } from "@/lib/supabase";
import type { Goal } from "@/types";

const FALLBACK_GOALS: Goal[] = [
  {
    id: "g1",
    name: "Dana Darurat 6 Bulan",
    target_amount: 30000000,
    current_amount: 18500000,
    deadline: "2027-05-01",
    is_emergency_fund: true,
    wallet_id: "11111111-1111-1111-1111-111111111111",
    wallet_name: "BCA",
  },
  {
    id: "g2",
    name: "Liburan Akhir Tahun ke Jepang",
    target_amount: 15000000,
    current_amount: 4500000,
    deadline: "2026-12-20",
    is_emergency_fund: false,
    wallet_id: "22222222-2222-2222-2222-222222222222",
    wallet_name: "Mandiri",
  },
];

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*, wallets!goals_wallet_id_fkey(name)")
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[Supabase] fetchGoals fallback:", error.message);
    return FALLBACK_GOALS;
  }
  if (!data || data.length === 0) return FALLBACK_GOALS;

  return data.map((g) => ({
    id: g.id,
    name: g.name,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount),
    deadline: g.deadline,
    is_emergency_fund: g.is_emergency_fund,
    wallet_id: g.wallet_id,
    wallet_name: g.wallets?.name || "Dompet",
    icon: g.icon,
    created_at: g.created_at,
  }));
}

export async function createGoal(goal: {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
  wallet_id?: string;
  is_emergency_fund?: boolean;
}): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      deadline: goal.deadline || null,
      wallet_id: goal.wallet_id || null,
      is_emergency_fund: goal.is_emergency_fund || false,
    })
    .select("*, wallets!goals_wallet_id_fkey(name)")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    target_amount: Number(data.target_amount),
    current_amount: Number(data.current_amount),
    deadline: data.deadline,
    is_emergency_fund: data.is_emergency_fund,
    wallet_id: data.wallet_id,
    wallet_name: data.wallets?.name || "Dompet",
  };
}

export async function depositToGoal(params: {
  goalId: string;
  amount: number;
  walletId: string;
}): Promise<void> {
  // 1. Fetch goal
  const { data: goal, error: gErr } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", params.goalId)
    .single();

  if (gErr || !goal) throw new Error("Goal tidak ditemukan");

  // 2. Fetch wallet
  const { data: wallet, error: wErr } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", params.walletId)
    .single();

  if (wErr || !wallet) throw new Error("Dompet tidak ditemukan");

  // 3. Update goal
  await supabase
    .from("goals")
    .update({
      current_amount: Number(goal.current_amount) + params.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.goalId);

  // 4. Update wallet balance
  await supabase
    .from("wallets")
    .update({
      balance: Number(wallet.balance) - params.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.walletId);

  // 5. Record goal transaction
  await supabase.from("goal_transactions").insert({
    goal_id: params.goalId,
    amount: params.amount,
    direction: "DEPOSIT",
  });
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
