import { supabase } from "@/lib/supabase";
import type { InvestmentHolding, InvestmentType } from "@/types";

const FALLBACK_HOLDINGS: InvestmentHolding[] = [
  { id: "1", symbol: "BBCA", name: "Bank Central Asia", type: "STOCK", units: 15, avg_buy_price: 9600, current_price: 10250, currency: "IDR" },
  { id: "2", symbol: "BBRI", name: "Bank Rakyat Indonesia", type: "STOCK", units: 20, avg_buy_price: 4800, current_price: 4650, currency: "IDR" },
  { id: "3", symbol: "BTC", name: "Bitcoin", type: "CRYPTO", units: 0.015, avg_buy_price: 980000000, current_price: 1150000000, currency: "IDR" },
  { id: "4", symbol: "ANTAM", name: "Emas Antam (Gram)", type: "GOLD", units: 10, avg_buy_price: 1250000, current_price: 1420000, currency: "IDR" },
];

export async function fetchHoldings(): Promise<InvestmentHolding[]> {
  const { data, error } = await supabase
    .from("investment_holdings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Supabase] fetchHoldings fallback:", error.message);
    return FALLBACK_HOLDINGS;
  }
  if (!data || data.length === 0) return FALLBACK_HOLDINGS;

  return data.map((h) => ({
    id: h.id,
    symbol: h.symbol,
    name: h.name,
    type: h.type as InvestmentType,
    units: Number(h.units),
    avg_buy_price: Number(h.avg_buy_price),
    current_price: Number(h.current_price),
    currency: h.currency || "IDR",
  }));
}

export async function createHolding(holding: Omit<InvestmentHolding, "id">): Promise<InvestmentHolding> {
  const { data, error } = await supabase
    .from("investment_holdings")
    .insert({
      symbol: holding.symbol,
      name: holding.name,
      type: holding.type,
      units: holding.units,
      avg_buy_price: holding.avg_buy_price,
      current_price: holding.current_price,
      currency: holding.currency || "IDR",
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    type: data.type as InvestmentType,
    units: Number(data.units),
    avg_buy_price: Number(data.avg_buy_price),
    current_price: Number(data.current_price),
    currency: data.currency,
  };
}

export async function updateHoldingPrice(id: string, newPrice: number): Promise<void> {
  const { error } = await supabase
    .from("investment_holdings")
    .update({ current_price: newPrice, last_synced_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteHolding(id: string): Promise<void> {
  const { error } = await supabase.from("investment_holdings").delete().eq("id", id);
  if (error) throw error;
}
