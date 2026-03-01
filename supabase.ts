
import { createClient } from '@supabase/supabase-js';

// Configuration from your dashboard
const PROJECT_URL = 'https://yhxtzkxymvglaenlmacc.supabase.co';
const ANON_KEY = 'sb_publishable_KulA2zIFYgncJVgePuUg8w_bDgKnFB3'; // <--- PASTE YOUR KEY HERE

export const supabase = createClient(PROJECT_URL, ANON_KEY);

export const isSupabaseConfigured = !ANON_KEY.includes('YOUR_ANON_KEY');

// Helper to standardise login response for the app
export const signInWithEmail = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    return { data, error };
};

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    return { data, error };
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};
