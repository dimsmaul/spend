import { supabase } from "@/lib/supabase";
import type { Debt, DebtType, DebtStatus } from "@/types";

const FALLBACK_DEBTS: Debt[] = [
  {
    id: "d1",
    type: "RECEIVABLE",
    person_name: "Budi Santoso",
    amount: 500000,
    remaining_amount: 500000,
    due_date: "2026-11-15",
    status: "UNPAID",
    wallet_id: "11111111-1111-1111-1111-111111111111",
    wallet_name: "BCA",
    notes: "Talangan makan malam bersama",
  },
  {
    id: "d2",
    type: "PAYABLE",
    person_name: "Cicilan Laptop",
    amount: 4500000,
    remaining_amount: 1500000,
    due_date: "2026-11-20",
    status: "PARTIALLY_PAID",
    wallet_id: "11111111-1111-1111-1111-111111111111",
    wallet_name: "BCA",
    notes: "Sisa 1 bulan terakhir",
  },
];

export async function fetchDebts(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from("debts")
    .select("*, wallets!debts_wallet_id_fkey(name)")
    .order("due_date", { ascending: true });

  if (error) {
    console.warn("[Supabase] fetchDebts fallback:", error.message);
    return FALLBACK_DEBTS;
  }
  if (!data || data.length === 0) return FALLBACK_DEBTS;

  return data.map((d) => ({
    id: d.id,
    type: d.type as DebtType,
    person_name: d.person_name,
    amount: Number(d.amount),
    remaining_amount: Number(d.remaining_amount),
    due_date: d.due_date,
    status: d.status as DebtStatus,
    wallet_id: d.wallet_id,
    wallet_name: d.wallets?.name || "Dompet",
    notes: d.notes,
    created_at: d.created_at,
  }));
}

export async function createDebt(debt: {
  type: DebtType;
  person_name: string;
  amount: number;
  due_date: string;
  wallet_id?: string;
  notes?: string;
}): Promise<Debt> {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      type: debt.type,
      person_name: debt.person_name,
      amount: debt.amount,
      remaining_amount: debt.amount,
      due_date: debt.due_date,
      status: "UNPAID",
      wallet_id: debt.wallet_id || null,
      notes: debt.notes || null,
    })
    .select("*, wallets!debts_wallet_id_fkey(name)")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    type: data.type as DebtType,
    person_name: data.person_name,
    amount: Number(data.amount),
    remaining_amount: Number(data.remaining_amount),
    due_date: data.due_date,
    status: data.status as DebtStatus,
    wallet_id: data.wallet_id,
    wallet_name: data.wallets?.name || "Dompet",
    notes: data.notes,
  };
}

export async function recordDebtPayment(params: {
  debtId: string;
  amount: number;
  walletId?: string;
  note?: string;
}): Promise<void> {
  // 1. Get debt details
  const { data: debt, error: fetchErr } = await supabase
    .from("debts")
    .select("*")
    .eq("id", params.debtId)
    .single();

  if (fetchErr || !debt) throw new Error("Data utang/piutang tidak ditemukan");

  const currentRemaining = Number(debt.remaining_amount);
  const newRemaining = Math.max(0, currentRemaining - params.amount);
  const newStatus: DebtStatus = newRemaining === 0 ? "PAID" : "PARTIALLY_PAID";

  // 2. Insert payment record
  await supabase.from("debt_payments").insert({
    debt_id: params.debtId,
    wallet_id: params.walletId || debt.wallet_id,
    amount: params.amount,
    note: params.note || "Pembayaran cicilan",
    date: new Date().toISOString().split("T")[0],
  });

  // 3. Update debt remaining & status
  await supabase
    .from("debts")
    .update({
      remaining_amount: newRemaining,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.debtId);

  // 4. Update wallet balance if wallet provided
  const walletToUse = params.walletId || debt.wallet_id;
  if (walletToUse) {
    const { data: w } = await supabase
      .from("wallets")
      .select("balance")
      .eq("id", walletToUse)
      .single();

    if (w) {
      const currentBal = Number(w.balance);
      // If PAYABLE (we owe someone), paying reduces wallet balance
      // If RECEIVABLE (someone owes us), receiving payment increases wallet balance
      const updatedBal =
        debt.type === "PAYABLE"
          ? currentBal - params.amount
          : currentBal + params.amount;

      await supabase.from("wallets").update({ balance: updatedBal }).eq("id", walletToUse);
    }
  }
}

export async function deleteDebt(id: string): Promise<void> {
  const { error } = await supabase.from("debts").delete().eq("id", id);
  if (error) throw error;
}
