import { supabase } from "@/lib/supabase";
import { createTransaction } from "./transactions";
import type { InboxItem, TransactionType } from "@/types";

const FALLBACK_INBOX: InboxItem[] = [
  {
    id: "inbox-1",
    source: "RECEIPT",
    description: "Kopi Kenangan - Mall Grand Indonesia",
    amount: 54000,
    date: "2026-11-08",
    category: "Kuliner",
    wallet_id: "11111111-1111-1111-1111-111111111111",
    wallet_name: "BCA",
    status: "PENDING",
    confidence_score: 98,
  },
  {
    id: "inbox-2",
    source: "BANK_CSV",
    description: "TRANSFER DR MBANKING 10492819 - TOKO BUKU GRAMEDIA",
    amount: 145000,
    date: "2026-11-07",
    category: "Belanja",
    wallet_id: "22222222-2222-2222-2222-222222222222",
    wallet_name: "Mandiri",
    status: "PENDING",
    confidence_score: 85,
  },
];

export async function fetchInbox(): Promise<InboxItem[]> {
  const { data, error } = await supabase
    .from("transaction_inbox")
    .select("*, wallets!transaction_inbox_wallet_id_fkey(name)")
    .is("discarded_at", null)
    .order("date", { ascending: false });

  if (error) {
    console.warn("[Supabase] fetchInbox fallback:", error.message);
    return FALLBACK_INBOX;
  }
  if (!data || data.length === 0) return FALLBACK_INBOX;

  return data.map((item) => ({
    id: item.id,
    source: item.source,
    description: item.description,
    amount: Number(item.amount),
    date: item.date,
    category: item.category,
    wallet_id: item.wallet_id,
    wallet_name: item.wallets?.name || "Dompet",
    status: item.status,
    confidence_score: item.confidence_score ? Number(item.confidence_score) : undefined,
    created_at: item.created_at,
  }));
}

export async function createInboxItem(item: {
  source: "RECEIPT" | "BANK_CSV" | "RECURRING" | "MANUAL";
  description: string;
  amount: number;
  date?: string;
  category?: string;
  wallet_id?: string;
  confidence_score?: number;
  raw_data?: Record<string, unknown>;
}): Promise<InboxItem> {
  const { data, error } = await supabase
    .from("transaction_inbox")
    .insert({
      source: item.source,
      description: item.description,
      amount: item.amount,
      date: item.date || new Date().toISOString().split("T")[0],
      category: item.category || "Lainnya",
      wallet_id: item.wallet_id || null,
      status: "PENDING",
      confidence_score: item.confidence_score || null,
      raw_data: item.raw_data || null,
    })
    .select("*, wallets!transaction_inbox_wallet_id_fkey(name)")
    .single();

  if (error) throw error;
  return {
    id: data.id,
    source: data.source,
    description: data.description,
    amount: Number(data.amount),
    date: data.date,
    category: data.category,
    wallet_id: data.wallet_id,
    wallet_name: data.wallets?.name || "Dompet",
    status: data.status,
  };
}

export async function approveInboxItem(
  item: InboxItem,
  walletId: string,
  category: string,
  type: TransactionType = "EXPENSE"
): Promise<void> {
  // 1. Create real transaction
  await createTransaction({
    type,
    amount: item.amount,
    category,
    description: item.description,
    wallet_id: walletId,
    date: item.date,
  });

  // 2. Mark inbox item as APPROVED
  await supabase
    .from("transaction_inbox")
    .update({
      status: "APPROVED",
      posted_at: new Date().toISOString(),
    })
    .eq("id", item.id);
}

export async function discardInboxItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("transaction_inbox")
    .update({
      status: "DISCARDED",
      discarded_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
