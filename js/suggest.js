// Community Suggestions Modal
// ============================
// window.Suggest = { open, close }
// Modes: 'add' | 'taxonomy' | 'tool' | 'edit'
// 'edit' is a Phase-5 hook — no-ops for now.
// Depends on: window.SuggestLogic, window.SupabaseClient, window.AuthSignIn
// Optional (populated on landscape page): window.landscapeData

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [role="radio"]'
      )
    ).filter(el => !el.closest('[hidden]') && getComputedStyle(el).display !== 'none');
  }

  // ---------------------------------------------------------------------------
  // Module state
  // ---------------------------------------------------------------------------

  let overlay = null;
  let triggerEl = null;
  let trapHandler = null;
  let escHandler = null;

  // ---------------------------------------------------------------------------
  // Focus trap
  // ---------------------------------------------------------------------------

  function installTrap(modal) {
    if (trapHandler) document.removeEventListener('keydown', trapHandler);
    trapHandler = function (e) {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(modal);
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', trapHandler);
  }

  function removeTrap() {
    if (trapHandler) { document.removeEventListener('keydown', trapHandler); trapHandler = null; }
  }

  // ---------------------------------------------------------------------------
  // Build / destroy overlay
  // ---------------------------------------------------------------------------

  function buildOverlay(titleText, bodyHtml) {
    const el = document.createElement('div');
    el.className = 'suggest-modal-overlay';
    el.innerHTML = `
      <div class="suggest-modal"
           role="dialog"
           aria-modal="true"
           aria-labelledby="suggest-modal-title">
        <div class="suggest-modal-header">
          <h2 class="suggest-modal-title" id="suggest-modal-title">${escapeHtml(titleText)}</h2>
          <button class="suggest-modal-close" aria-label="Close suggestion dialog" type="button">&times;</button>
        </div>
        <div class="suggest-modal-body">
          ${bodyHtml}
        </div>
      </div>
    `;
    return el;
  }

  function destroyOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
    removeTrap();
    if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
  }

  // ---------------------------------------------------------------------------
  // close()
  // ---------------------------------------------------------------------------

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    const modal = overlay.querySelector('.suggest-modal');
    if (modal) {
      modal.addEventListener('transitionend', destroyOverlay, { once: true });
      // Fallback in case no transition fires (reduced-motion)
      setTimeout(destroyOverlay, 250);
    } else {
      destroyOverlay();
    }
    if (triggerEl) {
      triggerEl.focus();
      triggerEl = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Attach close handlers (Escape + backdrop click + X button)
  // ---------------------------------------------------------------------------

  function attachCloseHandlers(ol) {
    // Escape
    escHandler = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', escHandler);

    // Backdrop click (click on overlay but not inside .suggest-modal)
    ol.addEventListener('click', function (e) {
      if (!e.target.closest('.suggest-modal')) close();
    });

    // Close button
    const closeBtn = ol.querySelector('.suggest-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
  }

  // ---------------------------------------------------------------------------
  // Mount overlay and open
  // ---------------------------------------------------------------------------

  function mountAndOpen(titleText, bodyHtml) {
    destroyOverlay(); // remove any previous instance
    overlay = buildOverlay(titleText, bodyHtml);
    document.body.appendChild(overlay);

    const modal = overlay.querySelector('.suggest-modal');
    attachCloseHandlers(overlay);
    installTrap(modal);

    // Trigger open animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('is-open'));
    });

    // Move focus into modal (first focusable, or the close button)
    const firstFocusable = getFocusable(modal)[0] || modal.querySelector('.suggest-modal-close');
    if (firstFocusable) firstFocusable.focus();

    return modal;
  }

  // ---------------------------------------------------------------------------
  // Auth gate (signed-out state)
  // ---------------------------------------------------------------------------

  function renderAuthGate() {
    const card = window.AuthSignIn
      ? window.AuthSignIn.renderCard({
          title: 'Sign in to suggest',
          description: 'Create an account or sign in to suggest new tools and improvements.'
        })
      : '<p>Please sign in to continue.</p>';
    return `<div class="suggest-auth-gate">${card}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Mode chooser: add (Form A / Form B stub)
  // ---------------------------------------------------------------------------

  function renderAddChooser() {
    return `
      <div class="suggest-chooser">
        <p class="suggest-chooser-label">What would you like to suggest?</p>
        <div class="suggest-radio-group"
             role="radiogroup"
             aria-label="Suggestion type">
          <div class="suggest-radio-card"
               role="radio"
               aria-checked="false"
               tabindex="0"
               data-mode="new-tool">
            <span class="suggest-radio-card-title">Add a missing tool</span>
            <p class="suggest-radio-card-desc">Know a tool that isn't on the landscape yet? Submit it for review.</p>
          </div>
          <div class="suggest-radio-card"
               role="radio"
               aria-checked="false"
               tabindex="-1"
               data-mode="taxonomy">
            <span class="suggest-radio-card-title">Improve the taxonomy</span>
            <p class="suggest-radio-card-desc">Suggest a new category, subcategory, or tag — or rename an existing one.</p>
          </div>
        </div>
        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-chooser-cancel">Cancel</button>
          <button class="suggest-btn suggest-btn-primary" type="button" id="suggest-chooser-next" disabled>Next</button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Mode chooser: tool (Form C / Form D stubs)
  // ---------------------------------------------------------------------------

  function renderToolChooser(tool) {
    const toolName = tool ? escapeHtml(tool.name) : 'this tool';
    return `
      <div class="suggest-chooser">
        <p class="suggest-chooser-label">What would you like to change for <strong>${toolName}</strong>?</p>
        <div class="suggest-radio-group"
             role="radiogroup"
             aria-label="Suggestion type">
          <div class="suggest-radio-card"
               role="radio"
               aria-checked="false"
               tabindex="0"
               data-mode="move-retag">
            <span class="suggest-radio-card-title">Move or re-tag</span>
            <p class="suggest-radio-card-desc">Suggest a different category, subcategory, or tags for this tool.</p>
          </div>
          <div class="suggest-radio-card"
               role="radio"
               aria-checked="false"
               tabindex="-1"
               data-mode="fix-details">
            <span class="suggest-radio-card-title">Fix details</span>
            <p class="suggest-radio-card-desc">Correct the description, website, pricing, or other factual fields.</p>
          </div>
        </div>
        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-chooser-cancel">Cancel</button>
          <button class="suggest-btn suggest-btn-primary" type="button" id="suggest-chooser-next" disabled>Next</button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Wire chooser radio-group behaviour (arrow keys, Enter/Space, aria-checked)
  // ---------------------------------------------------------------------------

  function wireChooser(modal, onNext) {
    const group = modal.querySelector('.suggest-radio-group');
    const nextBtn = modal.querySelector('#suggest-chooser-next');
    const cancelBtn = modal.querySelector('#suggest-chooser-cancel');
    if (!group) return;

    const cards = Array.from(group.querySelectorAll('.suggest-radio-card'));
    let selectedMode = null;

    function selectCard(card) {
      cards.forEach(c => {
        c.setAttribute('aria-checked', 'false');
        c.setAttribute('tabindex', '-1');
      });
      card.setAttribute('aria-checked', 'true');
      card.setAttribute('tabindex', '0');
      selectedMode = card.dataset.mode;
      if (nextBtn) nextBtn.disabled = false;
    }

    cards.forEach(card => {
      card.addEventListener('click', () => selectCard(card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard(card);
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const idx = cards.indexOf(card);
          const next = cards[(idx + 1) % cards.length];
          selectCard(next);
          next.focus();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = cards.indexOf(card);
          const prev = cards[(idx - 1 + cards.length) % cards.length];
          selectCard(prev);
          prev.focus();
        }
      });
    });

    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (nextBtn) nextBtn.addEventListener('click', () => { if (selectedMode) onNext(selectedMode); });
  }

  // ---------------------------------------------------------------------------
  // Collapsible section helper
  // ---------------------------------------------------------------------------

  function wireCollapsible(modal) {
    modal.querySelectorAll('.suggest-collapsible-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        const body = trigger.nextElementSibling;
        if (body) body.classList.toggle('is-open', !expanded);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Form A — New Tool
  // ---------------------------------------------------------------------------

  function renderPlacementSection(taxonomy) {
    if (!taxonomy || !taxonomy.categories) {
      return `<p class="suggest-hint">Taxonomy data not available — you can still submit without placement.</p>`;
    }

    // Track select
    let trackOpts = '<option value="">Select a track…</option>';
    trackOpts += '<option value="users">For Users</option>';
    trackOpts += '<option value="developers">For Developers</option>';

    return `
      <div class="suggest-form-group">
        <label for="suggest-track">Track</label>
        <select class="suggest-select" id="suggest-track" name="track">
          ${trackOpts}
        </select>
      </div>
      <div class="suggest-form-group" id="suggest-category-group" hidden>
        <label for="suggest-category">Category</label>
        <select class="suggest-select" id="suggest-category" name="category">
          <option value="">Select a category…</option>
        </select>
      </div>
      <div class="suggest-form-group" id="suggest-subcategory-group" hidden>
        <label for="suggest-subcategory">Subcategory</label>
        <select class="suggest-select" id="suggest-subcategory" name="subcategory">
          <option value="">Select a subcategory…</option>
        </select>
      </div>

      <p class="suggest-placement-helper">
        <strong>Subcategory vs Tags:</strong> subcategory is where the tool <em>lives</em> in the taxonomy
        (pick the best fit). Tags describe cross-cutting traits (e.g. "self-hosted", "api-available") — add as many as apply.
      </p>

      <div id="suggest-tag-groups"></div>

      <div class="suggest-form-group">
        <label for="suggest-type">Type</label>
        <select class="suggest-select" id="suggest-type" name="type">
          <option value="">Unknown</option>
          <option value="oss">Open Source</option>
          <option value="saas">SaaS / Managed</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>
      <div class="suggest-form-group">
        <label for="suggest-pricing-model">Pricing Model</label>
        <select class="suggest-select" id="suggest-pricing-model" name="pricing_model">
          <option value="">Unknown</option>
          <option value="free">Free</option>
          <option value="freemium">Freemium</option>
          <option value="paid">Paid</option>
          <option value="open-source">Open Source</option>
        </select>
      </div>
      <div class="suggest-form-group">
        <label for="suggest-notes">Additional notes</label>
        <textarea class="suggest-textarea" id="suggest-notes" name="notes"
                  placeholder="Anything else the reviewers should know…" maxlength="1000"></textarea>
      </div>
    `;
  }

  function renderTagGroups(taxonomy) {
    if (!taxonomy || !taxonomy.tags) return '';
    const families = { capabilities: 'Capabilities', integrations: 'Integrations', deployment: 'Deployment', 'use-cases': 'Use Cases' };
    let html = '';
    for (const [family, label] of Object.entries(families)) {
      const tags = taxonomy.tags[family];
      if (!tags || !tags.length) continue;
      html += `
        <div class="suggest-tag-group">
          <div class="suggest-tag-family-label">${escapeHtml(label)}</div>
          <div class="suggest-tag-grid">
            ${tags.map(t => `
              <label class="suggest-tag-chip">
                <input type="checkbox" name="tag" value="${escapeHtml(t.slug)}" title="${escapeHtml(t.description || t.name)}">
                ${escapeHtml(t.name)}
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }
    return html;
  }

  function renderCreditConsent(user) {
    const rawName = (user && (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0])) || '';
    const safeName = escapeHtml(rawName.slice(0, 40));
    return `
      <div class="suggest-credit-block">
        <div class="suggest-credit-row">
          <input type="checkbox" id="suggest-public-credit" name="public_credit" checked>
          <label for="suggest-public-credit">Credit me publicly as</label>
        </div>
        <div class="suggest-credit-name-field" id="suggest-credit-name-wrapper">
          <label for="suggest-credit-name">Display name (shown on the site)</label>
          <input class="suggest-input" type="text" id="suggest-credit-name" name="credit_name"
                 value="${safeName}" maxlength="40"
                 placeholder="Your name (max 40 chars)">
        </div>
        <p class="suggest-credit-disclosure">
          If approved, your name may appear permanently on the tool page as the contributor who suggested it.
        </p>
      </div>
    `;
  }

  function renderNewToolForm(user, taxonomy) {
    return `
      <form class="suggest-form" id="suggest-new-tool-form" novalidate>
        <div id="suggest-form-error" class="suggest-error" hidden></div>

        <div class="suggest-form-group">
          <label for="suggest-name">Tool name <span class="required">*</span></label>
          <input class="suggest-input" type="text" id="suggest-name" name="name"
                 required maxlength="100" placeholder="e.g. Letta AI" autocomplete="off">
          <div id="suggest-dup-warning" class="suggest-dup-warning" hidden></div>
        </div>

        <div class="suggest-form-group">
          <label for="suggest-website">Website <span class="required">*</span></label>
          <input class="suggest-input" type="url" id="suggest-website" name="website"
                 required placeholder="https://example.com" autocomplete="off">
        </div>

        <div class="suggest-form-group">
          <label for="suggest-slug">Slug (URL identifier) <span class="required">*</span></label>
          <input class="suggest-input" type="text" id="suggest-slug" name="slug"
                 required pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                 placeholder="auto-derived from name" autocomplete="off">
          <div class="suggest-hint">Lowercase letters and hyphens only. Pattern: <code>^[a-z0-9]+(-[a-z0-9]+)*$</code></div>
        </div>

        <div class="suggest-form-group">
          <label for="suggest-description">One-line description <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="suggest-description" name="description"
                    required minlength="10" maxlength="300"
                    placeholder="What does this tool do? Be specific and concise."></textarea>
          <div class="suggest-hint">10–300 characters</div>
        </div>

        <div class="suggest-form-group">
          <label for="suggest-rationale">Why should it be added? (optional)</label>
          <textarea class="suggest-textarea" id="suggest-rationale" name="rationale"
                    maxlength="500"
                    placeholder="Any context, use-cases, or why it's a good fit for the landscape…"></textarea>
        </div>

        <div class="suggest-collapsible" id="suggest-placement-collapsible">
          <button class="suggest-collapsible-trigger"
                  type="button"
                  aria-expanded="false"
                  aria-controls="suggest-placement-body">
            Help us place it (optional)
            <span class="chevron" aria-hidden="true">▼</span>
          </button>
          <div class="suggest-collapsible-body" id="suggest-placement-body">
            ${renderPlacementSection(taxonomy)}
            ${renderTagGroups(taxonomy)}
          </div>
        </div>

        ${renderCreditConsent(user)}

        <div class="suggest-form-actions">
          <button class="suggest-btn" type="button" id="suggest-form-cancel">Cancel</button>
          <button class="suggest-btn suggest-btn-primary" type="submit" id="suggest-form-submit">Submit suggestion</button>
        </div>
      </form>
    `;
  }

  // ---------------------------------------------------------------------------
  // Wire Form A interactions
  // ---------------------------------------------------------------------------

  function wirePlacementCascade(modal, taxonomy) {
    const trackSel = modal.querySelector('#suggest-track');
    const catGroup = modal.querySelector('#suggest-category-group');
    const catSel = modal.querySelector('#suggest-category');
    const subGroup = modal.querySelector('#suggest-subcategory-group');
    const subSel = modal.querySelector('#suggest-subcategory');
    const tagGroupsEl = modal.querySelector('#suggest-tag-groups');

    if (!trackSel || !taxonomy || !taxonomy.categories) return;

    // Populate tag groups once (they don't depend on track)
    if (tagGroupsEl) tagGroupsEl.innerHTML = renderTagGroups(taxonomy);

    trackSel.addEventListener('change', () => {
      const track = trackSel.value;
      catSel.innerHTML = '<option value="">Select a category…</option>';
      subSel.innerHTML = '<option value="">Select a subcategory…</option>';
      subGroup.hidden = true;

      if (!track || !taxonomy.categories[track]) {
        catGroup.hidden = true;
        return;
      }
      const cats = taxonomy.categories[track];
      Object.entries(cats).forEach(([id, cat]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = cat.name + (cat.description ? ` — ${cat.description}` : '');
        catSel.appendChild(opt);
      });
      catGroup.hidden = false;
    });

    catSel.addEventListener('change', () => {
      const track = trackSel.value;
      const catId = catSel.value;
      subSel.innerHTML = '<option value="">Select a subcategory…</option>';

      if (!catId || !taxonomy.categories[track] || !taxonomy.categories[track][catId]) {
        subGroup.hidden = true;
        return;
      }
      const subs = taxonomy.categories[track][catId].subcategories || {};
      Object.entries(subs).forEach(([id, sub]) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = sub.name + (sub.description ? ` — ${sub.description}` : '');
        subSel.appendChild(opt);
      });
      subGroup.hidden = false;
    });
  }

  function wireDuplicateCheck(modal, taxonomy) {
    const nameInput = modal.querySelector('#suggest-name');
    const slugInput = modal.querySelector('#suggest-slug');
    const websiteInput = modal.querySelector('#suggest-website');
    const dupWarning = modal.querySelector('#suggest-dup-warning');

    if (!nameInput) return;

    let dupTimer = null;

    function checkDuplicates() {
      clearTimeout(dupTimer);
      dupTimer = setTimeout(() => {
        if (!window.SuggestLogic || !window.landscapeData) return;
        const name = nameInput.value.trim();
        const website = websiteInput ? websiteInput.value.trim() : '';
        if (!name && !website) { dupWarning.hidden = true; return; }
        const dups = window.SuggestLogic.findDuplicates({ name, website }, window.landscapeData);
        if (dups.length === 0) {
          dupWarning.hidden = true;
        } else {
          const links = dups.map(t =>
            `<a href="/tools/${escapeHtml(t.slug)}/" target="_blank" rel="noopener">${escapeHtml(t.name)}</a>`
          ).join(', ');
          dupWarning.innerHTML = `<strong>Possible match found:</strong> ${links} — please check if this tool is already listed before submitting.`;
          dupWarning.hidden = false;
        }
      }, 400);
    }

    nameInput.addEventListener('input', () => {
      // Auto-derive slug
      if (window.SuggestLogic && slugInput) {
        const derived = window.SuggestLogic.slugify(nameInput.value);
        slugInput.value = derived;
      }
      checkDuplicates();
    });

    if (websiteInput) websiteInput.addEventListener('input', checkDuplicates);

    // Slug pattern validation feedback
    if (slugInput) {
      slugInput.addEventListener('input', () => {
        const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        if (slugInput.value && !pattern.test(slugInput.value)) {
          slugInput.setCustomValidity('Only lowercase letters and hyphens (e.g. my-tool-name)');
        } else {
          slugInput.setCustomValidity('');
        }
      });
    }
  }

  function wireCreditConsent(modal) {
    const checkbox = modal.querySelector('#suggest-public-credit');
    const nameWrapper = modal.querySelector('#suggest-credit-name-wrapper');
    if (!checkbox || !nameWrapper) return;
    checkbox.addEventListener('change', () => {
      nameWrapper.hidden = !checkbox.checked;
    });
  }

  async function wireNewToolSubmit(modal, taxonomy) {
    const form = modal.querySelector('#suggest-new-tool-form');
    const cancelBtn = modal.querySelector('#suggest-form-cancel');
    const errorEl = modal.querySelector('#suggest-form-error');
    const submitBtn = modal.querySelector('#suggest-form-submit');

    if (cancelBtn) cancelBtn.addEventListener('click', close);

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // HTML5 validity check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Read fields
      const name = form.querySelector('#suggest-name')?.value.trim() || '';
      const website = form.querySelector('#suggest-website')?.value.trim() || '';
      const slug = form.querySelector('#suggest-slug')?.value.trim() || '';
      const description = form.querySelector('#suggest-description')?.value.trim() || '';
      const rationale = form.querySelector('#suggest-rationale')?.value.trim() || '';

      // Placement
      const placementOpen = form.querySelector('.suggest-collapsible-trigger')?.getAttribute('aria-expanded') === 'true';
      const track = form.querySelector('#suggest-track')?.value || null;
      const category = form.querySelector('#suggest-category')?.value || null;
      const subcategory = form.querySelector('#suggest-subcategory')?.value || null;
      const placementProvided = placementOpen && !!subcategory;

      // Tags
      const tags = Array.from(form.querySelectorAll('input[name="tag"]:checked')).map(i => i.value);

      // Type + pricing
      const type = form.querySelector('#suggest-type')?.value || null;
      const pricing_model = form.querySelector('#suggest-pricing-model')?.value || null;
      const notes = form.querySelector('#suggest-notes')?.value.trim() || null;

      // Credit
      const public_credit = form.querySelector('#suggest-public-credit')?.checked ?? true;
      const credit_name = public_credit
        ? (form.querySelector('#suggest-credit-name')?.value.trim().slice(0, 40) || '')
        : null;

      errorEl.hidden = true;

      // Pre-check pending cap
      let pendingCount = 0;
      try {
        pendingCount = await window.SupabaseClient.countMyPending();
      } catch (_) { /* non-fatal */ }

      if (pendingCount >= 20) {
        showError(modal, 'You already have 20 pending suggestions. Please wait for some to be reviewed before submitting more.');
        return;
      }

      // Build payload
      let payload;
      try {
        payload = window.SuggestLogic.buildPayload('new_tool', {
          name, slug, website, description,
          placementProvided, track, category, subcategory,
          tags, type, pricing_model, notes
        });
      } catch (err) {
        showError(modal, 'Failed to build suggestion payload: ' + escapeHtml(err.message));
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      try {
        const { data, error } = await window.SupabaseClient.createSuggestion({
          kind: 'new_tool',
          payload,
          rationale: rationale || null,
          credit_name: credit_name || null,
          public_credit
        });

        if (error) {
          showError(modal, 'Submission failed: ' + escapeHtml(error.message));
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit suggestion';
          return;
        }

        // Success
        const body = modal.querySelector('.suggest-modal-body');
        const titleEl = modal.querySelector('#suggest-modal-title');
        if (titleEl) titleEl.textContent = 'Suggestion submitted!';
        if (body) {
          body.innerHTML = `
            <div class="suggest-success">
              <div class="suggest-success-icon">✓</div>
              <h3>Thank you!</h3>
              <p>Your suggestion for <strong>${escapeHtml(name)}</strong> has been submitted and is pending review.</p>
              <a href="/my-reviews.html">Track it under My Suggestions</a>
            </div>
          `;
        }
      } catch (err) {
        showError(modal, 'Unexpected error: ' + escapeHtml(err.message));
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit suggestion';
      }
    });
  }

  function showError(modal, msg) {
    const errorEl = modal.querySelector('#suggest-form-error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ---------------------------------------------------------------------------
  // Taxonomy stub (Forms B, C, D — Phase 3.6, left as routing stubs)
  // ---------------------------------------------------------------------------

  function renderTaxonomyStub() {
    return `
      <div class="suggest-chooser">
        <p style="color:var(--vscode-text-muted)">Taxonomy suggestion form coming soon (Phase 3.6).</p>
        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-chooser-cancel">Close</button>
        </div>
      </div>
    `;
  }

  function renderMoveRetagStub(tool) {
    return `
      <div class="suggest-chooser">
        <p style="color:var(--vscode-text-muted)">Move / re-tag form coming soon (Phase 3.6)${tool ? ' for ' + escapeHtml(tool.name) : ''}.</p>
        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-chooser-cancel">Close</button>
        </div>
      </div>
    `;
  }

  function renderFixDetailsStub(tool) {
    return `
      <div class="suggest-chooser">
        <p style="color:var(--vscode-text-muted)">Fix details form coming soon (Phase 3.6)${tool ? ' for ' + escapeHtml(tool.name) : ''}.</p>
        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-chooser-cancel">Close</button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Router: show the right content in the modal body
  // ---------------------------------------------------------------------------

  function showInModal(modal, html) {
    const body = modal.querySelector('.suggest-modal-body');
    if (body) body.innerHTML = html;
    wireCollapsible(modal);
    // Re-install focus trap with updated focusables
    installTrap(modal);
    const cancelBtns = modal.querySelectorAll('#suggest-chooser-cancel');
    cancelBtns.forEach(btn => btn.addEventListener('click', close));
  }

  async function routeToForm(modal, subMode, tool, taxonomy, user) {
    if (subMode === 'new-tool') {
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Suggest a new tool';
      showInModal(modal, renderNewToolForm(user, taxonomy));
      wireDuplicateCheck(modal, taxonomy);
      wirePlacementCascade(modal, taxonomy);
      wireCreditConsent(modal);
      await wireNewToolSubmit(modal, taxonomy);
      // Set focus to first input
      const firstInput = modal.querySelector('#suggest-name');
      if (firstInput) firstInput.focus();
    } else if (subMode === 'taxonomy') {
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Suggest a taxonomy change';
      showInModal(modal, renderTaxonomyStub());
    } else if (subMode === 'move-retag') {
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Suggest move / re-tag';
      showInModal(modal, renderMoveRetagStub(tool));
    } else if (subMode === 'fix-details') {
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Suggest a detail fix';
      showInModal(modal, renderFixDetailsStub(tool));
    }
  }

  // ---------------------------------------------------------------------------
  // open({ mode, tool, trigger })
  // ---------------------------------------------------------------------------

  async function open({ mode = 'add', tool = null, trigger = null } = {}) {
    // Phase-5 hook — edit mode is not yet implemented
    if (mode === 'edit') {
      console.info('[Suggest] edit mode is a Phase-5 hook — not yet implemented.');
      return;
    }

    // Remember trigger for focus return on close
    triggerEl = trigger || document.activeElement || null;

    // Auth check
    let isAuthed = false;
    try {
      isAuthed = await window.SupabaseClient.isAuthenticated();
    } catch (_) { /* treat as signed out */ }

    if (!isAuthed) {
      const modal = mountAndOpen('Suggest a change', renderAuthGate());
      // Wire auth buttons
      if (window.AuthSignIn) {
        window.AuthSignIn.initHandlers(modal, (err) => {
          showError(modal, err);
        });
      }
      return;
    }

    // Signed-in: get user + taxonomy
    let user = null;
    try { user = await window.SupabaseClient.getCurrentUser(); } catch (_) {}
    const taxonomy = (window.landscapeData && window.landscapeData.taxonomy) || null;

    if (mode === 'add') {
      const modal = mountAndOpen('Suggest a tool or taxonomy change', renderAddChooser());
      wireChooser(modal, (subMode) => {
        routeToForm(modal, subMode, tool, taxonomy, user);
      });
    } else if (mode === 'taxonomy') {
      const modal = mountAndOpen('Suggest a taxonomy change', renderAddChooser());
      // Pre-navigate to taxonomy sub-mode
      wireChooser(modal, (subMode) => {
        routeToForm(modal, subMode, tool, taxonomy, user);
      });
      // Auto-select taxonomy card
      const taxCard = modal.querySelector('[data-mode="taxonomy"]');
      if (taxCard) {
        taxCard.click();
        const nextBtn = modal.querySelector('#suggest-chooser-next');
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
      }
    } else if (mode === 'tool') {
      const toolName = tool ? tool.name : 'a tool';
      const modal = mountAndOpen(`Suggest a change to ${toolName}`, renderToolChooser(tool));
      wireChooser(modal, (subMode) => {
        routeToForm(modal, subMode, tool, taxonomy, user);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  window.Suggest = { open, close };

})();
