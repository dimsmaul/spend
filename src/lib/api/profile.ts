import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

const FALLBACK_PROFILE: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Dimas Maulana",
  email: "user@budggt.local",
  currency: "IDR",
  use_decimals: false,
  pin_enabled: false,
};

export async function fetchProfile(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, currency, use_decimals, pin_enabled")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("[Supabase] fetchProfile fallback:", error.message);
    return FALLBACK_PROFILE;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    currency: data.currency || "IDR",
    use_decimals: data.use_decimals || false,
    pin_enabled: data.pin_enabled || false,
  };
}

export async function updateProfile(params: Partial<UserProfile>): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...(params.name !== undefined && { name: params.name }),
      ...(params.currency !== undefined && { currency: params.currency }),
      ...(params.use_decimals !== undefined && { use_decimals: params.use_decimals }),
      ...(params.pin_enabled !== undefined && { pin_enabled: params.pin_enabled }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id || "00000000-0000-0000-0000-000000000001");

  if (error) throw error;
}
