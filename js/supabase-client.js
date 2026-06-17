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
if (IS_LOCAL) console.log(`[Supabase] Using ${ENV} environment: ${SUPABASE_URL}`);

// Note: Both anon and service_role keys are JWTs starting with 'eyJ'
// The key distinction is in the payload - anon has role:"anon", service_role has role:"service_role"
// Security is enforced by RLS policies, not by hiding keys

// Dev-visible, user-hidden logging for Supabase/CDN reachability problems.
// console.warn surfaces in DevTools but never reaches the UI.
function logSupabaseError(context, err) {
    try { console.warn(`[Supabase] ${context}:`, err && (err.message || err)); } catch (_) {}
}

// Initialize Supabase client (requires supabase-js loaded via CDN)
let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            logSupabaseError('createClient failed', e);
        }
    }
    return supabaseClient;
}

// Lazy CDN loader. The supabase-js library is NOT loaded on page load — content
// pages (search/landscape/tool) never need it. Auth/DB entry points call this to
// inject it on demand, in the background. Memoized: one injection, shared promise.
let _supabaseLibPromise = null;
function ensureSupabase() {
    if (window.supabase) return Promise.resolve(window.supabase);
    if (_supabaseLibPromise) return _supabaseLibPromise;
    _supabaseLibPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src*="supabase-js@2"]');
        const timer = setTimeout(() => reject(new Error('supabase-cdn-timeout')), DB_TIMEOUT_MS);
        function onReady() { clearTimeout(timer); window.supabase ? resolve(window.supabase) : reject(new Error('supabase-cdn-failed')); }
        if (existing) {
            existing.addEventListener('load', onReady, { once: true });
            existing.addEventListener('error', () => { clearTimeout(timer); reject(new Error('supabase-cdn-failed')); }, { once: true });
            if (window.supabase) onReady();
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        s.async = true;
        s.addEventListener('load', onReady, { once: true });
        s.addEventListener('error', () => { clearTimeout(timer); reject(new Error('supabase-cdn-failed')); }, { once: true });
        document.head.appendChild(s);
    });
    // A failed load must not be cached permanently — allow a later retry.
    _supabaseLibPromise.catch((err) => { logSupabaseError('library failed to load from CDN', err); _supabaseLibPromise = null; });
    return _supabaseLibPromise;
}

// Read the cached Supabase auth session from localStorage WITHOUT the library or
// network. supabase-js uses no custom storageKey, so the key is
// `sb-<project-ref>-auth-token` where <project-ref> is the SUPABASE_URL subdomain.
// Returns the parsed session object (has .user, .access_token) or null.
function getCachedSession() {
    try {
        const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
        const raw = localStorage.getItem(`sb-${ref}-auth-token`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // supabase-js stores either the session directly or { currentSession }.
        return parsed?.currentSession || parsed?.access_token ? (parsed.currentSession || parsed) : null;
    } catch (_) {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Resilience: timeouts + health gate
// ---------------------------------------------------------------------------
// When the database host is unreachable, supabase-js fetches can hang
// indefinitely (or eventually surface the raw Supabase URL). That leaves
// loading spinners spinning forever and dead clicks. Every DB-dependent call
// must fail fast, and DB-dependent UI must gate on a single health probe.

const DB_TIMEOUT_MS = 4000;

// Race a promise against a timeout. Rejects with a tagged error on timeout so
// callers can distinguish a slow/unreachable DB from a real query error.
function withTimeout(promise, ms = DB_TIMEOUT_MS) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('db-timeout')), ms)
        ),
    ]);
}

// One-per-page-load health probe. Memoized so all consumers (auth UI, nav,
// tool reviews) share a single request. Returns true only on a genuine
// response; timeout / network failure / uninitialized client → false.
// Never throws.
let _healthPromise = null;
// forceFresh: bypass the page-load memo and run a new probe (used by click-time
// sign-in re-checks so a backend that died after load is detected). The fresh
// result replaces the memo so later default callers see current state.
function isDatabaseHealthy(forceFresh = false) {
    if (_healthPromise && !forceFresh) return _healthPromise;
    _healthPromise = (async () => {
        // Probe the REST endpoint with a raw fetch + AbortController. We don't go
        // through supabase-js here because its internal retry/queue behaviour can
        // mask an unreachable host; a plain fetch gives a clean reachable/not
        // signal. ANY HTTP response (even 401/404/permission) means the host
        // answered → healthy. Only a network error or timeout → unhealthy.
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);
            try {
                // Use /auth/v1/health — returns 200 with the anon key, no 401.
                // Avoids a red console network error from the previous /rest/v1/ HEAD probe.
                await fetch(SUPABASE_URL + '/auth/v1/health', {
                    headers: { apikey: SUPABASE_ANON_KEY },
                    cache: 'no-store',
                    signal: controller.signal,
                });
                return true; // host responded
            } finally {
                clearTimeout(timer);
            }
        } catch (err) {
            logSupabaseError('database health probe failed (timeout or network error)', err);
            return false; // aborted (timeout) or network failure
        }
    })();
    return _healthPromise;
}

// Helper to get current user. Times out so a dead DB can't hang callers.
async function getCurrentUser() {
    // Auth-gated full pages (my-reviews, my-suggestions, admin) call this
    // directly without ever calling ensureSupabase() themselves. Without this,
    // getSupabase() returns null (library never loaded) and a SIGNED-IN user
    // is reported as signed out. Ensure the library first; on CDN failure,
    // fall through to "no user" rather than throwing.
    try { await ensureSupabase(); } catch (_) { return null; }
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data: { user } } = await withTimeout(supabase.auth.getUser());
        return user;
    } catch (_) {
        return null;
    }
}

// Helper to check if logged in
async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}

// Listen for auth state changes
async function onAuthStateChange(callback) {
    try { await ensureSupabase(); } catch (_) { return null; }
    const supabase = getSupabase();
    if (!supabase) return null;

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// Sign in with OAuth provider (GitHub or Google)
async function signInWithProvider(provider) {
    try { await ensureSupabase(); } catch (_) { return { error: { message: 'Supabase not initialized' } }; }
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
    try { await ensureSupabase(); } catch (_) { return { error: { message: 'Supabase not initialized' } }; }
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { error } = await supabase.auth.signOut();
    return { error };
}

// Get current session. Times out so a dead DB can't hang callers.
async function getSession() {
    // Same lazy-load requirement as getCurrentUser — see comment there. This is
    // the call OAuth-callback pages use to pick up the just-completed session
    // (tokens land in the URL hash; getSession() reads/exchanges them).
    try { await ensureSupabase(); } catch (_) { return null; }
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession());
        return session;
    } catch (_) {
        return null;
    }
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

// List the current user's own suggestions, newest-updated first.
// Timeout-wrapped so a dead DB surfaces an error the page can show instead of
// leaving the "Loading suggestions…" spinner running forever.
async function listMySuggestions() {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };
    const user = await getCurrentUser();
    if (!user) return { data: [], error: null };
    try {
        return await withTimeout(
            supabase.from('suggestions').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
        );
    } catch (_) {
        return { data: null, error: { message: 'Database unavailable' } };
    }
}

// Patch the user's own pending suggestion (status and user_id are stripped — RLS guards them)
async function updateMySuggestion(id, patch) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };
    const user = await getCurrentUser();
    if (!user) return { data: null, error: { message: 'Sign in required' } };
    // RLS restricts this to own pending rows; never send status.
    const { status, user_id, ...safe } = patch;
    return await supabase.from('suggestions').update(safe).eq('id', id).eq('user_id', user.id).select().single();
}

// Delete (withdraw) the user's own pending suggestion
async function withdrawSuggestion(id) {
    const supabase = getSupabase();
    if (!supabase) return { error: { message: 'Supabase not initialized' } };
    const user = await getCurrentUser();
    if (!user) return { error: { message: 'Sign in required' } };
    return await supabase.from('suggestions').delete().eq('id', id).eq('user_id', user.id);
}

// Probe whether the `suggestions` table exists in this Supabase project.
// Never throws. The positive result ('1' = available) is cached in localStorage
// so the probe runs at most ONCE per browser, not once per tab/session — this
// eliminates the repeated `suggestions?select=id` HEAD request (logged by the
// browser as net::ERR_ABORTED when the page settles before it resolves) on
// every page after the first. Negative results are never cached, so a transient
// first-load failure can't lock the feature off. The legacy sessionStorage key
// is still honoured on read for backward compatibility within an open tab.
// Skips caching when the Supabase client isn't initialized yet (client may
// become available later in the same page load).
async function isSuggestionsAvailable() {
    try {
        if (localStorage.getItem('suggestions_available') === '1') return true;
        if (sessionStorage.getItem('suggestions_available') === '1') return true;

        const sb = getSupabase();
        if (!sb) return false; // not cached — client may init later

        const { error } = await withTimeout(sb.from('suggestions').select('id', { head: true, count: 'exact' }));
        // Table exists but anon lacks SELECT grant (42501) or auth (401/403) → available.
        // Only a missing-table error (42P01 / PGRST204) means truly unavailable.
        const available = !error ||
            error.code === '42501' ||   // permission denied — table exists, anon not granted SELECT
            error.code === 'PGRST301' || // JWT required
            error.status === 401 ||
            error.status === 403;
        if (available) {
            try { localStorage.setItem('suggestions_available', '1'); } catch (_) {}
            sessionStorage.setItem('suggestions_available', '1');
        }
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
    ensureSupabase,
    getCachedSession,
    logSupabaseError,
    withTimeout,
    isDatabaseHealthy,
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
