import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export function getSupabase() {
  if (!supabaseInstance) {
    // In Vite, client-side env vars must be prefixed with VITE_
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseKey) {
      // Don't warn on every call if credentials aren't intended for client-side
      return null;
    }

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.error("Supabase client init failed:", err);
      return null;
    }
  }
  return supabaseInstance;
}
