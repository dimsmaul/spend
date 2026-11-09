import { supabase } from "@/lib/supabase";
import type { AIAdvisorMessage } from "@/types";

const FALLBACK_MESSAGES: AIAdvisorMessage[] = [
  {
    id: "m1",
    role: "model",
    text: "Halo! Saya Asisten Keuangan AI Spend. Saya siap membantu menganalisis pola pengeluaran, menyusun strategi alokasi tabungan 50/30/20, hingga rekomendasi investasi. Ada yang ingin kamu diskusikan hari ini?",
    created_at: new Date().toISOString(),
  },
];

export async function fetchAdvisorMessages(sessionId?: string): Promise<AIAdvisorMessage[]> {
  let query = supabase
    .from("ai_advisor_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("[Supabase] fetchAdvisorMessages fallback:", error.message);
    return FALLBACK_MESSAGES;
  }
  if (!data || data.length === 0) return FALLBACK_MESSAGES;

  return data.map((m) => ({
    id: m.id,
    role: m.role as "user" | "model",
    text: m.text,
    created_at: m.created_at,
  }));
}

export async function saveAdvisorMessage(params: {
  role: "user" | "model";
  text: string;
  sessionId?: string;
}): Promise<AIAdvisorMessage> {
  const { data, error } = await supabase
    .from("ai_advisor_messages")
    .insert({
      role: params.role,
      text: params.text,
      session_id: params.sessionId || "00000000-0000-0000-0000-000000000001",
    })
    .select()
    .single();

  if (error) {
    // If table doesn't exist yet, return optimistic object
    return {
      id: Date.now().toString(),
      role: params.role,
      text: params.text,
      created_at: new Date().toISOString(),
    };
  }

  return {
    id: data.id,
    role: data.role as "user" | "model",
    text: data.text,
    created_at: data.created_at,
  };
}
