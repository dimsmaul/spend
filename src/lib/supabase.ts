import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from environment or fallback
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://vftrqhlbimufkbqnywyl.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_w_ESToPYaCNo9rZmaGFP7w_pW_vFfXk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
