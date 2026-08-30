import { createClient } from '@supabase/supabase-js';

// Same project, same publishable key mobile uses (src/store/useAppStore.ts's
// defaultSupabaseUrl/defaultSupabaseKey) — RLS (auth.uid()-scoped) is the real security
// boundary, not this key, so sharing it across clients is safe and intentional: it's how
// this web app and the iOS app end up reading/writing the exact same account data.
const SUPABASE_URL = 'https://stxcgnjcdvnitvizfeqe.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HkTZRki7uxcWPtq8TJ60lQ_RaT6y8CC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
