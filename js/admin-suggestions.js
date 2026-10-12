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

    // Sanitize a user-submitted URL: only allow http: and https: protocols.
    // Returns '#' for javascript:, data:, or any other unsafe/unparseable URL.
    function safeUrl(raw) {
        if (!raw) return '#';
        try {
            const u = new URL(raw);
            return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : '#';
        } catch (_) {
            return '#';
        }
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
            case 'tool_placement': {
                const prop = p.proposed || {};
                return `Move ${escapeHtml(s.tool_slug || '')} → ${escapeHtml(prop.category || '')}/${escapeHtml(prop.subcategory || '')}`;
            }
            case 'tool_edit': {
                const fields = Object.keys(p.changes || {}).join(', ') || 'details';
                return `Fix ${escapeHtml(fields)} on ${escapeHtml(s.tool_slug || '')}`;
            }
            default:
                return escapeHtml(s.kind || 'unknown');
        }
    }

    // CSS class suffix for kind badge
    function kindClass(kind) {
        const map = {
            new_tool: 'new-tool',
            taxonomy_change: 'taxonomy-change',
            tool_placement: 'tool-placement',
            tool_edit: 'tool-edit',
        };
        return map[kind] || 'tool-edit';
    }

    function kindLabel(kind) {
        const map = {
            new_tool: 'New tool',
            taxonomy_change: 'Taxonomy',
            tool_placement: 'Tool Placement',
            tool_edit: 'Tool Edit',
        };
        return map[kind] || kind;
    }

    // ------------------------------------------------------------------ //
    // Taxonomy helpers for placement selects
    // ------------------------------------------------------------------ //

    function getTaxonomy() {
        return window.landscapeData?.taxonomy?.categories || {};
    }

    // ------------------------------------------------------------------ //
    // Tool page lookup for new_tool approvals
    // ------------------------------------------------------------------ //
    // A new_tool is approved only after /tool-page-content created its page,
    // so slug and placement come from that page (js/data.js), never from admin
    // input. A typed slug that didn't match the real page sent the submitter a
    // 404 link in the approval email.

    function allToolPages() {
        const data = window.landscapeData || {};
        const pages = [];
        for (const track of Object.keys(getTaxonomy())) {
            for (const cat of data[track] || []) {
                for (const sub of cat.subcategories || []) {
                    for (const tool of sub.tools || []) pages.push({ track, tool });
                }
            }
        }
        return pages;
    }

    function parseUrl(raw) {
        try { return new URL(raw); } catch (_) { return null; }
    }

    function hostOf(u) {
        return u.hostname.toLowerCase().replace(/^www\./, '');
    }

    function normalizedUrl(u) {
        return hostOf(u) + u.pathname.toLowerCase().replace(/\/+$/, '');
    }

    function slugify(text) {
        return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // Candidate pages for a new_tool suggestion: exact URL, then same domain
    // (only for a homepage URL or a single-tool domain, since e.g. github.com
    // hosts dozens of tools), then same name. Ties are broken by the submitted
    // slug or name; anything still ambiguous is left for the admin to pick.
    function findToolPages(s) {
        const p = s.payload || {};
        const pages = allToolPages();
        const site = parseUrl(p.website);
        let found = [];
        if (site) {
            const withUrl = pages.map(e => ({ e, u: parseUrl(e.tool.url) })).filter(x => x.u);
            found = withUrl.filter(x => normalizedUrl(x.u) === normalizedUrl(site)).map(x => x.e);
            if (!found.length) {
                const sameHost = withUrl.filter(x => hostOf(x.u) === hostOf(site)).map(x => x.e);
                const isHomepage = site.pathname.replace(/\/+$/, '') === '';
                if (isHomepage || sameHost.length === 1) found = sameHost;
            }
        }
        if (!found.length && p.name) {
            const name = String(p.name).toLowerCase();
            found = pages.filter(e => e.tool.slug === slugify(p.name) || e.tool.name.toLowerCase() === name);
        }
        if (found.length > 1) {
            const wanted = [p.slug, slugify(p.name)].filter(Boolean);
            const exact = found.filter(e => wanted.includes(e.tool.slug));
            if (exact.length === 1) return exact;
        }
        return found;
    }

    function placementLabel(page) {
        const t = page.tool;
        return `${page.track} › ${t.category_name || t.category_id} › ${t.subcategory_name || t.subcategory_id}`;
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

    function renderPayloadTable(s) {
        const p = s.payload || {};
        let rows = '';

        switch (s.kind) {
            case 'new_tool':
                rows += `<tr><th>Name</th><td>${escapeHtml(p.name)}</td></tr>`;
                rows += `<tr><th>Website</th><td><a href="${escapeHtml(safeUrl(p.website))}" target="_blank" rel="noreferrer noopener">${escapeHtml(p.website)}</a></td></tr>`;
                if (p.description) rows += `<tr><th>Description</th><td>${escapeHtml(p.description)}</td></tr>`;
                break;

            case 'taxonomy_change':
                rows += `<tr><th>Op</th><td>${escapeHtml(p.op)}</td></tr>`;
                if (p.details) rows += `<tr><th>Details</th><td>${escapeHtml(p.details)}</td></tr>`;
                break;

            case 'tool_placement': {
                // payload = { current: {category, subcategory}, proposed: {category, subcategory, tags_add, tags_remove} }
                const cur = p.current || {}, prop = p.proposed || {};
                if (cur.category) rows += `<tr><th>From</th><td>${escapeHtml(cur.category)}/${escapeHtml(cur.subcategory || '')}</td></tr>`;
                rows += `<tr><th>To</th><td>${escapeHtml(prop.category || '')}/${escapeHtml(prop.subcategory || '')}</td></tr>`;
                if (prop.tags_add?.length) rows += `<tr><th>Tags +</th><td>${escapeHtml(prop.tags_add.join(', '))}</td></tr>`;
                if (prop.tags_remove?.length) rows += `<tr><th>Tags −</th><td>${escapeHtml(prop.tags_remove.join(', '))}</td></tr>`;
                break;
            }

            case 'tool_edit':
                // payload = { changes: { field: { from, to } } }
                for (const [field, change] of Object.entries(p.changes || {})) {
                    rows += `<tr><th>${escapeHtml(field)}</th><td>${escapeHtml(String(change?.from ?? ''))} → ${escapeHtml(String(change?.to ?? ''))}</td></tr>`;
                }
                break;

            default:
                rows += `<tr><th>Payload</th><td>${escapeHtml(JSON.stringify(p))}</td></tr>`;
        }

        if (s.tool_slug) rows += `<tr><th>Tool slug</th><td>${escapeHtml(s.tool_slug)}</td></tr>`;
        rows += `<tr><th>Status</th><td>${escapeHtml(s.status)}</td></tr>`;

        return `<table class="suggestion-payload-table"><tbody>${rows}</tbody></table>`;
    }

    // Tool page section for new_tool: shows the page approval will link to.
    function renderToolPageFields(s, pages) {
        if (s.kind !== 'new_tool') return '';

        if (!pages.length) {
            return `
            <div class="suggestion-edit-fields">
                <h4>Tool page</h4>
                <p class="suggestion-approve-hint" id="tool-page-missing">
                    No tool page found for ${escapeHtml(s.payload?.website || s.payload?.name || 'this tool')}.
                    Create it with /tool-page-content and deploy, then reload this page to approve.
                </p>
            </div>`;
        }

        const picker = pages.length > 1 ? `
                <div class="suggestion-field-row">
                    <label for="tool-page-pick">Page</label>
                    <select id="tool-page-pick">
                        <option value="">-- pick the page --</option>
                        ${pages.map(e => `<option value="${escapeHtml(e.tool.slug)}">${escapeHtml(e.tool.name)} (${escapeHtml(e.tool.slug)})</option>`).join('')}
                    </select>
                </div>
                <p class="suggestion-approve-hint">Several pages match this website. Pick the one for this suggestion.</p>` : '';

        return `
            <div class="suggestion-edit-fields">
                <h4>Tool page</h4>
                ${picker}
                <div class="suggestion-field-row" id="tool-page-details"${pages.length > 1 ? ' hidden' : ''}>
                    <label>Link</label>
                    <a id="tool-page-link" href="${pages.length === 1 ? `/tools/${escapeHtml(pages[0].tool.slug)}/` : '#'}" target="_blank" rel="noopener">${pages.length === 1 ? `/tools/${escapeHtml(pages[0].tool.slug)}/` : ''}</a>
                </div>
                <div class="suggestion-field-row"${pages.length > 1 ? ' hidden' : ''} id="tool-page-placement-row">
                    <label>Placement</label>
                    <span id="tool-page-placement">${pages.length === 1 ? escapeHtml(placementLabel(pages[0])) : ''}</span>
                </div>
            </div>`;
    }

    // ------------------------------------------------------------------ //
    // Rejection note templates
    // ------------------------------------------------------------------ //

    // The note is only the reason. The decision email (decision-email.ts) already
    // adds the greeting, "Thank you for suggesting <tool>... not able to add it",
    // the resubmit link, "just reply" and the sign-off, so templates must not repeat
    // any of those (no "resubmit", no "not adding", no leading tool name for new tools).
    //
    // kinds: which suggestion kinds the template applies to (null = all).
    // body: the reason plus the next step. invite (optional): one extra line asking for more.
    // Placeholders: {tool} tool name/slug, {website} submitted URL.
    const REJECT_TEMPLATES = [
        {
            id: 'site-down', label: 'Website not accessible', kinds: ['new_tool'],
            body: 'We tried {website}, but the request timed out. Is the site still online?',
        },
        {
            id: 'already-listed', label: 'Already listed', kinds: ['new_tool'],
            body: 'It is already listed on AI Tool Review. If its page is missing anything, an edit suggestion there would help a lot.',
        },
        {
            id: 'out-of-scope', label: 'Not an AI tool / out of scope', kinds: ['new_tool'],
            body: 'It is outside our focus on AI tools for building and running software.',
            invite: 'Know other AI dev tools we are missing? Send them our way.',
        },
        {
            id: 'too-early', label: 'Too early / no public product', kinds: ['new_tool'],
            body: 'We could not find a public product to try yet.',
        },
        {
            id: 'placement-fits', label: 'Current placement fits better', kinds: ['tool_placement'],
            body: 'We think {tool}\'s current category still fits how most people use it, so we are keeping it there for now.',
        },
        {
            id: 'edit-unverified', label: 'Could not verify the change', kinds: ['tool_edit'],
            body: 'We could not confirm this from {tool}\'s official site or docs. A source link would help.',
        },
        {
            id: 'edit-already-correct', label: 'Info is already correct', kinds: ['tool_edit'],
            body: '{tool}\'s official sources match what the page says, so we are leaving it as is.',
            invite: 'Used {tool} yourself? A short review would help other people a lot.',
        },
        {
            id: 'taxonomy-no-fit', label: 'Does not fit the taxonomy', kinds: ['taxonomy_change'],
            body: 'This overlaps with existing categories, so we are keeping the structure as is for now.',
            invite: 'Other ideas for organizing the landscape? We want to hear them.',
        },
        {
            id: 'duplicate-suggestion', label: 'Duplicate suggestion', kinds: null,
            body: 'Someone already sent this in, so we are tracking it there.',
        },
        {
            id: 'need-info', label: 'Not enough information', kinds: null,
            body: 'We need more details or a source link to act on this.',
        },
    ];

    function templatesForKind(kind) {
        return REJECT_TEMPLATES.filter(t => !t.kinds || t.kinds.includes(kind));
    }

    function fillTemplate(template, s) {
        const p = s.payload || {};
        const vars = {
            tool: p.name || s.tool_slug || 'this tool',
            website: p.website || 'the website',
        };
        const fill = text => text.replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
        return [template.body, template.invite].filter(Boolean).map(fill).join(' ');
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
        const toolPages = isNewTool ? findToolPages(s) : [];
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
                ${renderToolPageFields(s, toolPages)}
                <div class="suggestion-reject-area">
                    <label for="reject-note">Rejection note (required to reject)</label>
                    <select id="reject-template" class="suggestion-reject-template" aria-label="Rejection note template">
                        <option value="">Use a template…</option>
                        ${templatesForKind(s.kind).map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.label)}</option>`).join('')}
                    </select>
                    <textarea id="reject-note" rows="6" placeholder="Explain why this suggestion is not accepted…">${escapeHtml(s.admin_note || '')}</textarea>
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

        // ---- For new_tool: approve links the existing tool page ----
        if (isNewTool) {
            const picker = panel.querySelector('#tool-page-pick');
            let chosen = toolPages.length === 1 ? toolPages[0] : null;
            approveBtn.disabled = !chosen;

            if (picker) {
                picker.addEventListener('change', () => {
                    chosen = toolPages.find(e => e.tool.slug === picker.value) || null;
                    const link = panel.querySelector('#tool-page-link');
                    link.href = chosen ? `/tools/${chosen.tool.slug}/` : '#';
                    link.textContent = chosen ? `/tools/${chosen.tool.slug}/` : '';
                    panel.querySelector('#tool-page-placement').textContent = chosen ? placementLabel(chosen) : '';
                    panel.querySelector('#tool-page-details').hidden = !chosen;
                    panel.querySelector('#tool-page-placement-row').hidden = !chosen;
                    approveBtn.disabled = !chosen;
                });
            }

            approveBtn.addEventListener('click', async () => {
                if (!chosen) return;
                approveBtn.disabled = true;
                const editedPayload = Object.assign({}, s.payload, {
                    slug: chosen.tool.slug,
                    placement: {
                        track: chosen.track,
                        category: chosen.tool.category_id,
                        subcategory: chosen.tool.subcategory_id,
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

        // ---- Rejection template picker ----
        const templateSel = panel.querySelector('#reject-template');
        const noteEl = panel.querySelector('#reject-note');
        templateSel.addEventListener('change', () => {
            const template = REJECT_TEMPLATES.find(t => t.id === templateSel.value);
            if (!template) return;
            if (noteEl.value.trim() && !confirm('Replace the current rejection note with this template?')) {
                templateSel.value = '';
                return;
            }
            noteEl.value = fillTemplate(template, s);
            noteEl.focus();
        });

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
