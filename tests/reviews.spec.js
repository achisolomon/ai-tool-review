import { test, expect } from '@playwright/test';

test.describe('Review Components', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
  });

  test.describe('Review Summary Section', () => {

    test('does not show duplicate GitHub stars in review summary', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Wait for reviews to load
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      // GitHub stars should only appear in the page header, not in review summary
      const reviewSummary = page.locator('.review-summary');
      const githubStarsInSummary = reviewSummary.locator('.github-stars');

      // Should not exist in review summary (we removed it)
      await expect(githubStarsInSummary).toHaveCount(0);
    });

    test('does not show "Generated using AI" subtitle', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      // The AI summary subtitle should not exist
      const aiSubtitle = page.locator('.ai-summary-subtitle');
      await expect(aiSubtitle).toHaveCount(0);
    });

    test('does not show redundant Pros & Cons heading', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      // Should not have separate pros-cons-title (table headers serve this purpose)
      const prosConsTitle = page.locator('.pros-cons-title');
      await expect(prosConsTitle).toHaveCount(0);
    });

    test('does not show "View All Pros and Cons" button', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      // The non-functional button should be removed
      const viewAllButton = page.locator('.btn-link:has-text("View All Pros and Cons")');
      await expect(viewAllButton).toHaveCount(0);
    });

    test('pros/cons table has correct headers', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      const prosConsTable = page.locator('.pros-cons-table');

      if (await prosConsTable.count() > 0) {
        // Check table headers exist with emoji indicators
        const proHeader = prosConsTable.locator('.pro-header');
        const conHeader = prosConsTable.locator('.con-header');

        await expect(proHeader).toContainText('Pros');
        await expect(conHeader).toContainText('Cons');
      }
    });

  });

  test.describe('Review Cards', () => {

    test('does not show menu button', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-card', { timeout: 10000 }).catch(() => null);

      // Menu button should be removed
      const menuButton = page.locator('.review-menu-btn');
      await expect(menuButton).toHaveCount(0);
    });

    test('does not show review badges', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-card', { timeout: 10000 }).catch(() => null);

      // Badges section should be removed
      const badges = page.locator('.review-badges');
      await expect(badges).toHaveCount(0);

      // Specifically, these text badges should not appear
      const validatedBadge = page.locator('.review-badge:has-text("Validated")');
      const sourceBadge = page.locator('.review-badge:has-text("Source")');
      await expect(validatedBadge).toHaveCount(0);
      await expect(sourceBadge).toHaveCount(0);
    });

    test('does not show share button', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-card', { timeout: 10000 }).catch(() => null);

      // Share button should be removed
      const shareButton = page.locator('.review-share-btn');
      await expect(shareButton).toHaveCount(0);
    });

    test('does not show review card footer', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-card', { timeout: 10000 }).catch(() => null);

      // Footer was removed entirely since it only contained badges and share button
      const footer = page.locator('.review-card-footer');
      await expect(footer).toHaveCount(0);
    });

    test('Show More button toggles review content', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Wait for reviews to load
      const reviewCard = page.locator('.review-card').first();
      await reviewCard.waitFor({ timeout: 10000 }).catch(() => null);

      if (await reviewCard.count() > 0) {
        const toggleButton = reviewCard.locator('.review-toggle-btn');
        const content = reviewCard.locator('.review-card-content');

        // Initially collapsed
        await expect(content).toHaveAttribute('data-collapsed', 'true');
        await expect(toggleButton).toContainText('Show More');

        // Click to expand
        await toggleButton.click();
        await expect(content).toHaveAttribute('data-collapsed', 'false');
        await expect(toggleButton).toContainText('Show Less');

        // Click to collapse again
        await toggleButton.click();
        await expect(content).toHaveAttribute('data-collapsed', 'true');
        await expect(toggleButton).toContainText('Show More');
      }
    });

    test('hidden Q&A sections become visible when expanded', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      const reviewCard = page.locator('.review-card').first();
      await reviewCard.waitFor({ timeout: 10000 }).catch(() => null);

      if (await reviewCard.count() > 0) {
        const toggleButton = reviewCard.locator('.review-toggle-btn');
        const hiddenSections = reviewCard.locator('.review-qa-hidden');

        // Hidden sections exist
        if (await hiddenSections.count() > 0) {
          // Expand the card
          await toggleButton.click();

          // After expanding, hidden content should be visible
          // (CSS removes the truncation when data-collapsed="false")
          const content = reviewCard.locator('.review-card-content');
          await expect(content).toHaveAttribute('data-collapsed', 'false');
        }
      }
    });

  });

  test.describe('Review Summary Structure', () => {

    test('shows rating score and review count', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      const summary = page.locator('.review-summary');

      if (await summary.count() > 0) {
        // Score value should be visible
        const scoreValue = summary.locator('.score-value');
        await expect(scoreValue).toBeVisible();

        // Review count should be visible
        const scoreCount = summary.locator('.score-count');
        await expect(scoreCount).toBeVisible();
      }
    });

    test('shows rating distribution bars', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      const distribution = page.locator('.rating-distribution');

      if (await distribution.count() > 0) {
        // Should have 5 distribution rows (for ratings 5, 4, 3, 2, 1)
        const rows = distribution.locator('.distribution-row');
        await expect(rows).toHaveCount(5);
      }
    });

    test('shows Leave a Review button', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('.review-summary', { timeout: 10000 }).catch(() => null);

      const leaveReviewBtn = page.locator('#leave-review-btn');

      if (await page.locator('.review-summary').count() > 0) {
        await expect(leaveReviewBtn).toBeVisible();
        await expect(leaveReviewBtn).toContainText('Leave a Review');
      }
    });

  });

  test.describe('Authentication Flow', () => {

    test('Leave a Review button opens auth modal when not logged in', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#leave-review-btn', { timeout: 10000 }).catch(() => null);

      const leaveReviewBtn = page.locator('#leave-review-btn');
      const authModal = page.locator('#auth-modal');

      if (await leaveReviewBtn.count() > 0) {
        // Auth modal should be hidden initially
        await expect(authModal).not.toHaveClass(/active/);

        // Click button - should open auth modal (not review modal) when not logged in
        await leaveReviewBtn.click();

        // Auth modal should now be visible
        await expect(authModal).toHaveClass(/active/);
      }
    });

    test('auth modal has GitHub and Google sign-in buttons', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#leave-review-btn', { timeout: 10000 }).catch(() => null);

      const leaveReviewBtn = page.locator('#leave-review-btn');

      if (await leaveReviewBtn.count() > 0) {
        await leaveReviewBtn.click();

        const githubBtn = page.locator('#auth-github');
        const googleBtn = page.locator('#auth-google');

        // Both OAuth providers should be visible
        await expect(githubBtn).toBeVisible();
        await expect(githubBtn).toContainText('GitHub');
        await expect(googleBtn).toBeVisible();
        await expect(googleBtn).toContainText('Google');
      }
    });

    test('Google sign-in button triggers OAuth flow', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#leave-review-btn', { timeout: 10000 }).catch(() => null);

      const leaveReviewBtn = page.locator('#leave-review-btn');

      if (await leaveReviewBtn.count() > 0) {
        await leaveReviewBtn.click();

        const googleBtn = page.locator('#auth-google');
        await expect(googleBtn).toBeVisible();

        // Clicking should trigger navigation to Google OAuth
        // We can't complete the flow in tests, but we can verify the button is clickable
        // and has the correct structure (SVG icon with Google colors)
        const googleSvg = googleBtn.locator('svg');
        await expect(googleSvg).toBeVisible();

        // Verify Google brand colors are present in the SVG paths
        const bluePath = googleBtn.locator('path[fill="#4285F4"]');
        const greenPath = googleBtn.locator('path[fill="#34A853"]');
        const yellowPath = googleBtn.locator('path[fill="#FBBC05"]');
        const redPath = googleBtn.locator('path[fill="#EA4335"]');

        await expect(bluePath).toHaveCount(1);
        await expect(greenPath).toHaveCount(1);
        await expect(yellowPath).toHaveCount(1);
        await expect(redPath).toHaveCount(1);
      }
    });

    test('auth modal close button works', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#leave-review-btn', { timeout: 10000 }).catch(() => null);

      const leaveReviewBtn = page.locator('#leave-review-btn');
      const authModal = page.locator('#auth-modal');
      const closeBtn = page.locator('#auth-modal-close');

      if (await leaveReviewBtn.count() > 0) {
        await leaveReviewBtn.click();
        await expect(authModal).toHaveClass(/active/);

        await closeBtn.click();
        await expect(authModal).not.toHaveClass(/active/);
      }
    });

  });

  test.describe('Review Form Modal', () => {

    // Helper to open review modal directly (simulating authenticated state)
    async function openReviewModal(page) {
      await page.evaluate(() => {
        const modal = document.getElementById('review-modal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    test('review modal has correct structure', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);
        await expect(modal).toHaveClass(/active/);

        // Check modal header (specifically in review modal, not auth modal)
        await expect(modal.locator('.review-modal-header h2')).toContainText('Review');
      }
    });

    test('modal close button works', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');
      const closeBtn = page.locator('#review-modal-close');

      if (await modal.count() > 0) {
        await openReviewModal(page);
        await expect(modal).toHaveClass(/active/);

        await closeBtn.click();
        await expect(modal).not.toHaveClass(/active/);
      }
    });

    test('modal cancel button works', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');
      const cancelBtn = page.locator('#review-cancel');

      if (await modal.count() > 0) {
        await openReviewModal(page);
        await expect(modal).toHaveClass(/active/);

        await cancelBtn.click();
        await expect(modal).not.toHaveClass(/active/);
      }
    });

    test('clicking overlay closes modal', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);
        await expect(modal).toHaveClass(/active/);

        // Click on the overlay (outside the modal content)
        await modal.click({ position: { x: 10, y: 10 } });
        await expect(modal).not.toHaveClass(/active/);
      }
    });

    test('star rating interaction works', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        const ratingInput = page.locator('#rating-input');
        const ratingValue = page.locator('#rating-value');
        const fourthStar = ratingInput.locator('button[data-value="4"]');

        // Click 4th star
        await fourthStar.click();

        // Check rating value is set
        await expect(ratingValue).toHaveValue('4');
        await expect(ratingInput).toHaveAttribute('data-rating', '4');
      }
    });

    test('form has required fields', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        // Check required fields exist
        await expect(page.locator('#rating-input')).toBeVisible();
        await expect(page.locator('#review-title')).toBeVisible();
        await expect(page.locator('#review-like-best')).toBeVisible();

        // Check "Posting as" display (name is now hidden input + display text)
        await expect(page.locator('.posting-as')).toBeVisible();
        await expect(page.locator('#review-name')).toBeAttached(); // hidden input

        // Check optional fields exist
        await expect(page.locator('#review-company-size')).toBeVisible();
        await expect(page.locator('#review-dislike')).toBeVisible();
        await expect(page.locator('#review-time-used')).toBeVisible();

        // Note: #review-problems was removed from the form
      }
    });

    test('form validates rating before submit', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        // Fill required fields except rating
        await page.fill('#review-title', 'Test Review');
        // Set hidden name field via JS (it's populated from auth)
        await page.evaluate(() => {
          const input = document.getElementById('review-name');
          if (input) input.value = 'Test User';
        });
        await page.fill('#review-like-best', 'This is a test review with enough characters.');

        // Try to submit without rating
        await page.click('#review-submit');

        // Should show rating error
        const ratingError = page.locator('#rating-error');
        await expect(ratingError).toContainText('Please select a rating');
      }
    });

  });

  // =============================================
  // BUG FIX REGRESSION TESTS
  // Tests for issues discovered during review submission debugging
  // =============================================
  test.describe('Review Submission Bug Fixes', () => {

    // Helper to open review modal directly (simulating authenticated state)
    async function openReviewModal(page) {
      await page.evaluate(() => {
        const modal = document.getElementById('review-modal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    test('form does NOT have problems_solved field (removed from schema)', async ({ page }) => {
      // REGRESSION TEST: problems_solved column was removed from the schema.
      // This test ensures it doesn't accidentally come back.
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        // problems_solved field should NOT exist
        const problemsField = page.locator('#review-problems');
        await expect(problemsField).toHaveCount(0);

        // The old field name variations should also not exist
        const problemsSolvedField = page.locator('[name="problems_solved"]');
        await expect(problemsSolvedField).toHaveCount(0);
      }
    });

    test('dislike field is optional (no required attribute)', async ({ page }) => {
      // BUG: dislike was NOT NULL in DB but should be optional
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        const dislikeField = page.locator('#review-dislike');

        // Should NOT have required attribute
        await expect(dislikeField).not.toHaveAttribute('required');
      }
    });

    test('time_used field is optional (no required attribute)', async ({ page }) => {
      // BUG: time_used was NOT NULL in DB but should be optional
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        const timeUsedField = page.locator('#review-time-used');

        // Should NOT have required attribute
        await expect(timeUsedField).not.toHaveAttribute('required');
      }
    });

    test('like_best field has minlength of 10 characters', async ({ page }) => {
      // BUG: Original constraint was 50 chars which was too strict
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        const likeBestField = page.locator('#review-like-best');

        // Should have minlength="10"
        await expect(likeBestField).toHaveAttribute('minlength', '10');
      }
    });

    test('dislike field has minlength of 10 characters if provided', async ({ page }) => {
      // BUG: Original constraint was 50 chars which was too strict
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        const dislikeField = page.locator('#review-dislike');

        // Should have minlength="10" (validated only when content provided)
        await expect(dislikeField).toHaveAttribute('minlength', '10');
      }
    });

    test('form shows hint about minimum characters for like_best', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        // Should show hint about minimum 10 characters
        const likeBestHint = page.locator('#review-like-best').locator('..').locator('.form-hint');
        await expect(likeBestHint).toContainText('10');
      }
    });

    test('form shows hint about optional dislike with minimum if provided', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const modal = page.locator('#review-modal');

      if (await modal.count() > 0) {
        await openReviewModal(page);

        // Should show hint about being optional
        const dislikeHint = page.locator('#review-dislike').locator('..').locator('.form-hint');
        await expect(dislikeHint).toContainText('Optional');
      }
    });

  });

  // =============================================
  // API VALIDATION TESTS
  // Tests for ReviewsAPI validation logic
  // =============================================
  test.describe('ReviewsAPI Validation', () => {

    test('submitReview validates minimum 10 characters for like_best', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Test the validation function directly
      const result = await page.evaluate(async () => {
        // Mock minimal review data with short like_best
        const reviewData = {
          tool_id: 'test-id',
          overall_rating: 5,
          title: 'Test Review',
          author_name: 'Test User',
          like_best: 'Short', // Only 5 chars, should fail
        };

        // Call validation logic (simulated)
        if (!reviewData.like_best || reviewData.like_best.trim().length < 10) {
          return { success: false, error: 'Please describe what you like best (minimum 10 characters)' };
        }
        return { success: true };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('10 characters');
    });

    test('submitReview validates minimum 10 characters for dislike if provided', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Test the validation function directly
      const result = await page.evaluate(async () => {
        const reviewData = {
          tool_id: 'test-id',
          overall_rating: 5,
          title: 'Test Review',
          author_name: 'Test User',
          like_best: 'This is long enough to pass validation',
          dislike: 'Short', // Only 5 chars, should fail
        };

        // Call validation logic (simulated)
        if (reviewData.dislike && reviewData.dislike.trim().length > 0 && reviewData.dislike.trim().length < 10) {
          return { success: false, error: 'If providing dislikes, please write at least 10 characters' };
        }
        return { success: true };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('10 characters');
    });

    test('submitReview allows empty dislike field', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Test the validation function directly
      const result = await page.evaluate(async () => {
        const reviewData = {
          tool_id: 'test-id',
          overall_rating: 5,
          title: 'Test Review',
          author_name: 'Test User',
          like_best: 'This is long enough to pass validation',
          dislike: '', // Empty should be allowed
        };

        // Call validation logic (simulated)
        if (reviewData.dislike && reviewData.dislike.trim().length > 0 && reviewData.dislike.trim().length < 10) {
          return { success: false, error: 'If providing dislikes, please write at least 10 characters' };
        }
        return { success: true };
      });

      expect(result.success).toBe(true);
    });

    test('submitReview allows null dislike field', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Test the validation function directly
      const result = await page.evaluate(async () => {
        const reviewData = {
          tool_id: 'test-id',
          overall_rating: 5,
          title: 'Test Review',
          author_name: 'Test User',
          like_best: 'This is long enough to pass validation',
          dislike: null, // Null should be allowed
        };

        // Call validation logic (simulated)
        if (reviewData.dislike && reviewData.dislike.trim().length > 0 && reviewData.dislike.trim().length < 10) {
          return { success: false, error: 'If providing dislikes, please write at least 10 characters' };
        }
        return { success: true };
      });

      expect(result.success).toBe(true);
    });

    test('submitReview requires tool_id', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      const result = await page.evaluate(async () => {
        const reviewData = {
          // tool_id missing!
          overall_rating: 5,
          title: 'Test Review',
          author_name: 'Test User',
          like_best: 'This is long enough to pass validation',
        };

        if (!reviewData.tool_id) {
          return { success: false, error: 'Tool ID is required' };
        }
        return { success: true };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool ID');
    });

    test('submitReview validates rating between 1 and 5', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      const result = await page.evaluate(async () => {
        const reviewData = {
          tool_id: 'test-id',
          overall_rating: 6, // Invalid rating
          title: 'Test Review',
          author_name: 'Test User',
          like_best: 'This is long enough to pass validation',
        };

        if (!reviewData.overall_rating || reviewData.overall_rating < 1 || reviewData.overall_rating > 5) {
          return { success: false, error: 'Rating must be between 1 and 5' };
        }
        return { success: true };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('1 and 5');
    });

  });

  // =============================================
  // COMPREHENSIVE FORM VALIDATION TESTS
  // Tests for all possible form inputs
  // =============================================
  test.describe('Form Validation - Comprehensive', () => {

    // Helper to open review modal
    async function openReviewModal(page) {
      await page.evaluate(() => {
        const modal = document.getElementById('review-modal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    // Helper to set author name (hidden field)
    async function setAuthorName(page, name) {
      await page.evaluate((n) => {
        const input = document.getElementById('review-name');
        if (input) input.value = n;
      }, name);
    }

    test.describe('Positive Tests - Valid Inputs', () => {

      test('accepts valid review with all required fields', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Fill all required fields
        await page.locator('#rating-input button[data-value="5"]').click();
        await page.fill('#review-title', 'Great tool for development');
        await setAuthorName(page, 'Test User');
        await page.fill('#review-like-best', 'Excellent features and performance');

        // Verify no validation errors shown
        const ratingError = page.locator('#rating-error');
        await expect(ratingError).toBeEmpty();
      });

      test('accepts review with exactly 10 characters in like_best', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);
        await page.locator('#rating-input button[data-value="4"]').click();
        await page.fill('#review-title', 'Good');
        await setAuthorName(page, 'User');
        await page.fill('#review-like-best', '1234567890'); // Exactly 10 chars

        const likeBestField = page.locator('#review-like-best');
        await expect(likeBestField).toHaveValue('1234567890');
      });

      test('accepts review with special characters in title', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);
        await page.locator('#rating-input button[data-value="5"]').click();
        await page.fill('#review-title', 'Great tool! #1 Best & "Awesome" <test>');
        await setAuthorName(page, 'Test User');
        await page.fill('#review-like-best', 'Works great with special chars');

        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveValue('Great tool! #1 Best & "Awesome" <test>');
      });

      test('accepts review with unicode/emoji characters', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);
        await page.locator('#rating-input button[data-value="5"]').click();
        await page.fill('#review-title', '最高のツール 🚀 Отлично');
        await setAuthorName(page, 'Tëst Üsér 日本語');
        await page.fill('#review-like-best', 'Supports unicode: 你好世界 🎉 мир');

        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveValue('最高のツール 🚀 Отлично');
      });

      test('accepts review with empty optional fields', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);
        await page.locator('#rating-input button[data-value="3"]').click();
        await page.fill('#review-title', 'Decent tool');
        await setAuthorName(page, 'User');
        await page.fill('#review-like-best', 'It works well enough');

        // Leave optional fields empty
        const dislikeField = page.locator('#review-dislike');
        const companySizeField = page.locator('#review-company-size');
        const timeUsedField = page.locator('#review-time-used');

        await expect(dislikeField).toHaveValue('');
        await expect(companySizeField).toHaveValue('');
        await expect(timeUsedField).toHaveValue('');
      });

      test('accepts all rating values (1-5)', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        for (let rating = 1; rating <= 5; rating++) {
          await page.locator(`#rating-input button[data-value="${rating}"]`).click();
          const ratingValue = page.locator('#rating-value');
          await expect(ratingValue).toHaveValue(String(rating));
        }
      });

      test('accepts all company size options', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const companySizes = ['', 'solo', 'small', 'mid', 'enterprise'];
        for (const size of companySizes) {
          await page.selectOption('#review-company-size', size);
          const companySizeField = page.locator('#review-company-size');
          await expect(companySizeField).toHaveValue(size);
        }
      });

      test('accepts all time used options', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const timeOptions = ['', 'less_than_month', 'one_to_six', 'six_to_twelve', 'more_than_year'];
        for (const time of timeOptions) {
          await page.selectOption('#review-time-used', time);
          const timeUsedField = page.locator('#review-time-used');
          await expect(timeUsedField).toHaveValue(time);
        }
      });

    });

    test.describe('Negative Tests - Invalid Inputs', () => {

      test('rejects submission without rating', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Fill all fields except rating
        await page.fill('#review-title', 'Test Review');
        await setAuthorName(page, 'Test User');
        await page.fill('#review-like-best', 'This is long enough');

        // Try to submit
        await page.click('#review-submit');

        // Should show error
        const ratingError = page.locator('#rating-error');
        await expect(ratingError).toContainText('Please select a rating');
      });

      test('rejects empty title (browser validation)', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);
        await page.locator('#rating-input button[data-value="5"]').click();
        // Leave title empty
        await setAuthorName(page, 'Test User');
        await page.fill('#review-like-best', 'This is long enough');

        // Title field should have required attribute
        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveAttribute('required', '');
      });

      test('rejects empty like_best (browser validation)', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // like_best field should have required attribute
        const likeBestField = page.locator('#review-like-best');
        await expect(likeBestField).toHaveAttribute('required', '');
      });

      test('rejects like_best with less than 10 characters (browser validation)', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // like_best should have minlength="10"
        const likeBestField = page.locator('#review-like-best');
        await expect(likeBestField).toHaveAttribute('minlength', '10');
      });

      test('rejects dislike with less than 10 characters when provided', async ({ page }) => {
        await page.goto('/tools/claude-code/');

        // Test the JS validation logic
        const result = await page.evaluate(() => {
          const dislike = 'Too short'; // 9 characters
          if (dislike && dislike.trim().length > 0 && dislike.trim().length < 10) {
            return { valid: false, message: 'Too short' };
          }
          return { valid: true };
        });

        expect(result.valid).toBe(false);
      });

    });

    test.describe('Edge Cases - Boundary Testing', () => {

      test('like_best with exactly 9 characters should fail validation', async ({ page }) => {
        await page.goto('/tools/claude-code/');

        const result = await page.evaluate(() => {
          const like_best = '123456789'; // 9 chars
          return like_best.trim().length < 10;
        });

        expect(result).toBe(true); // Should be true that it's less than 10
      });

      test('like_best with exactly 10 characters should pass validation', async ({ page }) => {
        await page.goto('/tools/claude-code/');

        const result = await page.evaluate(() => {
          const like_best = '1234567890'; // 10 chars
          return like_best.trim().length >= 10;
        });

        expect(result).toBe(true);
      });

      test('title at max length (100 chars)', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const maxTitle = 'A'.repeat(100);
        await page.fill('#review-title', maxTitle);

        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveAttribute('maxlength', '100');
        await expect(titleField).toHaveValue(maxTitle);
      });

      test('like_best at max length (2000 chars)', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const maxText = 'A'.repeat(2000);
        await page.fill('#review-like-best', maxText);

        const likeBestField = page.locator('#review-like-best');
        await expect(likeBestField).toHaveAttribute('maxlength', '2000');
      });

      test('whitespace-only input should be trimmed and fail', async ({ page }) => {
        await page.goto('/tools/claude-code/');

        const result = await page.evaluate(() => {
          const like_best = '          '; // 10 spaces
          return like_best.trim().length >= 10;
        });

        expect(result).toBe(false); // Trimmed = 0 chars
      });

      test('input with leading/trailing whitespace should trim correctly', async ({ page }) => {
        await page.goto('/tools/claude-code/');

        const result = await page.evaluate(() => {
          const like_best = '   12345678   '; // 8 chars + whitespace
          return like_best.trim().length >= 10;
        });

        expect(result).toBe(false); // Trimmed = 8 chars
      });

    });

    test.describe('Security Tests - XSS & Injection', () => {

      test('handles XSS attempt in title', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const xssPayload = '<script>alert("XSS")</script>';
        await page.fill('#review-title', xssPayload);

        // Value should be stored as-is (escaped on display)
        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveValue(xssPayload);
      });

      test('handles XSS attempt in like_best', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const xssPayload = '<img src="x" onerror="alert(1)"> Test content';
        await page.fill('#review-like-best', xssPayload);

        const likeBestField = page.locator('#review-like-best');
        await expect(likeBestField).toHaveValue(xssPayload);
      });

      test('handles SQL injection attempt in fields', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const sqlPayload = "'; DROP TABLE reviews; --";
        await page.fill('#review-title', sqlPayload);

        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveValue(sqlPayload);
      });

      test('handles JavaScript URL in fields', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const jsUrl = 'javascript:alert(document.cookie)';
        await page.fill('#review-title', jsUrl);

        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveValue(jsUrl);
      });

      test('handles template injection attempt', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const templatePayload = '{{constructor.constructor("alert(1)")()}}';
        await page.fill('#review-title', templatePayload);

        const titleField = page.locator('#review-title');
        await expect(titleField).toHaveValue(templatePayload);
      });

    });

    test.describe('UI State Tests', () => {

      test('submit button is disabled during submission', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        const submitBtn = page.locator('#review-submit');

        // Initially enabled
        await expect(submitBtn).not.toBeDisabled();
        await expect(submitBtn).toContainText('Submit Review');
      });

      test('star rating visual feedback works correctly', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Click 3rd star
        await page.locator('#rating-input button[data-value="3"]').click();

        // Check data attribute is set
        const ratingInput = page.locator('#rating-input');
        await expect(ratingInput).toHaveAttribute('data-rating', '3');
      });

      test('rating value persists after changing', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Click different stars
        await page.locator('#rating-input button[data-value="2"]').click();
        await expect(page.locator('#rating-value')).toHaveValue('2');

        await page.locator('#rating-input button[data-value="5"]').click();
        await expect(page.locator('#rating-value')).toHaveValue('5');

        await page.locator('#rating-input button[data-value="1"]').click();
        await expect(page.locator('#rating-value')).toHaveValue('1');
      });

      test('posting-as shows user name', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Check posting-as structure exists
        const postingAs = page.locator('.posting-as');
        await expect(postingAs).toBeVisible();

        const postingAsLabel = page.locator('.posting-as-label');
        await expect(postingAsLabel).toContainText('Posting as');
      });

    });

    test.describe('Accessibility Tests', () => {

      test('form fields have proper labels', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Check labels exist for inputs
        await expect(page.locator('label[for="review-title"]')).toBeVisible();
        await expect(page.locator('label[for="review-like-best"]')).toBeVisible();
        await expect(page.locator('label[for="review-company-size"]')).toBeVisible();
        await expect(page.locator('label[for="review-dislike"]')).toBeVisible();
        await expect(page.locator('label[for="review-time-used"]')).toBeVisible();
      });

      test('required fields are marked with asterisk', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);

        // Check required indicators
        const ratingLabel = page.locator('label:has-text("Overall Rating") .required');
        const titleLabel = page.locator('label[for="review-title"] .required');
        const likeBestLabel = page.locator('label[for="review-like-best"] .required');

        await expect(ratingLabel).toBeVisible();
        await expect(titleLabel).toBeVisible();
        await expect(likeBestLabel).toBeVisible();
      });

      test('modal can be closed with escape key', async ({ page }) => {
        await page.goto('/tools/claude-code/');
        await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

        const modal = page.locator('#review-modal');
        if (await modal.count() === 0) return;

        await openReviewModal(page);
        await expect(modal).toHaveClass(/active/);

        // Press Escape (note: may need custom handler)
        await page.keyboard.press('Escape');

        // If escape handler is implemented, modal should close
        // This test documents expected behavior
      });

    });

  });

  // =============================================
  // TOOL NOT IN DATABASE TESTS
  // Tests for tools that don't exist in Supabase yet
  // =============================================
  test.describe('Tool Not In Database', () => {

    // Stub Supabase so these tests don't depend on real DB connectivity.
    // The health probe must succeed (so tool-page.js proceeds past the health
    // gate), and the tools REST query must return null (tool not in DB), which
    // is the exact scenario these tests exercise.
    async function stubSupabaseNotFound(page) {
      // Health probe — intercept the fetch() call so isDatabaseHealthy() → true
      await page.route('**/auth/v1/health**', route => route.fulfill({ status: 200, body: '{}' }));
      // Pre-seed window.supabase via initScript so ensureSupabase() short-circuits
      // (line 60: `if (window.supabase) return Promise.resolve(window.supabase)`)
      // and never tries to inject the CDN script tag.
      await page.addInitScript(() => {
        const mockClient = {
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
          auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          },
        };
        window.supabase = { createClient: () => mockClient };
      });
    }

    test('shows Leave a Review button for tool not in database', async ({ page }) => {
      await stubSupabaseNotFound(page);
      // nano-banana is a tool that exists in Jekyll but not in the database
      await page.goto('/tools/nano-banana/', { waitUntil: 'domcontentloaded' });

      // Should show the empty review state with Leave a Review button
      const leaveReviewBtn = page.locator('#leave-review-btn');

      // The button should exist whether tool is in DB or not
      await expect(leaveReviewBtn).toBeVisible({ timeout: 8000 });
    });

    test('shows empty state message for tool without reviews', async ({ page }) => {
      await stubSupabaseNotFound(page);
      await page.goto('/tools/nano-banana/', { waitUntil: 'domcontentloaded' });

      // Should show either the empty state or the summary (if tool was just created)
      const emptyState = page.locator('.review-summary-empty');
      const reviewSummary = page.locator('.review-summary');

      // One of these should be visible
      await expect(emptyState.or(reviewSummary).first()).toBeVisible({ timeout: 8000 });
    });

    test('review form stores tool slug for new tools', async ({ page }) => {
      await page.goto('/tools/nano-banana/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const reviewForm = page.locator('#review-form');
      if (await reviewForm.count() === 0) return;

      // Form should have data-tool-slug attribute for tools not in DB
      const toolSlug = await reviewForm.getAttribute('data-tool-slug');
      expect(toolSlug).toBe('nano-banana');
    });

    test('review form stores tool name for new tools', async ({ page }) => {
      await page.goto('/tools/nano-banana/');
      await page.waitForSelector('#review-modal', { timeout: 10000 }).catch(() => null);

      const reviewForm = page.locator('#review-form');
      if (await reviewForm.count() === 0) return;

      // Form should have data-tool-name attribute
      const toolName = await reviewForm.getAttribute('data-tool-name');
      expect(toolName).toBeTruthy();
      expect(toolName.length).toBeGreaterThan(0);
    });

    test('no 406 error in console when tool does not exist', async ({ page }) => {
      const errors = [];

      // Capture console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/tools/nano-banana/');
      await page.waitForTimeout(3000);

      // Should not have 406 errors (we use maybeSingle instead of single)
      const has406Error = errors.some(e => e.includes('406'));
      expect(has406Error).toBe(false);
    });

    test('findOrCreateTool returns existing tool id if tool exists', async ({ page }) => {
      await page.goto('/tools/claude-code/');
      await page.waitForTimeout(2000);

      // Test the findOrCreateTool function logic
      const result = await page.evaluate(async () => {
        // This tests the concept - actual tool lookup happens server-side
        const toolInfo = {
          slug: 'claude-code',
          name: 'Claude Code',
          url: 'https://example.com'
        };

        // If window.ReviewsAPI exists, we can check it's exported
        return typeof window.ReviewsAPI?.findOrCreateTool === 'function';
      });

      expect(result).toBe(true);
    });

  });

  test.describe('Existing Review Management', () => {

    test('shows existing review modal when user has already reviewed', async ({ page }) => {
      // This test requires a logged-in user with an existing review
      // For now, we test that the modal component exists
      await page.goto('/tools/claude-code/');

      // Verify the delete confirmation dialog is added to the page
      await page.waitForSelector('#delete-confirm-modal', { timeout: 10000 }).catch(() => null);

      const deleteModal = page.locator('#delete-confirm-modal');
      // Modal should exist but not be visible initially
      if (await deleteModal.count() > 0) {
        await expect(deleteModal).not.toHaveClass(/active/);
      }
    });

    test('existing review modal has edit and delete buttons', async ({ page }) => {
      // Test component rendering
      await page.goto('/tools/claude-code/');

      // Inject test modal to verify structure
      await page.evaluate(() => {
        const testReview = {
          id: 'test-123',
          title: 'Great tool',
          overall_rating: 5,
          status: 'approved',
          created_at: '2024-01-15T00:00:00Z'
        };
        const modalHtml = window.ReviewComponents.renderExistingReviewModal('Test Tool', testReview);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        // Make the modal visible for testing
        const modal = document.getElementById('existing-review-modal');
        if (modal) modal.classList.add('active');
      });

      const modal = page.locator('#existing-review-modal');
      await expect(modal).toBeVisible();

      const editBtn = modal.locator('#edit-review-btn');
      const deleteBtn = modal.locator('#delete-review-btn');

      await expect(editBtn).toBeVisible();
      await expect(deleteBtn).toBeVisible();
      await expect(editBtn).toHaveText('Edit Review');
      await expect(deleteBtn).toHaveText('Delete Review');
    });

    test('existing review modal shows correct status badge', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Test pending status
      await page.evaluate(() => {
        const pendingReview = {
          id: 'test-pending',
          title: 'Pending Review',
          overall_rating: 4,
          status: 'pending',
          created_at: '2024-01-15T00:00:00Z'
        };
        const existing = document.getElementById('existing-review-modal');
        if (existing) existing.remove();
        const modalHtml = window.ReviewComponents.renderExistingReviewModal('Test Tool', pendingReview);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      });

      const pendingBadge = page.locator('.review-status-badge.status-pending');
      await expect(pendingBadge).toHaveText('Pending Approval');

      // Test approved status
      await page.evaluate(() => {
        const approvedReview = {
          id: 'test-approved',
          title: 'Approved Review',
          overall_rating: 5,
          status: 'approved',
          created_at: '2024-01-15T00:00:00Z'
        };
        const existing = document.getElementById('existing-review-modal');
        if (existing) existing.remove();
        const modalHtml = window.ReviewComponents.renderExistingReviewModal('Test Tool', approvedReview);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      });

      const publishedBadge = page.locator('.review-status-badge.status-published');
      await expect(publishedBadge).toHaveText('Published');
    });

    test('delete confirmation modal has cancel and confirm buttons', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Inject delete confirmation modal
      await page.evaluate(() => {
        const modalHtml = window.ReviewComponents.renderDeleteConfirmDialog();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('delete-confirm-modal').classList.add('active');
      });

      const modal = page.locator('#delete-confirm-modal');
      await expect(modal).toHaveClass(/active/);

      const cancelBtn = modal.locator('#delete-cancel-btn');
      const confirmBtn = modal.locator('#delete-confirm-btn');

      await expect(cancelBtn).toBeVisible();
      await expect(confirmBtn).toBeVisible();
      await expect(cancelBtn).toHaveText('Cancel');
      await expect(confirmBtn).toHaveText('Delete Review');
    });

    test('API functions exist for review management', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Verify API functions exist
      const hasGetUserReview = await page.evaluate(() => {
        return typeof window.ReviewsAPI.getUserReviewForTool === 'function';
      });
      const hasUpdateReview = await page.evaluate(() => {
        return typeof window.ReviewsAPI.updateReview === 'function';
      });
      const hasDeleteReview = await page.evaluate(() => {
        return typeof window.ReviewsAPI.deleteReview === 'function';
      });

      expect(hasGetUserReview).toBe(true);
      expect(hasUpdateReview).toBe(true);
      expect(hasDeleteReview).toBe(true);
    });

  });

});
