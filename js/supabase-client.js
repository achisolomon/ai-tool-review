// Supabase client singleton
// ==========================
// SECURITY: These are PUBLIC anon credentials only - safe to commit
// The anon key is designed to be public and is protected by RLS policies
// NEVER commit or use service_role keys in client-side code!
//
// Get credentials from: Supabase Dashboard > Project Settings > API
// Only use the "anon" / "public" key here, NEVER the "service_role" key

// Environment detection: localhost uses dev, everything else uses prod
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const SUPABASE_CONFIG = {
    dev: {
        url: 'https://yewcxcvngvdtsnigtmwd.supabase.co',
        anonKey: 'sb_publishable_-nLSx8DHhrSIs3NEjmAp9g_bS1WdOOM'
    },
    prod: {
        url: 'https://biclytfukihleuyfpvlr.supabase.co',
        anonKey: 'sb_publishable_s0_Gxung8SlO4giqCdrK3w_VFZ83V9S'
    }
};

const ENV = IS_LOCAL ? 'dev' : 'prod';
const SUPABASE_URL = SUPABASE_CONFIG[ENV].url;
const SUPABASE_ANON_KEY = SUPABASE_CONFIG[ENV].anonKey;

// Log environment for debugging (remove in production if needed)
console.log(`[Supabase] Using ${ENV} environment: ${SUPABASE_URL}`);

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

// Get current user's profile from user_profiles table
async function getUserProfile() {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };

    const user = await getCurrentUser();
    if (!user) return { data: null, error: null };

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return { data, error };
}

// Update last sign-in timestamp (call on auth state change to SIGNED_IN)
async function updateLastSignIn() {
    const supabase = getSupabase();
    if (!supabase) return;

    const user = await getCurrentUser();
    if (!user) return;

    await supabase
        .from('user_profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', user.id);
}

// Create a new suggestion row (born pending, user_id injected server-side from session)
async function createSuggestion(row) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };
    const user = await getCurrentUser();
    if (!user) return { data: null, error: { message: 'Sign in required' } };
    return await supabase.from('suggestions').insert({ ...row, user_id: user.id, status: 'pending' }).select().single();
}

// List the current user's own suggestions, newest-updated first
async function listMySuggestions() {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };
    const user = await getCurrentUser();
    if (!user) return { data: [], error: null };
    return await supabase.from('suggestions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
}

// Patch the user's own pending suggestion (status and user_id are stripped — RLS guards them)
async function updateMySuggestion(id, patch) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };
    // RLS restricts this to own pending rows; never send status.
    const { status, user_id, ...safe } = patch;
    return await supabase.from('suggestions').update(safe).eq('id', id).select().single();
}

// Delete (withdraw) the user's own pending suggestion
async function withdrawSuggestion(id) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    return await supabase.from('suggestions').delete().eq('id', id);
}

// Probe whether the `suggestions` table exists in this Supabase project.
// Never throws. Cached in sessionStorage ('1' = available, '0' = unavailable).
// Skips caching when the Supabase client isn't initialized yet (client may
// become available later in the same page load).
async function isSuggestionsAvailable() {
    try {
        const cached = sessionStorage.getItem('suggestions_available');
        if (cached === '1') return true;
        if (cached === '0') return false;

        const sb = getSupabase();
        if (!sb) return false; // not cached — client may init later

        const { error } = await sb.from('suggestions').select('id', { head: true, count: 'exact' });
        const available = !error;
        sessionStorage.setItem('suggestions_available', available ? '1' : '0');
        return available;
    } catch (_) {
        return false;
    }
}

// Return a count of the current user's pending suggestions (friendly pre-check before the DB cap)
async function countMyPending() {
    const supabase = getSupabase();
    if (!supabase) return 0;
    const user = await getCurrentUser();
    if (!user) return 0;
    const { count } = await supabase.from('suggestions').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('status', 'pending');
    return count || 0;
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
    getUserProfile,
    updateLastSignIn,
    isSuggestionsAvailable,
    createSuggestion,
    listMySuggestions,
    updateMySuggestion,
    withdrawSuggestion,
    countMyPending,
    SUPABASE_URL,
};
