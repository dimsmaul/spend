import { supabase } from "@/lib/supabase";
import type { Wallet, WalletType } from "@/types";

const FALLBACK_WALLETS: Wallet[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "BCA", type: "BANK", balance: 14500000, currency: "IDR", icon: "Landmark" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Mandiri", type: "BANK", balance: 8250000, currency: "IDR", icon: "Landmark" },
  { id: "33333333-3333-3333-3333-333333333333", name: "GoPay", type: "E_WALLET", balance: 750000, currency: "IDR", icon: "Smartphone" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Tunai / Dompet", type: "CASH", balance: 500000, currency: "IDR", icon: "Banknote" },
];

export async function fetchWallets(): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[Supabase] fetchWallets fallback:", error.message);
    return FALLBACK_WALLETS;
  }
  if (!data || data.length === 0) return FALLBACK_WALLETS;

  return data.map((w) => ({
    id: w.id,
    name: w.name,
    type: w.type as WalletType,
    balance: Number(w.balance),
    currency: w.currency || "IDR",
    icon: w.icon || "Landmark",
  }));
}

export async function createWallet(wallet: Omit<Wallet, "id">): Promise<Wallet> {
  const { data, error } = await supabase
    .from("wallets")
    .insert({
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      currency: wallet.currency || "IDR",
      icon: wallet.icon || "Landmark",
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    type: data.type as WalletType,
    balance: Number(data.balance),
    currency: data.currency,
    icon: data.icon,
  };
}

export async function updateWalletBalance(id: string, newBalance: number): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function transferBetweenWallets(params: {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  adminFee?: number;
  note?: string;
}): Promise<void> {
  const fee = params.adminFee || 0;
  const totalDeduction = params.amount + fee;

  // 1. Get current balances
  const { data: wallets, error: fetchErr } = await supabase
    .from("wallets")
    .select("id, balance")
    .in("id", [params.fromWalletId, params.toWalletId]);

  if (fetchErr) throw fetchErr;

  const fromW = wallets?.find((w) => w.id === params.fromWalletId);
  const toW = wallets?.find((w) => w.id === params.toWalletId);

  if (!fromW || !toW) throw new Error("Dompet asal atau tujuan tidak ditemukan");

  // 2. Update balances
  await updateWalletBalance(params.fromWalletId, Number(fromW.balance) - totalDeduction);
  await updateWalletBalance(params.toWalletId, Number(toW.balance) + params.amount);

  // 3. Record transaction
  await supabase.from("transactions").insert({
    wallet_id: params.fromWalletId,
    to_wallet_id: params.toWalletId,
    type: "TRANSFER",
    amount: params.amount,
    category: "Transfer Antar Dompet",
    description: params.note || "Transfer saldo",
    admin_fee: fee,
    date: new Date().toISOString().split("T")[0],
  });
}
