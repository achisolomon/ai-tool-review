// Admin Suggestions module — queue list + decision view
// ======================================================
// Exposed as window.AdminSuggestions (IIFE + window global pattern)
(function () {
    'use strict';

    // ------------------------------------------------------------------ //
    // Helpers
    // ------------------------------------------------------------------ //

    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    function formatRelativeDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Extract a registrable domain (e.g. letta.com) from a URL
    function registrableDomain(url) {
        if (!url) return null;
        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            // Take last two labels as the registrable domain
            const parts = hostname.split('.');
            return parts.slice(-2).join('.');
        } catch (_) {
            return url;
        }
    }

    // Return a display-friendly group key for a suggestion row
    function groupKey(s) {
        if (s.tool_slug) return s.tool_slug;
        if (s.kind === 'new_tool' && s.payload?.website) return registrableDomain(s.payload.website);
        return '__ungrouped__';
    }

    // Build a one-line summary from the suggestion payload
    function oneLiner(s) {
        const p = s.payload || {};
        switch (s.kind) {
            case 'new_tool':
                return `Add "${escapeHtml(p.name || 'unnamed')}" — ${escapeHtml(p.website || '')}`;
            case 'taxonomy_change':
                return `Taxonomy: ${escapeHtml(p.op || 'change')} — ${escapeHtml(p.details || '')}`.slice(0, 120);
            case 'tool_move':
                return `Move ${escapeHtml(s.tool_slug || '')} → ${escapeHtml(p.to_category || '')}/${escapeHtml(p.to_subcategory || '')}`;
            case 'detail_fix':
                return `Fix ${escapeHtml(p.field || 'field')} on ${escapeHtml(s.tool_slug || '')}`;
            default:
                return escapeHtml(s.kind || 'unknown');
        }
    }

    // CSS class suffix for kind badge
    function kindClass(kind) {
        const map = {
            new_tool: 'new-tool',
            taxonomy_change: 'taxonomy-change',
            tool_move: 'tool-move',
            detail_fix: 'detail-fix',
        };
        return map[kind] || 'detail-fix';
    }

    function kindLabel(kind) {
        const map = {
            new_tool: 'New tool',
            taxonomy_change: 'Taxonomy',
            tool_move: 'Move',
            detail_fix: 'Fix',
        };
        return map[kind] || kind;
    }

    // ------------------------------------------------------------------ //
    // Taxonomy helpers for placement selects
    // ------------------------------------------------------------------ //

    function getTaxonomy() {
        return window.landscapeData?.taxonomy?.categories || {};
    }

    function buildTrackOptions(selectedTrack) {
        const taxonomy = getTaxonomy();
        const tracks = Object.keys(taxonomy);
        if (!tracks.length) return '<option value="">-- no tracks --</option>';
        return tracks
            .map(t => `<option value="${escapeHtml(t)}"${t === selectedTrack ? ' selected' : ''}>${escapeHtml(t)}</option>`)
            .join('');
    }

    function buildCategoryOptions(track, selectedCategory) {
        const taxonomy = getTaxonomy();
        const cats = taxonomy[track] || {};
        const entries = Object.entries(cats);
        if (!entries.length) return '<option value="">-- choose track first --</option>';
        return entries
            .map(([id, cat]) =>
                `<option value="${escapeHtml(id)}"${id === selectedCategory ? ' selected' : ''}>${escapeHtml(cat.name)}</option>`)
            .join('');
    }

    function buildSubcategoryOptions(track, category, selectedSub) {
        const taxonomy = getTaxonomy();
        const subs = taxonomy[track]?.[category]?.subcategories || {};
        const entries = Object.entries(subs);
        if (!entries.length) return '<option value="">-- choose category first --</option>';
        return entries
            .map(([id, sub]) =>
                `<option value="${escapeHtml(id)}"${id === selectedSub ? ' selected' : ''}>${escapeHtml(sub.name)}</option>`)
            .join('');
    }

    // ------------------------------------------------------------------ //
    // Queue list rendering (Task 4.3)
    // ------------------------------------------------------------------ //

    function renderQueue(suggestions) {
        const queueEl = document.getElementById('suggestions-queue');
        if (!queueEl) return;

        if (!suggestions.length) {
            queueEl.innerHTML = '<div class="empty-state"><p>No suggestions found</p></div>';
            return;
        }

        // Group suggestions by tool slug / registrable domain
        const groups = new Map(); // groupKey → [suggestion, ...]
        for (const s of suggestions) {
            const key = groupKey(s);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(s);
        }

        let html = '';
        for (const [key, rows] of groups) {
            const showHeader = key !== '__ungrouped__' && groups.size > 1;
            if (showHeader) {
                html += `<div class="suggestion-group-header">${escapeHtml(key)}</div>`;
            }
            for (const s of rows) {
                html += `
                    <div class="suggestion-row" data-id="${escapeHtml(s.id)}" role="button" tabindex="0">
                        <span class="suggestion-kind-badge ${kindClass(s.kind)}">${kindLabel(s.kind)}</span>
                        <span class="suggestion-row-summary">${oneLiner(s)}</span>
                        <span class="suggestion-row-meta">
                            <span>${escapeHtml(s.credit_name || 'anon')}</span>
                            <span>${formatRelativeDate(s.created_at)}</span>
                        </span>
                    </div>`;
            }
        }

        queueEl.innerHTML = html;

        // Click/keyboard handlers — open decision view
        queueEl.querySelectorAll('.suggestion-row').forEach(row => {
            const handler = () => {
                const id = row.dataset.id;
                const s = suggestions.find(x => x.id === id);
                if (s) openDecisionView(s, suggestions);
                // Mark active
                queueEl.querySelectorAll('.suggestion-row').forEach(r => r.classList.remove('active'));
                row.classList.add('active');
            };
            row.addEventListener('click', handler);
            row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
        });
    }

    // ------------------------------------------------------------------ //
    // Decision view (Task 4.4)
    // ------------------------------------------------------------------ //

    // Check if placement is complete (track + category + subcategory all set)
    function placementComplete(placement) {
        return placement && placement.track && placement.category && placement.subcategory;
    }

    // Validate slug pattern
    const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    function renderPayloadTable(s) {
        const p = s.payload || {};
        let rows = '';

        switch (s.kind) {
            case 'new_tool':
                rows += `<tr><th>Name</th><td>${escapeHtml(p.name)}</td></tr>`;
                rows += `<tr><th>Website</th><td><a href="${escapeHtml(p.website)}" target="_blank" rel="noreferrer noopener">${escapeHtml(p.website)}</a></td></tr>`;
                if (p.description) rows += `<tr><th>Description</th><td>${escapeHtml(p.description)}</td></tr>`;
                break;

            case 'taxonomy_change':
                rows += `<tr><th>Op</th><td>${escapeHtml(p.op)}</td></tr>`;
                if (p.details) rows += `<tr><th>Details</th><td>${escapeHtml(p.details)}</td></tr>`;
                break;

            case 'tool_move':
                if (p.from_category) rows += `<tr><th>From</th><td>${escapeHtml(p.from_category)}/${escapeHtml(p.from_subcategory)}</td></tr>`;
                rows += `<tr><th>To</th><td>${escapeHtml(p.to_track || '')}/${escapeHtml(p.to_category || '')}/${escapeHtml(p.to_subcategory || '')}</td></tr>`;
                break;

            case 'detail_fix':
                rows += `<tr><th>Field</th><td>${escapeHtml(p.field)}</td></tr>`;
                if (p.current_value !== undefined) rows += `<tr><th>Current</th><td>${escapeHtml(String(p.current_value))}</td></tr>`;
                if (p.proposed_value !== undefined) rows += `<tr><th>Proposed</th><td>${escapeHtml(String(p.proposed_value))}</td></tr>`;
                break;

            default:
                rows += `<tr><th>Payload</th><td>${escapeHtml(JSON.stringify(p))}</td></tr>`;
        }

        if (s.tool_slug) rows += `<tr><th>Tool slug</th><td>${escapeHtml(s.tool_slug)}</td></tr>`;
        rows += `<tr><th>Status</th><td>${escapeHtml(s.status)}</td></tr>`;

        return `<table class="suggestion-payload-table"><tbody>${rows}</tbody></table>`;
    }

    // Build the editable fields section for new_tool
    function renderEditFields(s) {
        if (s.kind !== 'new_tool') return '';

        const p = s.payload || {};
        const placement = p.placement || {};
        const track = placement.track || '';
        const category = placement.category || '';
        const subcategory = placement.subcategory || '';
        const slug = p.slug || '';

        return `
            <div class="suggestion-edit-fields">
                <h4>Complete before approving</h4>
                <div class="suggestion-field-row">
                    <label for="edit-track">Track</label>
                    <select id="edit-track">
                        <option value="">-- select track --</option>
                        ${buildTrackOptions(track)}
                    </select>
                </div>
                <div class="suggestion-field-row">
                    <label for="edit-category">Category</label>
                    <select id="edit-category">
                        <option value="">-- select category --</option>
                        ${track ? buildCategoryOptions(track, category) : ''}
                    </select>
                </div>
                <div class="suggestion-field-row">
                    <label for="edit-subcategory">Subcategory</label>
                    <select id="edit-subcategory">
                        <option value="">-- select subcategory --</option>
                        ${(track && category) ? buildSubcategoryOptions(track, category, subcategory) : ''}
                    </select>
                </div>
                <div class="suggestion-field-row">
                    <label for="edit-slug">Slug</label>
                    <input type="text" id="edit-slug" value="${escapeHtml(slug)}" placeholder="e.g. letta-ai">
                </div>
                <p class="suggestion-approve-hint" id="approve-hint" style="display:none">
                    Set placement and slug to approve — the apply script needs them.
                </p>
            </div>`;
    }

    function showToastExternal(message, type) {
        // Re-use the toast element if available
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast ' + (type || 'success');
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    function openDecisionView(s, allSuggestions) {
        const panel = document.getElementById('suggestion-decision');
        if (!panel) return;

        const isNewTool = s.kind === 'new_tool';
        const showMarkApplied = s.status === 'approved' && s.kind === 'taxonomy_change' && s.payload?.op === 'other';

        panel.innerHTML = `
            <div class="suggestion-decision-header">
                <h3>
                    <span class="suggestion-kind-badge ${kindClass(s.kind)}">${kindLabel(s.kind)}</span>
                    &nbsp;${oneLiner(s)}
                </h3>
                <button class="btn btn-ghost" id="decision-close" aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="suggestion-decision-body">
                ${renderPayloadTable(s)}
                ${s.rationale ? `<div class="suggestion-rationale"><strong>Rationale</strong>${escapeHtml(s.rationale)}</div>` : ''}
                ${renderEditFields(s)}
                <div class="suggestion-reject-area">
                    <label for="reject-note">Rejection note (required to reject)</label>
                    <textarea id="reject-note" rows="3" placeholder="Explain why this suggestion is not accepted…">${escapeHtml(s.admin_note || '')}</textarea>
                </div>
            </div>
            <div class="suggestion-decision-actions">
                <button class="btn btn-success" id="decision-approve" ${isNewTool ? 'disabled' : ''}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Approve
                </button>
                <button class="btn btn-warning" id="decision-reject">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Reject
                </button>
                ${showMarkApplied ? `
                <button class="btn btn-secondary" id="decision-mark-applied">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Mark as applied
                </button>` : ''}
            </div>`;

        panel.classList.remove('hidden');
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // ---- close button ----
        panel.querySelector('#decision-close').addEventListener('click', () => {
            panel.classList.add('hidden');
            panel.innerHTML = '';
            // Deactivate queue row
            document.querySelectorAll('.suggestion-row').forEach(r => r.classList.remove('active'));
        });

        const approveBtn = panel.querySelector('#decision-approve');
        const hintEl = panel.querySelector('#approve-hint');

        // ---- For new_tool: cascade selects + approve gate ----
        if (isNewTool) {
            const trackSel = panel.querySelector('#edit-track');
            const catSel = panel.querySelector('#edit-category');
            const subSel = panel.querySelector('#edit-subcategory');
            const slugInput = panel.querySelector('#edit-slug');

            function checkApproveGate() {
                const track = trackSel.value;
                const cat = catSel.value;
                const sub = subSel.value;
                const slug = slugInput.value.trim();
                const placementOk = track && cat && sub;
                const slugOk = SLUG_RE.test(slug);
                const allOk = placementOk && slugOk;
                approveBtn.disabled = !allOk;
                if (hintEl) hintEl.style.display = allOk ? 'none' : '';
            }

            // Track change → refresh category options
            trackSel.addEventListener('change', () => {
                const track = trackSel.value;
                catSel.innerHTML = '<option value="">-- select category --</option>' + (track ? buildCategoryOptions(track, '') : '');
                subSel.innerHTML = '<option value="">-- select subcategory --</option>';
                checkApproveGate();
            });

            // Category change → refresh subcategory options
            catSel.addEventListener('change', () => {
                const track = trackSel.value;
                const cat = catSel.value;
                subSel.innerHTML = '<option value="">-- select subcategory --</option>' + ((track && cat) ? buildSubcategoryOptions(track, cat, '') : '');
                checkApproveGate();
            });

            subSel.addEventListener('change', checkApproveGate);
            slugInput.addEventListener('input', checkApproveGate);

            // Run gate immediately (for pre-filled values)
            checkApproveGate();

            // Approve handler: collect edited payload
            approveBtn.addEventListener('click', async () => {
                approveBtn.disabled = true;
                const editedPayload = Object.assign({}, s.payload, {
                    slug: panel.querySelector('#edit-slug').value.trim(),
                    placement: {
                        track: trackSel.value,
                        category: catSel.value,
                        subcategory: subSel.value,
                    },
                });
                const result = await window.AdminAPI.approveSuggestion(s.id, editedPayload);
                if (result.success) {
                    showToastExternal('Suggestion approved');
                    panel.classList.add('hidden');
                    panel.innerHTML = '';
                    loadSuggestions();
                } else {
                    showToastExternal(result.error || 'Failed to approve', 'error');
                    approveBtn.disabled = false;
                }
            });
        } else {
            // Non-new_tool: approve without payload patch
            approveBtn.addEventListener('click', async () => {
                approveBtn.disabled = true;
                const result = await window.AdminAPI.approveSuggestion(s.id, null);
                if (result.success) {
                    showToastExternal('Suggestion approved');
                    panel.classList.add('hidden');
                    panel.innerHTML = '';
                    loadSuggestions();
                } else {
                    showToastExternal(result.error || 'Failed to approve', 'error');
                    approveBtn.disabled = false;
                }
            });
        }

        // ---- Reject handler ----
        panel.querySelector('#decision-reject').addEventListener('click', async () => {
            const note = panel.querySelector('#reject-note').value.trim();
            if (!note) {
                showToastExternal('A rejection note is required', 'error');
                panel.querySelector('#reject-note').focus();
                return;
            }
            const rejectBtn = panel.querySelector('#decision-reject');
            rejectBtn.disabled = true;
            const result = await window.AdminAPI.rejectSuggestion(s.id, note);
            if (result.success) {
                showToastExternal('Suggestion rejected');
                panel.classList.add('hidden');
                panel.innerHTML = '';
                loadSuggestions();
            } else {
                showToastExternal(result.error || 'Failed to reject', 'error');
                rejectBtn.disabled = false;
            }
        });

        // ---- Mark as applied handler (op:other only) ----
        const markAppliedBtn = panel.querySelector('#decision-mark-applied');
        if (markAppliedBtn) {
            markAppliedBtn.addEventListener('click', async () => {
                markAppliedBtn.disabled = true;
                const result = await window.AdminAPI.markSuggestionApplied(s.id);
                if (result.success) {
                    showToastExternal('Marked as applied');
                    panel.classList.add('hidden');
                    panel.innerHTML = '';
                    loadSuggestions();
                } else {
                    showToastExternal(result.error || 'Failed to mark applied', 'error');
                    markAppliedBtn.disabled = false;
                }
            });
        }
    }

    // ------------------------------------------------------------------ //
    // loadSuggestions — reads filters, calls API, renders
    // ------------------------------------------------------------------ //

    async function loadSuggestions() {
        const queueEl = document.getElementById('suggestions-queue');
        if (!queueEl) return;

        const kindFilter = document.getElementById('suggestions-kind-filter');
        const statusFilter = document.getElementById('suggestions-status-filter');
        const kind = kindFilter ? kindFilter.value : 'all';
        const status = statusFilter ? statusFilter.value : 'pending';

        queueEl.innerHTML = '<div class="loading-inline"><div class="spinner-small"></div><span>Loading suggestions...</span></div>';

        // Close any open decision panel when reloading
        const panel = document.getElementById('suggestion-decision');
        if (panel) { panel.classList.add('hidden'); panel.innerHTML = ''; }

        const result = await window.AdminAPI.getSuggestions(status, kind);

        if (result.error) {
            queueEl.innerHTML = `<div class="empty-state"><p>Error: ${escapeHtml(result.error)}</p></div>`;
            return;
        }

        renderQueue(result.suggestions || []);
    }

    // ---- Wire filter changes ----
    function initFilterListeners() {
        const kindFilter = document.getElementById('suggestions-kind-filter');
        const statusFilter = document.getElementById('suggestions-status-filter');
        if (kindFilter) kindFilter.addEventListener('change', loadSuggestions);
        if (statusFilter) statusFilter.addEventListener('change', loadSuggestions);
    }

    // Call once the DOM is ready (called from admin.html switchView, which runs after DOMContentLoaded)
    function init() {
        initFilterListeners();
    }

    // Auto-init if DOM already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ------------------------------------------------------------------ //
    // Public API
    // ------------------------------------------------------------------ //
    window.AdminSuggestions = {
        loadSuggestions,
        openDecisionView,
    };
})();
