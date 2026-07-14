// Tool page init. Re-callable by the SPA router after a content swap.
// Reads tool data from the #tool-data JSON island (not Liquid), so it works
// on both direct load and SPA navigation. Idempotent.
(function () {
  'use strict';

  // One-time guard: auth state subscription must not be stacked across
  // repeated initReviews calls on the same page session.
  var authSubscribed = false;

  function readToolData() {
    var el = document.getElementById('tool-data');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (_) { return null; }
  }

  function wireSuggestEdit(tool) {
    var btn = document.getElementById('tool-suggest-open');
    if (!btn || btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', function (e) {
      if (!window.Suggest) return;
      window.Suggest.open({ mode: 'tool', trigger: e.currentTarget, tool: {
        name: tool.name,
        slug: tool.slug,
        category: tool.category,
        subcategory: tool.subcategory,
        url: tool.website,
        type: tool.type,
        desc: tool.description
      } });
    });
  }

  // Remove any previously-injected review modals so repeated initReviews
  // calls don't accumulate duplicates in the DOM.
  function resetReviewModals() {
    ['review-modal', 'auth-modal', 'existing-review-modal', 'delete-confirm-modal']
      .forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.remove();
      });
  }

  // ---------------------------------------------------------------------------
  // initReviews — idempotent review initialiser. Called by toolPageInit on
  // every tool-page render (direct load or SPA navigation).
  // ---------------------------------------------------------------------------
  async function initReviews(tool) {
    if (!tool) return;

    // Stale-navigation guard: capture the slug at init time; bail out of any
    // async path if a newer nav has already swapped in a different tool.
    var initSlug = tool.slug;

    var reviewsSection = document.getElementById('reviews');
    if (!reviewsSection) return;

    // Prefer tool.slug; fall back to DOM dataset in case of mismatch.
    var toolSlug = tool.slug || reviewsSection.dataset.toolSlug;
    var toolName = tool.name;
    var toolUrl  = tool.url || '';
    if (!toolSlug) return;

    var summaryContainer = document.getElementById('review-summary-container');
    var listContainer    = document.getElementById('review-list-container');

    // Track current user and auth intent — scoped per initReviews invocation.
    var currentUser = null;
    var pendingReviewOpen = false;

    // Remove stale modals from any previous init before injecting fresh ones.
    resetReviewModals();

    // Reviews need the library + DB. Load it on demand; if the CDN or DB is
    // unreachable, hide the whole reviews section rather than spinning forever.
    try {
      await window.SupabaseClient.ensureSupabase();
    } catch (_) {
      reviewsSection.hidden = true;
      return;
    }

    // Stale guard after first await.
    var cur = readToolData();
    if (!cur || cur.slug !== initSlug) return;

    if (typeof window.SupabaseClient?.isDatabaseHealthy === 'function') {
      var healthy = await window.SupabaseClient.isDatabaseHealthy();
      if (!healthy) {
        reviewsSection.hidden = true;
        return;
      }
    }

    // Stale guard after second await.
    cur = readToolData();
    if (!cur || cur.slug !== initSlug) return;

    try {
      var supabase = window.SupabaseClient.getSupabase();
      if (!supabase) {
        reviewsSection.hidden = true;
        return;
      }

      // Get the tool by slug (use maybeSingle to avoid 406 error when tool doesn't exist)
      var { data: dbTool, error: toolError } = await supabase
        .from('tools')
        .select('id, name, average_rating, review_count, rating_distribution, ai_summary, pros_aggregated, cons_aggregated, is_open_source')
        .eq('slug', toolSlug)
        .maybeSingle();

      // Stale guard after DB fetch.
      cur = readToolData();
      if (!cur || cur.slug !== initSlug) return;

      // Tool info for the form (either from DB or from Jekyll)
      var toolInfo = {
        id: null,
        slug: toolSlug,
        url: toolUrl
      };

      if (toolError || !dbTool) {
        // Tool not in DB yet - show empty state with Leave a Review button
        summaryContainer.innerHTML = `
          <div class="review-summary-empty">
            <button class="btn-cta" id="leave-review-btn">Leave a Review</button>
          </div>
        `;
        listContainer.innerHTML = '';

        // Inject modals (resetReviewModals already cleared any previous ones)
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderReviewFormModal(toolName, toolInfo)
        );
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderAuthModal()
        );
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderDeleteConfirmDialog()
        );

        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
        return;
      }

      // Tool exists in DB - use its ID
      toolInfo.id = dbTool.id;

      // Fetch approved reviews
      var { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('tool_id', dbTool.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Stale guard after reviews fetch.
      cur = readToolData();
      if (!cur || cur.slug !== initSlug) return;

      if (reviewsError) throw reviewsError;

      if (reviews && reviews.length > 0) {
        // Transform to component format (camelCase)
        var summary = {
          toolName: dbTool.name || toolName,
          averageRating: parseFloat(dbTool.average_rating) || (reviews.reduce(function (s, r) { return s + r.overall_rating; }, 0) / reviews.length),
          reviewCount: dbTool.review_count || reviews.length,
          ratingDistribution: dbTool.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          aiSummary: dbTool.ai_summary,
          prosAggregated: dbTool.pros_aggregated || [],
          consAggregated: dbTool.cons_aggregated || [],
          isOpenSource: dbTool.is_open_source || false
        };

        // Transform reviews to component format
        var formattedReviews = reviews.map(function (r) {
          return {
            id: r.id,
            authorName: r.author_name,
            authorInitial: r.author_initial,
            companySize: r.company_size,
            overallRating: r.overall_rating,
            title: r.title,
            likeBest: r.like_best,
            dislike: r.dislike,
            createdAt: new Date(r.created_at),
            isValidated: r.is_validated,
            source: r.source
          };
        });

        summaryContainer.innerHTML = window.ReviewComponents.renderReviewSummary(summary);
        listContainer.innerHTML = window.ReviewComponents.renderReviewList(formattedReviews, dbTool.name || toolName);

        // Add toggle handlers for "Show More" buttons
        listContainer.addEventListener('click', function (e) {
          if (e.target.classList.contains('review-toggle-btn')) {
            var card = e.target.closest('.review-card');
            var content = card.querySelector('.review-card-content');
            var isCollapsed = content.dataset.collapsed === 'true';
            content.dataset.collapsed = isCollapsed ? 'false' : 'true';
            e.target.textContent = isCollapsed ? 'Show Less ↑' : 'Show More ↓';
          }
        });

        // Inject modals
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderReviewFormModal(dbTool.name || toolName, toolInfo)
        );
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderAuthModal()
        );
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderDeleteConfirmDialog()
        );

        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
      } else {
        // Tool exists but has no reviews yet
        summaryContainer.innerHTML = `
          <div class="review-summary-empty">
            <button class="btn-cta" id="leave-review-btn">Leave a Review</button>
          </div>
        `;
        listContainer.innerHTML = '';

        // Inject modals
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderReviewFormModal(dbTool.name || toolName, toolInfo)
        );
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderAuthModal()
        );
        document.body.insertAdjacentHTML('beforeend',
          window.ReviewComponents.renderDeleteConfirmDialog()
        );

        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      if (summaryContainer) {
        summaryContainer.innerHTML = '<p class="error">Unable to load reviews. Please try again later.</p>';
      }
    }

    // -------------------------------------------------------------------------
    // Inner handler functions — defined inside initReviews so they close over
    // the per-invocation `currentUser`, `pendingReviewOpen`, `toolName`, etc.
    // -------------------------------------------------------------------------

    // Check initial auth state
    async function checkAuthState() {
      currentUser = await window.SupabaseClient.getCurrentUser();
      return currentUser;
    }

    // Auth modal handlers
    function setupAuthHandlers() {
      var authModal  = document.getElementById('auth-modal');
      var authCloseBtn = document.getElementById('auth-modal-close');
      var githubBtn  = document.getElementById('auth-github');
      var googleBtn  = document.getElementById('auth-google');

      function closeAuthModal() {
        var m = document.getElementById('auth-modal');
        if (m) m.classList.remove('active');
        document.body.style.overflow = '';
        pendingReviewOpen = false; // Reset if user closes without signing in
      }

      if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);

      authModal.addEventListener('click', function (e) {
        if (e.target === authModal) closeAuthModal();
      });

      // OAuth sign-in buttons
      if (githubBtn) {
        githubBtn.addEventListener('click', async function () {
          var { error } = await window.SupabaseClient.signInWithProvider('github');
          if (error) {
            alert('Failed to sign in: ' + error.message);
          }
        });
      }

      if (googleBtn) {
        googleBtn.addEventListener('click', async function () {
          var { error } = await window.SupabaseClient.signInWithProvider('google');
          if (error) {
            alert('Failed to sign in: ' + error.message);
          }
        });
      }

      // Listen for auth state changes — guard against stacking subscriptions
      // on repeated initReviews calls within the same page session.
      if (!authSubscribed) {
        authSubscribed = true;
        window.SupabaseClient.onAuthStateChange(function (event, session) {
          if (event === 'SIGNED_IN' && session && session.user) {
            currentUser = session.user;
            closeAuthModal();
            // Only open review form if user was actively trying to leave a review
            if (pendingReviewOpen) {
              pendingReviewOpen = false;
              var reviewModal = document.getElementById('review-modal');
              if (reviewModal) {
                prefillUserInfo(session.user);
                reviewModal.classList.add('active');
                document.body.style.overflow = 'hidden';
              }
            }
          } else if (event === 'SIGNED_OUT') {
            currentUser = null;
          }
        });
      }
    }

    // Pre-fill user info in review form (from auth provider)
    function prefillUserInfo(user) {
      var nameInput   = document.getElementById('review-name');
      var nameDisplay = document.getElementById('review-author-display');
      if (user) {
        var displayName = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || (user.email && user.email.split('@')[0]) || '';
        if (displayName) {
          if (nameInput)   nameInput.value = displayName;
          if (nameDisplay) nameDisplay.textContent = displayName;
        }
      }
    }

    // Review form handlers
    function setupReviewFormHandlers() {
      var modal       = document.getElementById('review-modal');
      var authModal   = document.getElementById('auth-modal');
      var form        = document.getElementById('review-form');
      var ratingInput = document.getElementById('rating-input');
      var ratingValue = document.getElementById('rating-value');
      var ratingError = document.getElementById('rating-error');
      var leaveReviewBtn = document.getElementById('leave-review-btn');
      var closeBtn    = document.getElementById('review-modal-close');
      var cancelBtn   = document.getElementById('review-cancel');
      var submitBtn   = document.getElementById('review-submit');

      // Open modal - check auth first, then check for existing review
      if (leaveReviewBtn) {
        leaveReviewBtn.addEventListener('click', async function () {
          await checkAuthState();

          if (currentUser) {
            // User is logged in - check if they have an existing review
            var toolId = form.dataset.toolId;
            if (toolId) {
              var existingResult = await window.ReviewsAPI.getUserReviewForTool(toolId);
              if (existingResult.hasReview) {
                // User has existing review - show existing review modal
                showExistingReviewModal(existingResult.review);
                return;
              }
            }
            // No existing review - show review form
            prefillUserInfo(currentUser);
            modal.classList.add('active');
          } else {
            // User not logged in - show auth modal and set pending flag
            pendingReviewOpen = true;
            authModal.classList.add('active');
          }
          document.body.style.overflow = 'hidden';
        });
      }

      // Close modal functions
      function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (closeBtn)   closeBtn.addEventListener('click', closeModal);
      if (cancelBtn)  cancelBtn.addEventListener('click', closeModal);

      // Close on overlay click
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });

      // Close on Escape key.
      // Replace stale Escape handler so navigations don't stack document listeners.
      if (window.__toolReviewEscHandler) {
        document.removeEventListener('keydown', window.__toolReviewEscHandler);
      }
      function escHandler(e) {
        if (e.key !== 'Escape') return;
        if (modal.classList.contains('active')) closeModal();
        if (authModal && authModal.classList.contains('active')) {
          authModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
      window.__toolReviewEscHandler = escHandler;
      document.addEventListener('keydown', escHandler);

      // Star rating interaction
      if (ratingInput) {
        var stars = ratingInput.querySelectorAll('button');
        stars.forEach(function (star) {
          star.addEventListener('click', function () {
            var value = parseInt(this.dataset.value, 10);
            ratingInput.dataset.rating = value;
            ratingValue.value = value;
            ratingError.textContent = '';

            // Update active states
            stars.forEach(function (s, i) {
              s.classList.toggle('active', i < value);
            });
          });

          // Hover preview
          star.addEventListener('mouseenter', function () {
            var value = parseInt(this.dataset.value, 10);
            stars.forEach(function (s, i) {
              s.style.color = i < value ? '#fbbf24' : '#3c3c3c';
            });
          });
        });

        // Reset on mouse leave
        ratingInput.addEventListener('mouseleave', function () {
          var currentRating = parseInt(ratingInput.dataset.rating, 10) || 0;
          stars.forEach(function (s, i) {
            s.style.color = i < currentRating ? '#fbbf24' : '#3c3c3c';
          });
        });
      }

      // Form submission
      if (form) {
        form.addEventListener('submit', async function (e) {
          e.preventDefault();

          // Validate rating
          if (!ratingValue.value) {
            ratingError.textContent = 'Please select a rating';
            return;
          }

          // Disable submit button
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          // Collect form data
          var formData = new FormData(form);
          var reviewData = {
            tool_id:       form.dataset.toolId || null,
            tool_slug:     form.dataset.toolSlug,
            tool_name:     form.dataset.toolName,
            tool_url:      form.dataset.toolUrl,
            overall_rating: parseInt(formData.get('overall_rating'), 10),
            title:          formData.get('title'),
            author_name:    formData.get('author_name'),
            company_size:   formData.get('company_size') || null,
            like_best:      formData.get('like_best'),
            dislike:        formData.get('dislike') || null,
            time_used:      formData.get('time_used') || null,
          };

          // Submit review (new or update)
          var isEditMode = form.dataset.editMode === 'true';
          var result;

          if (isEditMode) {
            var reviewId = form.dataset.reviewId;
            result = await window.ReviewsAPI.updateReview(reviewId, reviewData);
          } else {
            result = await window.ReviewsAPI.submitReview(reviewData);
          }

          if (result.success) {
            // Show success message, then re-render reviews in place (no reload)
            var modalContent = modal.querySelector('.review-modal');
            var successHtml = isEditMode
              ? window.ReviewComponents.renderUpdateSuccess()
              : window.ReviewComponents.renderReviewSuccess();
            modalContent.innerHTML = `
              <div class="review-modal-header">
                <h2>${isEditMode ? 'Review Updated' : 'Review Submitted'}</h2>
                <button class="review-modal-close" id="review-success-close">&times;</button>
              </div>
              ${successHtml}
            `;
            // Wire the close button on the success screen — close + re-render
            var successClose = document.getElementById('review-success-close');
            if (successClose) {
              successClose.addEventListener('click', function () {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                // Re-init reviews in place (replaces window.location.reload)
                var freshTool = readToolData();
                if (freshTool) initReviews(freshTool);
              });
            }
          } else {
            // Show error
            alert(result.error || 'Failed to submit review. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Review' : 'Submit Review';
          }
        });
      }
    }

    // Show existing review modal
    function showExistingReviewModal(review) {
      // Remove existing modal if present
      var existingModal = document.getElementById('existing-review-modal');
      if (existingModal) existingModal.remove();

      // Add modal to page (toolName is closed over from initReviews scope)
      document.body.insertAdjacentHTML('beforeend',
        window.ReviewComponents.renderExistingReviewModal(toolName, review)
      );

      // Setup handlers
      setupExistingReviewHandlers(review);

      // Show modal
      document.getElementById('existing-review-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Setup handlers for existing review modal
    function setupExistingReviewHandlers(review) {
      var existingModal = document.getElementById('existing-review-modal');
      var closeBtn  = document.getElementById('existing-review-close');
      var editBtn   = document.getElementById('edit-review-btn');
      var deleteBtn = document.getElementById('delete-review-btn');

      function closeExistingModal() {
        existingModal.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (closeBtn) closeBtn.addEventListener('click', closeExistingModal);

      existingModal.addEventListener('click', function (e) {
        if (e.target === existingModal) closeExistingModal();
      });

      // Edit button - open form pre-filled
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          closeExistingModal();
          openEditForm(review);
        });
      }

      // Delete button - show confirmation
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          showDeleteConfirmation(review.id);
        });
      }
    }

    // Open review form for editing
    function openEditForm(review) {
      var modal       = document.getElementById('review-modal');
      var form        = document.getElementById('review-form');
      var ratingInput = document.getElementById('rating-input');
      var ratingValue = document.getElementById('rating-value');
      var submitBtn   = document.getElementById('review-submit');

      // Pre-fill form with existing review data
      document.getElementById('review-title').value = review.title || '';
      document.getElementById('review-name').value  = review.author_name || '';
      document.getElementById('review-author-display').textContent = review.author_name || '';
      document.getElementById('review-company-size').value = review.company_size || '';
      document.getElementById('review-like-best').value    = review.like_best || '';
      document.getElementById('review-dislike').value      = review.dislike || '';
      document.getElementById('review-time-used').value    = review.time_used || '';

      // Set rating
      var rating = review.overall_rating || 0;
      ratingInput.dataset.rating = rating;
      ratingValue.value = rating;
      var stars = ratingInput.querySelectorAll('button');
      stars.forEach(function (s, i) {
        s.classList.toggle('active', i < rating);
        s.style.color = i < rating ? '#fbbf24' : '#3c3c3c';
      });

      // Mark form as edit mode
      form.dataset.editMode = 'true';
      form.dataset.reviewId = review.id;
      submitBtn.textContent = 'Update Review';

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Show delete confirmation
    function showDeleteConfirmation(reviewId) {
      var deleteModal = document.getElementById('delete-confirm-modal');
      var confirmBtn  = document.getElementById('delete-confirm-btn');
      var cancelBtn   = document.getElementById('delete-cancel-btn');
      var closeBtn    = document.getElementById('delete-confirm-close');

      function closeDeleteModal() {
        deleteModal.classList.remove('active');
      }

      if (closeBtn)  closeBtn.addEventListener('click', closeDeleteModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);

      deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) closeDeleteModal();
      }, { once: true });

      // Confirm delete — clone-and-replace to drop any stale listener from a
      // previous showDeleteConfirmation call, while preserving the retry path
      // (the handler re-enables the button on failure, so { once: true } would
      // break a second attempt after an error).
      if (confirmBtn) {
        var freshConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.replaceWith(freshConfirmBtn);
        confirmBtn = freshConfirmBtn;
        confirmBtn.addEventListener('click', async function () {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Deleting...';

          var result = await window.ReviewsAPI.deleteReview(reviewId);

          if (result.success) {
            // Close all modals
            closeDeleteModal();
            var existingModal = document.getElementById('existing-review-modal');
            if (existingModal) existingModal.classList.remove('active');
            document.body.style.overflow = '';

            // Re-render reviews in place (replaces window.location.reload)
            alert('Your review has been deleted.');
            var freshTool = readToolData();
            if (freshTool) initReviews(freshTool);
          } else {
            alert(result.error || 'Failed to delete review.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete Review';
          }
        });
      }

      // Show modal
      deleteModal.classList.add('active');
    }
  } // end initReviews

  // The router calls toolPageInit(slug), but the slug arg is intentionally
  // ignored — tool data is read from the #tool-data island (the source of
  // truth, present on both direct load and after an SPA content swap).
  function toolPageInit() {
    var tool = readToolData();
    if (!tool) return;
    wireSuggestEdit(tool);
    if (window.ComparisonLinks) window.ComparisonLinks.linkComparisonCompetitors();
    initReviews(tool);
  }

  window.toolPageInit = toolPageInit;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', toolPageInit);
  } else {
    toolPageInit();
  }
})();
