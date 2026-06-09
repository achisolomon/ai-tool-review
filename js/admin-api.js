// Admin API - Moderation utilities
// =================================

/**
 * Check if current user has admin or moderator role
 * @returns {Promise<{isAdmin: boolean, role: string|null}>}
 */
async function checkIsAdmin() {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        return { isAdmin: false, role: null };
    }

    const user = await window.SupabaseClient.getCurrentUser();
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
    const supabase = window.SupabaseClient.getSupabase();
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
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) return { reviews: [], total: 0 };

    const ascending = status === 'pending'; // Pending: oldest first (FIFO), others: newest first

    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            id,
            tool_id,
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

    return { reviews: data || [], total: count || 0 };
}

/**
 * Approve a review (set status to 'approved')
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function approveReview(reviewId) {
    const supabase = window.SupabaseClient.getSupabase();
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
    const supabase = window.SupabaseClient.getSupabase();
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
    const supabase = window.SupabaseClient.getSupabase();
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

// Export for use in admin page
window.AdminAPI = {
    checkIsAdmin,
    getPendingCount,
    getReviewsForModeration,
    approveReview,
    rejectReview,
    deleteReviewAdmin,
};
