import { supabase } from './supabaseClient';

// Web equivalent of ../../../src/services/auth.ts's signInWithGoogle — same Supabase
// project, same Google OAuth provider config, but a standard browser redirect instead of
// expo-web-browser/skipBrowserRedirect (that plumbing exists only because Expo apps can't
// do a normal top-level redirect). Supabase's client handles the token exchange itself via
// detectSessionInUrl once Google redirects back to redirectTo.
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/app/`,
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
