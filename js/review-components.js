// Review Display Components
// ==========================

/**
 * Escape HTML entities to prevent XSS attacks
 * SECURITY: Always use this for user-generated content before rendering
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Company size labels
const COMPANY_SIZE_LABELS = {
    solo: 'Solo / Freelancer',
    small: 'Small Business (1-50 emp.)',
    mid: 'Mid-Market (51-1000 emp.)',
    enterprise: 'Enterprise (1000+ emp.)',
};

// Avatar colors based on initial
const AVATAR_COLORS = [
    { bg: '#312e81', text: '#c7d2fe' }, // indigo
    { bg: '#064e3b', text: '#6ee7b7' }, // emerald
    { bg: '#78350f', text: '#fcd34d' }, // amber
    { bg: '#881337', text: '#fda4af' }, // rose
    { bg: '#164e63', text: '#67e8f9' }, // cyan
];

function getAvatarColor(initial) {
    const index = initial.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

/**
 * Render star rating
 */
function renderStarRating(rating, { showNumeric = false, size = 'md' } = {}) {
    const fullStars = Math.round(rating);
    const emptyStars = 5 - fullStars;

    const sizeClass = size === 'lg' ? 'star-rating-lg' : '';

    let html = `<span class="star-rating ${sizeClass}">`;
    html += '<span class="stars">';
    html += '★'.repeat(fullStars);
    html += '<span class="stars-empty">' + '☆'.repeat(emptyStars) + '</span>';
    html += '</span>';

    if (showNumeric) {
        html += `<span class="star-numeric">${rating}/5</span>`;
    }
    html += '</span>';

    return html;
}

/**
 * Render rating distribution bars
 */
function renderRatingDistribution(distribution) {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const levels = [5, 4, 3, 2, 1];

    let html = '<div class="rating-distribution">';

    for (const level of levels) {
        const count = distribution[level] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        html += `
            <div class="distribution-row">
                <span class="distribution-level">${level}</span>
                <span class="distribution-star">★</span>
                <div class="distribution-bar-bg">
                    <div class="distribution-bar" style="width: ${percentage}%"></div>
                </div>
                <span class="distribution-count">${count}</span>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

/**
 * Validate URL is safe for href (http/https only)
 * SECURITY: Prevents javascript: and other protocol attacks
 */
function isValidHttpUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Render GitHub stars badge (for OSS tools)
 * SECURITY: URL is validated before use in href
 */
function renderGitHubStars(stars, githubUrl) {
    if (!stars) return '';

    // Format stars count
    let formattedStars;
    if (stars >= 1000000) {
        formattedStars = `${(stars / 1000000).toFixed(1)}M`;
    } else if (stars >= 1000) {
        formattedStars = `${(stars / 1000).toFixed(1)}k`;
    } else {
        formattedStars = stars.toString();
    }

    // SECURITY: Only create link if URL is valid http/https
    const safeUrl = isValidHttpUrl(githubUrl) ? githubUrl : null;
    const linkStart = safeUrl ? `<a href="${safeUrl}" target="_blank" rel="noopener" class="github-stars-link">` : '';
    const linkEnd = safeUrl ? '</a>' : '';

    return `
        <div class="github-stars">
            ${linkStart}
                <span class="github-icon">★</span>
                <span class="github-stars-count">${formattedStars}</span>
                <span class="github-label">GitHub Stars</span>
            ${linkEnd}
        </div>
    `;
}

/**
 * Render pros/cons tags
 * SECURITY: Tag content is escaped to prevent XSS
 */
function renderProConsTags(pros, cons, { maxPros = 5, maxCons = 4 } = {}) {
    const displayPros = pros.slice(0, maxPros);
    const displayCons = cons.slice(0, maxCons);
    const maxRows = Math.max(displayPros.length, displayCons.length);

    let html = '<table class="pros-cons-table">';
    html += '<thead><tr><th class="pro-header">👍 Pros</th><th class="con-header">👎 Cons</th></tr></thead>';
    html += '<tbody>';

    for (let i = 0; i < maxRows; i++) {
        const pro = displayPros[i];
        const con = displayCons[i];
        html += '<tr>';
        html += `<td class="pro-cell">${pro ? `${escapeHtml(pro.tag)} <span class="mention-count">(${parseInt(pro.count, 10) || 0})</span>` : ''}</td>`;
        html += `<td class="con-cell">${con ? `${escapeHtml(con.tag)} <span class="mention-count">(${parseInt(con.count, 10) || 0})</span>` : ''}</td>`;
        html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
}

/**
 * Render AI summary with bold text parsing
 * SECURITY: Escape HTML first, then parse safe markdown patterns
 */
function renderAISummary(summary) {
    if (!summary) return '';

    // SECURITY: Escape HTML entities first to prevent XSS
    const escaped = escapeHtml(summary);
    // Parse **bold** text (safe because we escaped first)
    const parsed = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return `
        <div class="ai-summary">
            <h3 class="ai-summary-title">Review Summary</h3>
            <p class="ai-summary-content">${parsed}</p>
        </div>
    `;
}

/**
 * Render full review summary section
 * SECURITY: toolName is escaped to prevent XSS
 */
function renderReviewSummary(data) {
    const {
        toolName,
        averageRating,
        reviewCount,
        ratingDistribution,
        aiSummary,
        prosAggregated,
        consAggregated,
        isOpenSource,
        githubStars,
        githubUrl,
    } = data;

    // SECURITY: Escape tool name
    const safeToolName = escapeHtml(toolName);

    return `
        <div class="review-summary">
            <div class="review-summary-header">
                <h2>${safeToolName} Reviews (${reviewCount})</h2>
            </div>

            <div class="review-summary-score-row">
                <div class="score-box">
                    <span class="score-value">${averageRating.toFixed(1)}</span>
                    ${renderStarRating(averageRating, { size: 'lg' })}
                    <span class="score-count">${reviewCount} reviews</span>
                    <button class="btn-cta" id="leave-review-btn">Leave a Review</button>
                </div>

                <div class="distribution-box">
                    ${renderRatingDistribution(ratingDistribution)}
                </div>
            </div>

            <div class="review-summary-details">
                <div class="summary-column">
                    ${renderAISummary(aiSummary)}
                </div>

                <div class="summary-column">
                    ${renderProConsTags(prosAggregated, consAggregated)}
                </div>
            </div>
        </div>
    `;
}

/**
 * Format date for display
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

/**
 * Render single review card
 * SECURITY: All user-generated content is escaped to prevent XSS
 */
function renderReviewCard(review, toolName) {
    const {
        id,
        authorName,
        authorInitial,
        companySize,
        overallRating,
        title,
        likeBest,
        dislike,
        problemsSolved,
        createdAt,
        isValidated,
        source,
    } = review;

    const avatarColor = getAvatarColor(authorInitial);
    const companySizeLabel = companySize ? COMPANY_SIZE_LABELS[companySize] : '';
    const sourceLabel = source ? source.charAt(0).toUpperCase() + source.slice(1) : 'Organic';

    // SECURITY: Escape all user-generated content to prevent XSS
    const safeAuthorName = escapeHtml(authorName);
    const safeAuthorInitial = escapeHtml(authorInitial);
    const safeTitle = escapeHtml(title);
    const safeLikeBest = escapeHtml(likeBest);
    const safeDislike = escapeHtml(dislike);
    const safeProblemsSolved = escapeHtml(problemsSolved);
    const safeToolName = escapeHtml(toolName);

    return `
        <div class="review-card" data-review-id="${id}">
            <div class="review-card-header">
                <div class="review-author">
                    <div class="review-avatar" style="background: ${avatarColor.bg}; color: ${avatarColor.text}">
                        ${safeAuthorInitial}
                    </div>
                    <div class="review-author-info">
                        <div class="review-author-name">${safeAuthorName}</div>
                        ${companySizeLabel ? `<div class="review-company-size">${companySizeLabel}</div>` : ''}
                    </div>
                </div>
                <div class="review-meta">
                    <span class="review-date">${formatDate(createdAt)}</span>
                </div>
            </div>

            <div class="review-card-title">
                <h3>"${safeTitle}"</h3>
                ${renderStarRating(overallRating, { showNumeric: true })}
            </div>

            <div class="review-card-content" data-collapsed="true">
                <div class="review-qa">
                    <div class="review-question">What do you like best about ${safeToolName}?</div>
                    <p class="review-answer">${safeLikeBest}</p>
                </div>

                <div class="review-qa review-qa-hidden">
                    <div class="review-question">What do you dislike about ${safeToolName}?</div>
                    <p class="review-answer">${safeDislike}</p>
                </div>

                <div class="review-qa review-qa-hidden">
                    <div class="review-question">What problems is ${safeToolName} solving and how is that benefiting you?</div>
                    <p class="review-answer">${safeProblemsSolved}</p>
                </div>
            </div>

            <button class="review-toggle-btn">Show More ↓</button>

        </div>
    `;
}

/**
 * Render list of review cards
 */
function renderReviewList(reviews, toolName) {
    if (reviews.length === 0) {
        return `
            <div class="review-list-empty">
                <p>No reviews yet. Be the first to leave a review!</p>
            </div>
        `;
    }

    let html = '<div class="review-list">';
    for (const review of reviews) {
        html += renderReviewCard(review, toolName);
    }
    html += '</div>';

    return html;
}

/**
 * Render review form modal
 * SECURITY: Tool name is escaped to prevent XSS
 * @param {string} toolName - Display name of the tool
 * @param {Object} toolInfo - Tool info: { id, slug, url }
 */
function renderReviewFormModal(toolName, toolInfo = {}) {
    const safeToolName = escapeHtml(toolName);
    const { id: toolId, slug: toolSlug, url: toolUrl } = toolInfo;

    return `
        <div class="review-modal-overlay" id="review-modal">
            <div class="review-modal">
                <div class="review-modal-header">
                    <h2>Review ${safeToolName}</h2>
                    <button class="review-modal-close" id="review-modal-close">&times;</button>
                </div>

                <form class="review-form" id="review-form" data-tool-id="${toolId || ''}" data-tool-slug="${escapeHtml(toolSlug || '')}" data-tool-name="${safeToolName}" data-tool-url="${escapeHtml(toolUrl || '')}">
                    <div class="form-group">
                        <label>Overall Rating <span class="required">*</span></label>
                        <div class="star-rating-input" id="rating-input" data-rating="0">
                            <button type="button" data-value="1">★</button>
                            <button type="button" data-value="2">★</button>
                            <button type="button" data-value="3">★</button>
                            <button type="button" data-value="4">★</button>
                            <button type="button" data-value="5">★</button>
                        </div>
                        <input type="hidden" name="overall_rating" id="rating-value" required>
                        <div class="form-error" id="rating-error"></div>
                    </div>

                    <div class="form-group">
                        <label for="review-title">Review Title <span class="required">*</span></label>
                        <input type="text" class="form-input" id="review-title" name="title"
                               placeholder="Summarize your experience in a few words" required maxlength="100">
                    </div>

                    <div class="posting-as">
                        <span class="posting-as-label">Posting as</span>
                        <span class="posting-as-name" id="review-author-display"></span>
                        <input type="hidden" id="review-name" name="author_name">
                    </div>

                    <div class="form-group">
                        <label for="review-company-size">Company Size</label>
                        <select class="form-select" id="review-company-size" name="company_size">
                            <option value="">Select...</option>
                            <option value="solo">Solo / Freelancer</option>
                            <option value="small">Small Business (1-50 employees)</option>
                            <option value="mid">Mid-Market (51-1000 employees)</option>
                            <option value="enterprise">Enterprise (1000+ employees)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="review-like-best">What do you like best about ${safeToolName}? <span class="required">*</span></label>
                        <textarea class="form-textarea" id="review-like-best" name="like_best"
                                  placeholder="Share the specific features or aspects you find most valuable..."
                                  required minlength="10" maxlength="2000"></textarea>
                        <div class="form-hint">Minimum 10 characters</div>
                    </div>

                    <div class="form-group">
                        <label for="review-dislike">What do you dislike about ${safeToolName}?</label>
                        <textarea class="form-textarea" id="review-dislike" name="dislike"
                                  placeholder="What could be improved? Any frustrations or limitations?"
                                  minlength="10" maxlength="2000"></textarea>
                        <div class="form-hint">Optional - minimum 10 characters if provided</div>
                    </div>

                    <div class="form-group">
                        <label for="review-time-used">How long have you been using ${safeToolName}?</label>
                        <select class="form-select" id="review-time-used" name="time_used">
                            <option value="">Select...</option>
                            <option value="less_than_month">Less than a month</option>
                            <option value="one_to_six">1-6 months</option>
                            <option value="six_to_twelve">6-12 months</option>
                            <option value="more_than_year">More than a year</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="review-cancel">Cancel</button>
                        <button type="submit" class="btn-submit" id="review-submit">Submit Review</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Render success message after review submission
 */
function renderReviewSuccess() {
    return `
        <div class="review-success">
            <div class="review-success-icon">✓</div>
            <h3>Thank you for your review!</h3>
            <p>Your review has been submitted and will be visible after moderation.</p>
        </div>
    `;
}

/**
 * Render auth login modal
 */
function renderAuthModal() {
    return `
        <div class="review-modal-overlay" id="auth-modal">
            <div class="review-modal">
                <div class="review-modal-header">
                    <h2>Sign in to Review</h2>
                    <button class="review-modal-close" id="auth-modal-close">&times;</button>
                </div>

                <div class="auth-modal-content">
                    <h3>Welcome!</h3>
                    <p>Sign in to leave a review and help others find the right tools.</p>

                    <div class="auth-providers">
                        <button class="btn-oauth btn-github" id="auth-github">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            Continue with GitHub
                        </button>

                        <!-- TODO: Enable Google auth in future release
                        <button class="btn-oauth btn-google" id="auth-google">
                            <svg viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>
                        -->
                    </div>

                    <p class="auth-note">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render user info for logged in state
 */
function renderUserInfo(user) {
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url;

    let avatarHtml = '';
    if (avatarUrl) {
        avatarHtml = `<img src="${avatarUrl}" alt="" class="user-avatar">`;
    }

    return `
        <div class="user-info">
            ${avatarHtml}
            <span>${escapeHtml(displayName)}</span>
            <button class="btn-signout" id="sign-out-btn">Sign out</button>
        </div>
    `;
}

/**
 * Render the "Your Review" modal for users with existing reviews
 * @param {string} toolName - Tool name for display
 * @param {Object} review - The user's existing review
 * @returns {string} - HTML string
 */
function renderExistingReviewModal(toolName, review) {
    const safeToolName = escapeHtml(toolName);
    const safeTitle = escapeHtml(review.title);
    const statusLabel = review.status === 'approved' ? 'Published' : 'Pending Approval';
    const statusClass = review.status === 'approved' ? 'status-published' : 'status-pending';
    const createdDate = formatDate(new Date(review.created_at));

    return `
        <div class="review-modal-overlay" id="existing-review-modal">
            <div class="review-modal existing-review-modal">
                <div class="review-modal-header">
                    <h2>Your Review for ${safeToolName}</h2>
                    <button class="review-modal-close" id="existing-review-close">&times;</button>
                </div>

                <div class="existing-review-content">
                    <div class="existing-review-preview">
                        <div class="existing-review-rating">
                            ${renderStarRating(review.overall_rating, { showNumeric: true })}
                        </div>
                        <h3 class="existing-review-title">"${safeTitle}"</h3>
                        <div class="existing-review-meta">
                            <span class="review-status-badge ${statusClass}">${statusLabel}</span>
                            <span class="review-date">Submitted ${createdDate}</span>
                        </div>
                    </div>

                    <div class="existing-review-actions">
                        <button class="btn-primary" id="edit-review-btn" data-review-id="${review.id}">
                            Edit Review
                        </button>
                        <button class="btn-danger" id="delete-review-btn" data-review-id="${review.id}">
                            Delete Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render the delete confirmation dialog
 * @returns {string} - HTML string
 */
function renderDeleteConfirmDialog() {
    return `
        <div class="review-modal-overlay" id="delete-confirm-modal">
            <div class="review-modal delete-confirm-modal">
                <div class="review-modal-header">
                    <h2>Delete Review?</h2>
                    <button class="review-modal-close" id="delete-confirm-close">&times;</button>
                </div>

                <div class="delete-confirm-content">
                    <p>Are you sure you want to delete your review? This cannot be undone.</p>

                    <div class="delete-confirm-actions">
                        <button class="btn-cancel" id="delete-cancel-btn">Cancel</button>
                        <button class="btn-danger" id="delete-confirm-btn">Delete Review</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render success message after review update
 */
function renderUpdateSuccess() {
    return `
        <div class="review-success">
            <div class="review-success-icon">✓</div>
            <h3>Review Updated!</h3>
            <p>Your review has been updated and is pending approval.</p>
        </div>
    `;
}

/**
 * Render success message after review deletion
 */
function renderDeleteSuccess() {
    return `
        <div class="review-success">
            <div class="review-success-icon">✓</div>
            <h3>Review Deleted</h3>
            <p>Your review has been deleted. You can submit a new review anytime.</p>
        </div>
    `;
}

// Export for use in other modules
window.ReviewComponents = {
    // Security utilities (shared across modules)
    escapeHtml,
    isValidHttpUrl,
    // Rendering functions
    renderStarRating,
    renderRatingDistribution,
    renderGitHubStars,
    renderProConsTags,
    renderAISummary,
    renderReviewSummary,
    renderReviewCard,
    renderReviewList,
    renderReviewFormModal,
    renderReviewSuccess,
    renderAuthModal,
    renderUserInfo,
    formatDate,
    // Existing review management
    renderExistingReviewModal,
    renderDeleteConfirmDialog,
    renderUpdateSuccess,
    renderDeleteSuccess,
};
