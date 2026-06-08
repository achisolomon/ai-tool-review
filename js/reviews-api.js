// Reviews API - Data fetching utilities
// ======================================

/**
 * Fetch tool by slug with aggregated review data
 */
async function getToolBySlug(slug) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
    }

    const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching tool:', error);
        return null;
    }
    return data;
}

/**
 * Fetch approved reviews for a tool
 * SECURITY: Explicitly select columns to avoid exposing user_id
 */
async function getReviewsForTool(toolId, { limit = 10, offset = 0 } = {}) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        console.error('Supabase client not initialized');
        return { reviews: [], total: 0 };
    }

    // SECURITY: Explicitly select only public columns - never expose user_id
    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            id,
            tool_id,
            author_name,
            author_initial,
            company_size,
            overall_rating,
            ease_of_use_rating,
            features_rating,
            value_rating,
            support_rating,
            title,
            like_best,
            dislike,
            time_used,
            would_recommend,
            source,
            is_validated,
            created_at
        `, { count: 'exact' })
        .eq('tool_id', toolId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching reviews:', error);
        return { reviews: [], total: 0 };
    }
    return { reviews: data || [], total: count || 0 };
}

/**
 * Format GitHub stars count for display (e.g., 45200 -> "45.2k")
 */
function formatStarsCount(count) {
    if (!count) return null;
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
}

/**
 * Get review summary data formatted for display
 */
function formatReviewSummary(tool) {
    return {
        toolName: tool.name,
        toolDescription: tool.description,
        toolUrl: tool.url,
        toolType: tool.type,
        averageRating: parseFloat(tool.average_rating) || 0,
        reviewCount: tool.review_count || 0,
        ratingDistribution: tool.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        aiSummary: tool.ai_summary,
        prosAggregated: tool.pros_aggregated || [],
        consAggregated: tool.cons_aggregated || [],
        // GitHub stars for OSS tools
        isOpenSource: tool.is_open_source || false,
        githubStars: tool.github_stars,
        githubUrl: tool.github_url,
    };
}

/**
 * Format review for card display
 */
function formatReviewCard(review) {
    return {
        id: review.id,
        authorName: review.author_name,
        authorInitial: review.author_initial,
        companySize: review.company_size,
        overallRating: review.overall_rating,
        title: review.title,
        likeBest: review.like_best,
        dislike: review.dislike,
        createdAt: new Date(review.created_at),
        isValidated: review.is_validated,
        source: review.source,
    };
}

/**
 * Submit a new review
 * SECURITY: Reviews are created with status='pending' for moderation
 * SECURITY: Requires authenticated user - user_id comes from auth.uid()
 * @param {Object} reviewData - The review data
 * @returns {Object} - { success: boolean, error?: string, data?: Object }
 */
async function submitReview(reviewData) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        return { success: false, error: 'Unable to connect to database' };
    }

    // Get current authenticated user
    const user = await window.SupabaseClient.getCurrentUser();
    if (!user) {
        return { success: false, error: 'You must be signed in to submit a review' };
    }

    // Validate required fields
    if (!reviewData.tool_id) {
        return { success: false, error: 'Tool ID is required' };
    }
    if (!reviewData.overall_rating || reviewData.overall_rating < 1 || reviewData.overall_rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
    }
    if (!reviewData.title || reviewData.title.trim().length === 0) {
        return { success: false, error: 'Review title is required' };
    }
    if (!reviewData.author_name || reviewData.author_name.trim().length === 0) {
        return { success: false, error: 'Your name is required' };
    }
    if (!reviewData.like_best || reviewData.like_best.trim().length < 10) {
        return { success: false, error: 'Please describe what you like best (minimum 10 characters)' };
    }
    if (reviewData.dislike && reviewData.dislike.trim().length > 0 && reviewData.dislike.trim().length < 10) {
        return { success: false, error: 'If providing dislikes, please write at least 10 characters' };
    }

    // Prepare review data with defaults
    const review = {
        tool_id: reviewData.tool_id,
        user_id: user.id, // Authenticated user's ID from Supabase Auth
        author_name: reviewData.author_name.trim(),
        author_initial: reviewData.author_name.trim().charAt(0).toUpperCase(),
        company_size: reviewData.company_size || null,
        overall_rating: parseInt(reviewData.overall_rating, 10),
        title: reviewData.title.trim(),
        like_best: reviewData.like_best.trim(),
        dislike: reviewData.dislike?.trim() || null,
        time_used: reviewData.time_used || null,
        would_recommend: reviewData.overall_rating >= 4, // Infer from rating
        source: 'organic',
        is_validated: false,
        status: 'pending', // All new reviews start as pending
    };

    try {
        // Note: We don't use .select() after .insert() because the RLS SELECT policy
        // for pending reviews requires auth.uid() = user_id, which may not work
        // reliably. The insert itself is enough - we don't need the returned data.
        const { error } = await supabase
            .from('reviews')
            .insert([review]);

        if (error) {
            console.error('Error submitting review:', error);
            // Check for common errors
            if (error.code === '42501') {
                return { success: false, error: 'Permission denied. Please try again later.' };
            }
            if (error.code === '23502') {
                return { success: false, error: 'Missing required field. Please fill all required fields.' };
            }
            return { success: false, error: 'Failed to submit review. Please try again.' };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

// Export for use in other modules
window.ReviewsAPI = {
    getToolBySlug,
    getReviewsForTool,
    formatStarsCount,
    formatReviewSummary,
    formatReviewCard,
    submitReview,
};
