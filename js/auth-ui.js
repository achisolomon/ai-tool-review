// Auth UI Component
// =================
// Renders auth state indicator (avatar dropdown when logged in, sign-in button when logged out)

(function() {
    'use strict';

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // Get initial from name/email
    function getInitial(name, email) {
        if (name && name.length > 0) {
            return name.charAt(0).toUpperCase();
        }
        if (email && email.length > 0) {
            return email.charAt(0).toUpperCase();
        }
        return '?';
    }

    // Render the auth dropdown HTML
    function renderAuthDropdown(user, profile) {
        if (!user) {
            // Logged out state
            return `
                <div class="auth-dropdown-container" id="auth-dropdown">
                    <button class="auth-signin-btn" id="auth-signin-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Sign in
                    </button>
                </div>
            `;
        }

        // Logged in state
        const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.user_name || '';
        const email = user.email || '';
        const initial = getInitial(displayName, email);

        return `
            <div class="auth-dropdown-container" id="auth-dropdown">
                <button class="auth-avatar-btn" id="auth-avatar-btn" aria-expanded="false" aria-haspopup="true">
                    <div class="auth-avatar" data-letter="${initial}">${initial}</div>
                    <span class="auth-avatar-caret">▼</span>
                </button>
                <div class="auth-dropdown-menu" role="menu">
                    <div class="auth-dropdown-header">
                        <div class="auth-dropdown-email">${escapeHtml(email)}</div>
                        ${displayName ? `<div class="auth-dropdown-name">${escapeHtml(displayName)}</div>` : ''}
                    </div>
                    <a href="/my-reviews.html" class="auth-dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        My Reviews
                    </a>
                    <a href="/my-suggestions.html" class="auth-dropdown-item" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        My Suggestions
                    </a>
                    <div class="auth-dropdown-divider"></div>
                    <button class="auth-dropdown-item logout" id="auth-logout-btn" role="menuitem">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign out
                    </button>
                </div>
            </div>
        `;
    }

    // Render loading state
    function renderLoading() {
        return `
            <div class="auth-dropdown-container" id="auth-dropdown">
                <div class="auth-loading"></div>
            </div>
        `;
    }

    // Initialize auth dropdown in a container
    async function initAuthDropdown(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[AuthUI] Container not found:', containerId);
            return;
        }

        // Show loading state
        container.innerHTML = renderLoading();

        // Wait for Supabase to be ready
        if (!window.SupabaseClient) {
            console.warn('[AuthUI] SupabaseClient not found');
            container.innerHTML = '';
            return;
        }

        // If the DB is unreachable, don't render the auth control at all —
        // a sign-in button that leads nowhere (and a forever-spinner) is worse
        // than no button. Clear the loading state and bail. (Guarded so test
        // stubs that replace SupabaseClient without this method still render.)
        if (typeof window.SupabaseClient.isDatabaseHealthy === 'function') {
            const healthy = await window.SupabaseClient.isDatabaseHealthy();
            if (!healthy) {
                container.innerHTML = '';
                return;
            }
        }

        // Get current user and profile
        const user = await window.SupabaseClient.getCurrentUser();
        let profile = null;

        if (user) {
            const { data } = await window.SupabaseClient.getUserProfile();
            profile = data;

            // Update last sign-in
            await window.SupabaseClient.updateLastSignIn();
        }

        // Render dropdown
        container.innerHTML = renderAuthDropdown(user, profile);

        // Setup event handlers
        setupDropdownHandlers(container);

        // Listen for auth state changes
        window.SupabaseClient.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                const newUser = session?.user || null;
                let newProfile = null;

                if (newUser) {
                    const { data } = await window.SupabaseClient.getUserProfile();
                    newProfile = data;
                    await window.SupabaseClient.updateLastSignIn();
                }

                container.innerHTML = renderAuthDropdown(newUser, newProfile);
                setupDropdownHandlers(container);
            }
        });
    }

    // Store references to document-level event handlers so they can be removed
    let documentClickHandler = null;
    let documentKeydownHandler = null;

    // Setup dropdown event handlers
    function setupDropdownHandlers(container) {
        const dropdown = container.querySelector('#auth-dropdown');
        const avatarBtn = container.querySelector('#auth-avatar-btn');
        const signinBtn = container.querySelector('#auth-signin-btn');
        const logoutBtn = container.querySelector('#auth-logout-btn');

        // Toggle dropdown
        if (avatarBtn) {
            avatarBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('open');
                dropdown.classList.toggle('open');
                avatarBtn.setAttribute('aria-expanded', !isOpen);
            });
        }

        // Sign in button — re-check backend reachability at CLICK time (fresh,
        // bypassing the page-load cache) so a backend that died after load does
        // not bounce the user to a dead OAuth URL.
        if (signinBtn) {
            signinBtn.addEventListener('click', async function() {
                this.disabled = true;
                const healthy = await window.SupabaseClient.isDatabaseHealthy(true);
                if (!healthy) {
                    alert('Sign-in is temporarily unavailable. Please try again in a few minutes.');
                    container.innerHTML = '';
                    return;
                }
                const { error } = await window.SupabaseClient.signInWithProvider('github');
                if (error) {
                    console.error('[AuthUI] Sign in failed:', error);
                    alert('Sign in failed: ' + error.message);
                    this.disabled = false;
                }
            });
        }

        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function() {
                dropdown.classList.remove('open');
                const { error } = await window.SupabaseClient.signOut();
                if (error) {
                    console.error('[AuthUI] Sign out failed:', error);
                }
            });
        }

        // Remove old document-level handlers before adding new ones
        if (documentClickHandler) {
            document.removeEventListener('click', documentClickHandler);
        }
        if (documentKeydownHandler) {
            document.removeEventListener('keydown', documentKeydownHandler);
        }

        // Close on click outside
        documentClickHandler = function(e) {
            const currentDropdown = container.querySelector('#auth-dropdown');
            const currentAvatarBtn = container.querySelector('#auth-avatar-btn');
            if (currentDropdown && !currentDropdown.contains(e.target)) {
                currentDropdown.classList.remove('open');
                if (currentAvatarBtn) currentAvatarBtn.setAttribute('aria-expanded', 'false');
            }
        };
        document.addEventListener('click', documentClickHandler);

        // Close on Escape
        documentKeydownHandler = function(e) {
            const currentDropdown = container.querySelector('#auth-dropdown');
            const currentAvatarBtn = container.querySelector('#auth-avatar-btn');
            if (e.key === 'Escape' && currentDropdown && currentDropdown.classList.contains('open')) {
                currentDropdown.classList.remove('open');
                if (currentAvatarBtn) {
                    currentAvatarBtn.setAttribute('aria-expanded', 'false');
                    currentAvatarBtn.focus();
                }
            }
        };
        document.addEventListener('keydown', documentKeydownHandler);
    }

    // Export
    window.AuthUI = {
        init: initAuthDropdown
    };
})();
