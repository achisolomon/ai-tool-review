// Supabase client singleton
// ==========================
// SECURITY: These are PUBLIC anon credentials only - safe to commit
// The anon key is designed to be public and is protected by RLS policies
// NEVER commit or use service_role keys in client-side code!
//
// Get credentials from: Supabase Dashboard > Project Settings > API
// Only use the "anon" / "public" key here, NEVER the "service_role" key

const SUPABASE_URL = window.SUPABASE_CONFIG?.URL || 'https://biclytfukihleuyfpvlr.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.ANON_KEY || 'sb_publishable_s0_Gxung8SlO4giqCdrK3w_VFZ83V9S';

// Note: Both anon and service_role keys are JWTs starting with 'eyJ'
// The key distinction is in the payload - anon has role:"anon", service_role has role:"service_role"
// Security is enforced by RLS policies, not by hiding keys

// Initialize Supabase client (requires supabase-js loaded via CDN)
let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

// Helper to get current user
async function getCurrentUser() {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper to check if logged in
async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}

// Listen for auth state changes
function onAuthStateChange(callback) {
    const supabase = getSupabase();
    if (!supabase) return null;

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// Sign in with OAuth provider (GitHub or Google)
async function signInWithProvider(provider) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.href,
        },
    });

    return { data, error };
}

// Sign out
async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { error } = await supabase.auth.signOut();
    return { error };
}

// Get current session
async function getSession() {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Export for use in other modules
window.SupabaseClient = {
    getSupabase,
    getCurrentUser,
    isAuthenticated,
    onAuthStateChange,
    signInWithProvider,
    signOut,
    getSession,
    SUPABASE_URL,
};
