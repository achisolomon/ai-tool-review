// Admin API - Moderation utilities
// =================================

/**
 * Safe accessor: pages like the homepage load admin-api.js without
 * supabase-client.js, so window.SupabaseClient may be undefined.
 * Lazy-loads the supabase-js library first (it is no longer auto-loaded via a
 * static <script> tag) so a fresh page load doesn't see a null client.
 * @returns {Promise<object|null>}
 */
async function getSupabaseOrNull() {
    if (!window.SupabaseClient) return null;
    try { await window.SupabaseClient.ensureSupabase(); } catch (_) { return null; }
    return window.SupabaseClient.getSupabase();
}

/**
 * Check if current user has admin or moderator role
 * @returns {Promise<{isAdmin: boolean, role: string|null}>}
 */
async function checkIsAdmin() {
    if (!window.SupabaseClient) {
        return { isAdmin: false, role: null };
    }
    // getCurrentUser() lazy-loads the library itself, but getSupabaseOrNull()
    // checked it FIRST (synchronously) and bailed before getCurrentUser() ever
    // ran — so the library never loaded and a real admin was always reported
    // as non-admin. Call getCurrentUser() first so the lazy-load happens.
    const user = await window.SupabaseClient.getCurrentUser();
    const supabase = await getSupabaseOrNull();
    if (!supabase) {
        return { isAdmin: false, role: null };
    }
    if (!user) {
        return { isAdmin: false, role: null };
    }

    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();

    if (error || !data) {
        return { isAdmin: false, role: null };
    }

    return { isAdmin: true, role: data.role };
}

/**
 * Get count of pending reviews
 * @returns {Promise<number>}
 */
async function getPendingCount() {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching pending count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Fetch reviews for moderation with tool info joined
 * @param {string} status - 'pending', 'approved', or 'rejected'
 * @param {Object} options - { limit, offset }
 * @returns {Promise<{reviews: Array, total: number}>}
 */
async function getReviewsForModeration(status, { limit = 50, offset = 0 } = {}) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { reviews: [], total: 0 };

    const ascending = status === 'pending'; // Pending: oldest first (FIFO), others: newest first

    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            id,
            tool_id,
            user_id,
            author_name,
            author_initial,
            company_size,
            overall_rating,
            title,
            like_best,
            dislike,
            time_used,
            would_recommend,
            status,
            created_at,
            tools (
                id,
                slug,
                name
            )
        `, { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching reviews for moderation:', error);
        return { reviews: [], total: 0 };
    }

    const reviews = data || [];

    // reviews.user_id and user_profiles.id both reference auth.users, but there
    // is no direct FK between reviews and user_profiles, so PostgREST can't
    // embed the email — fetch it in one batched second query and merge here.
    const userIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
    const emailByUserId = {};

    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, email')
            .in('id', userIds);

        if (profilesError) {
            console.error('Error fetching reviewer profiles:', profilesError);
        } else {
            for (const profile of profiles || []) {
                emailByUserId[profile.id] = profile.email || null;
            }
        }
    }

    const reviewsWithEmail = reviews.map(review => ({
        ...review,
        authorEmail: review.user_id ? (emailByUserId[review.user_id] ?? null) : null,
    }));

    return { reviews: reviewsWithEmail, total: count || 0 };
}

/**
 * Approve a review (set status to 'approved')
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function approveReview(reviewId) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

    if (error) {
        console.error('Error approving review:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Reject a review (set status to 'rejected')
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function rejectReview(reviewId) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

    if (error) {
        console.error('Error rejecting review:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a review permanently (admin only)
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteReviewAdmin(reviewId) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

    if (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get all users with their roles and review counts (admin only)
 * @returns {Promise<{users: Array, error?: string}>}
 */
async function getAllUsers() {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { users: [], error: 'Supabase not initialized' };

    // Get user profiles with roles
    const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
            id,
            email,
            display_name,
            created_at,
            last_sign_in
        `)
        .order('last_sign_in', { ascending: false, nullsFirst: false });

    if (profilesError) {
        console.error('Error fetching users:', profilesError);
        return { users: [], error: profilesError.message };
    }

    // Get roles for all users
    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

    if (rolesError) {
        console.error('Error fetching roles:', rolesError);
    }

    // Create role lookup map
    const roleMap = {};
    if (roles) {
        roles.forEach(r => {
            if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
            roleMap[r.user_id].push(r.role);
        });
    }

    // Get review counts per user
    const { data: reviewCounts, error: countError } = await supabase
        .from('reviews')
        .select('user_id');

    if (countError) {
        console.error('Error fetching review counts:', countError);
    }

    // Create count lookup map
    const countMap = {};
    if (reviewCounts) {
        reviewCounts.forEach(r => {
            if (r.user_id) {
                countMap[r.user_id] = (countMap[r.user_id] || 0) + 1;
            }
        });
    }

    // Merge data
    const users = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        createdAt: profile.created_at,
        lastSignIn: profile.last_sign_in,
        roles: roleMap[profile.id] || [],
        reviewCount: countMap[profile.id] || 0
    }));

    return { users, error: null };
}

/**
 * Fetch suggestions for moderation
 * @param {string} status - 'pending', 'approved', 'rejected', 'applied', or 'all'
 * @param {string} kind - 'new_tool', 'taxonomy_change', 'tool_placement', 'tool_edit', or 'all'
 * @returns {Promise<{suggestions: Array, error?: string}>}
 */
async function getSuggestions(status = 'pending', kind = 'all') {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { suggestions: [], error: 'not initialized' };
    let q = supabase.from('suggestions').select('*').order('created_at', { ascending: true });
    if (status !== 'all') q = q.eq('status', status);
    if (kind !== 'all') q = q.eq('kind', kind);
    q = q.limit(500);
    const { data, error } = await q;
    return { suggestions: data || [], error: error?.message };
}

/**
 * Get count of pending suggestions
 * @returns {Promise<number>}
 */
async function getSuggestionPendingCount() {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return 0;
    const { count } = await supabase
        .from('suggestions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
    return count || 0;
}

/**
 * Approve a suggestion, optionally patching the payload with admin edits
 * @param {string} id - UUID of the suggestion
 * @param {Object|null} payloadPatch - Admin-completed/corrected payload (e.g. slug + placement for new_tool)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function approveSuggestion(id, payloadPatch) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'not initialized' };
    const user = await window.SupabaseClient.getCurrentUser();
    const update = {
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
    };
    if (payloadPatch) update.payload = payloadPatch; // admin-completed payload
    const { error } = await supabase.from('suggestions').update(update).eq('id', id);
    return { success: !error, error: error?.message };
}

/**
 * Reject a suggestion — requires a non-empty admin note
 * @param {string} id - UUID of the suggestion
 * @param {string} note - Rejection reason (required)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function rejectSuggestion(id, note) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'not initialized' };
    if (!note || !note.trim()) return { success: false, error: 'A note is required to reject.' };
    const user = await window.SupabaseClient.getCurrentUser();
    const { error } = await supabase
        .from('suggestions')
        .update({
            status: 'rejected',
            admin_note: note.trim(),
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
    return { success: !error, error: error?.message };
}

/**
 * Mark an approved suggestion as applied (for hand-applied op:other taxonomy changes)
 * @param {string} id - UUID of the suggestion
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function markSuggestionApplied(id) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'not initialized' };
    const { error } = await supabase
        .from('suggestions')
        .update({ status: 'applied', applied_at: new Date().toISOString() })
        .eq('id', id);
    return { success: !error, error: error?.message };
}

// Export for use in admin page
window.AdminAPI = {
    checkIsAdmin,
    getPendingCount,
    getReviewsForModeration,
    approveReview,
    rejectReview,
    deleteReviewAdmin,
    getAllUsers,
    getSuggestions,
    getSuggestionPendingCount,
    approveSuggestion,
    rejectSuggestion,
    markSuggestionApplied,
};
