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

    // Backdrop click (click on overlay but not inside .suggest-modal).
    // Guard on isConnected: when a chooser button is clicked it replaces the
    // modal body and detaches itself; the bubbling click must NOT be read as a
    // backdrop click. Detached targets report isConnected === false.
    ol.addEventListener('click', function (e) {
      if (e.target.isConnected && !e.target.closest('.suggest-modal')) close();
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
            <span class="suggest-radio-card-title">Suggest edits</span>
            <p class="suggest-radio-card-desc">Update the description, website, pricing, or other details.</p>
          </div>
        </div>
        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-chooser-cancel">Cancel</button>
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

    function advance(card) {
      const mode = card.dataset.mode;
      if (mode) onNext(mode);
    }

    function selectCard(card) {
      cards.forEach(c => {
        c.setAttribute('aria-checked', 'false');
        c.setAttribute('tabindex', '-1');
      });
      card.setAttribute('aria-checked', 'true');
      card.setAttribute('tabindex', '0');
    }

    cards.forEach(card => {
      // Clicking a card advances immediately — no separate "Next" step.
      card.addEventListener('click', () => { selectCard(card); advance(card); });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard(card);
          advance(card);
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
    // Cards advance on click/Enter; the explicit Next button is removed. If one
    // is still present (older markup), keep it working off the checked card.
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const checked = cards.find(c => c.getAttribute('aria-checked') === 'true');
      if (checked) advance(checked);
    });
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
      <div class="suggest-hint">Optional — leave blank and a reviewer will place it.</div>
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
        <strong>Subcategory</strong> = where the tool lives (one home).<br>
        <strong>Tags</strong> = cross-cutting traits — add as many as apply.
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
        <label class="suggest-credit-row">
          <input type="checkbox" id="suggest-public-credit" name="public_credit" checked>
          <span>Credit me publicly as <strong id="suggest-credit-name-wrapper">${safeName || 'me'}</strong></span>
          <span class="suggest-credit-disclosure">— shown on the tool page if approved</span>
        </label>
        <input type="hidden" id="suggest-credit-name" name="credit_name" value="${safeName}">
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
      checkDuplicates();
    });

    if (websiteInput) websiteInput.addEventListener('input', checkDuplicates);
  }

  function wireCreditConsent(modal) {
    const checkbox = modal.querySelector('#suggest-public-credit');
    const nameWrapper = modal.querySelector('#suggest-credit-name-wrapper');
    const hiddenName = modal.querySelector('#suggest-credit-name');
    if (!checkbox) return;
    checkbox.addEventListener('change', () => {
      // Dim the displayed name when opting out; clear the submitted value so
      // an unchecked box never sends a credit name.
      if (nameWrapper) nameWrapper.style.opacity = checkbox.checked ? '1' : '0.4';
      if (hiddenName) hiddenName.disabled = !checkbox.checked;
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
          name, website, description,
          placementProvided, track, category, subcategory,
          tags, type, pricing_model, notes
        });
      } catch (err) {
        showError(modal, "Couldn't prepare your suggestion — please check your inputs and try again.");
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
          showError(modal, "Couldn't save your suggestion — please try again later.");
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
              <a href="/my-suggestions.html">Track it under My Suggestions</a>
            </div>
          `;
        }
      } catch (err) {
        showError(modal, "Couldn't save your suggestion — please try again later.");
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
  // Form B — Taxonomy Change
  // ---------------------------------------------------------------------------

  // The operation chooser IS the teaching moment: subcategory and tag cards carry
  // their own definitions side-by-side, with examples, so users understand the
  // distinction before picking an operation.

  function renderTaxonomyOpChooser() {
    return `
      <div class="suggest-chooser">
        <p class="suggest-chooser-label">What kind of taxonomy change are you suggesting?</p>
        <div class="suggest-radio-group suggest-radio-group--2col"
             role="radiogroup"
             aria-label="Taxonomy operation">

          <div class="suggest-radio-card suggest-radio-card--teaching"
               role="radio" aria-checked="false" tabindex="0"
               data-taxop="add_subcategory">
            <span class="suggest-radio-card-title">Add a subcategory</span>
            <p class="suggest-radio-card-desc">
              <strong>Subcategory = where a tool lives.</strong>
              Every tool has exactly one home on the map. A subcategory is a shelf
              within a category (e.g. "Agent Memory" inside "Agent Frameworks").
              Suggest one when a meaningful group of tools has no shelf yet.
            </p>
            <p class="suggest-radio-card-example">
              Examples: <em>Agent Search, Evaluation Harnesses, Code Review</em>
            </p>
          </div>

          <div class="suggest-radio-card suggest-radio-card--teaching"
               role="radio" aria-checked="false" tabindex="-1"
               data-taxop="add_tag">
            <span class="suggest-radio-card-title">Add a tag</span>
            <p class="suggest-radio-card-desc">
              <strong>Tag = what's true about a tool.</strong>
              Tags are cross-cutting traits any tool on any shelf can share
              (e.g. "self-hosted", "api-available", "open-source").
              Suggest one when the same trait applies to unrelated tools.
            </p>
            <p class="suggest-radio-card-example">
              Examples: <em>multilingual, cli, real-time</em>
            </p>
          </div>

          <div class="suggest-radio-card"
               role="radio" aria-checked="false" tabindex="-1"
               data-taxop="add_category">
            <span class="suggest-radio-card-title">Add a category</span>
            <p class="suggest-radio-card-desc">A top-level grouping in the Users or Developers track. Suggest one when a whole new domain of AI tools isn't covered yet.</p>
          </div>

          <div class="suggest-radio-card"
               role="radio" aria-checked="false" tabindex="-1"
               data-taxop="rename">
            <span class="suggest-radio-card-title">Rename something</span>
            <p class="suggest-radio-card-desc">Propose a clearer name for an existing category, subcategory, or tag.</p>
          </div>

          <div class="suggest-radio-card"
               role="radio" aria-checked="false" tabindex="-1"
               data-taxop="other">
            <span class="suggest-radio-card-title">Other restructuring</span>
            <p class="suggest-radio-card-desc">Merge, split, or reorganize — describe in free text. Reviewed manually; never auto-applied.</p>
          </div>
        </div>

        <div class="suggest-chooser-actions">
          <button class="suggest-btn" type="button" id="suggest-taxop-cancel">Cancel</button>
        </div>
      </div>
    `;
  }

  function wireTaxonomyOpChooser(modal, taxonomy, user) {
    const group = modal.querySelector('.suggest-radio-group');
    const nextBtn = modal.querySelector('#suggest-taxop-next');
    const cancelBtn = modal.querySelector('#suggest-taxop-cancel');
    if (!group) return;

    const cards = Array.from(group.querySelectorAll('.suggest-radio-card'));

    function selectCard(card) {
      cards.forEach(c => {
        c.setAttribute('aria-checked', 'false');
        c.setAttribute('tabindex', '-1');
      });
      card.setAttribute('aria-checked', 'true');
      card.setAttribute('tabindex', '0');
    }

    function advance(card) {
      const op = card.dataset.taxop;
      if (!op) return;
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Suggest a taxonomy change';
      showInModal(modal, renderTaxonomyOpForm(op, taxonomy, user));
      wireTaxonomyOpForm(modal, op, taxonomy, user);
    }

    cards.forEach(card => {
      // Clicking a card advances immediately — no separate "Next" step.
      card.addEventListener('click', () => { selectCard(card); advance(card); });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(card); advance(card); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const idx = cards.indexOf(card);
          const next = cards[(idx + 1) % cards.length];
          selectCard(next); next.focus();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = cards.indexOf(card);
          const prev = cards[(idx - 1 + cards.length) % cards.length];
          selectCard(prev); prev.focus();
        }
      });
    });

    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const checked = cards.find(c => c.getAttribute('aria-checked') === 'true');
      if (checked) advance(checked);
    });
  }

  function renderTaxonomyOpForm(op, taxonomy, user) {
    let fieldsHtml = '';

    if (op === 'add_subcategory') {
      const catOptions = buildAllCategoryOptions(taxonomy);
      fieldsHtml = `
        <div class="suggest-form-group">
          <label for="taxop-parent-category">Parent category <span class="required">*</span></label>
          <select class="suggest-select" id="taxop-parent-category" name="parent_category" required>
            <option value="">Select a category…</option>
            ${catOptions}
          </select>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-name">Subcategory name <span class="required">*</span></label>
          <input class="suggest-input" type="text" id="taxop-name" name="name" required maxlength="80"
                 placeholder="e.g. Agent Evaluation">
        </div>
        <div class="suggest-form-group">
          <label for="taxop-description">Description <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="taxop-description" name="description" required maxlength="300"
                    placeholder="What kinds of tools belong here?"></textarea>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-example-tools">Example tools (optional)</label>
          <input class="suggest-input" type="text" id="taxop-example-tools" name="example_tools" maxlength="200"
                 placeholder="e.g. Braintrust, HoneyHive, LangSmith">
          <div class="suggest-hint">2–3 tools that would belong in this subcategory</div>
        </div>
      `;
    } else if (op === 'add_category') {
      fieldsHtml = `
        <div class="suggest-form-group">
          <label for="taxop-track">Track <span class="required">*</span></label>
          <select class="suggest-select" id="taxop-track" name="track" required>
            <option value="">Select a track…</option>
            <option value="users">For Users</option>
            <option value="developers">For Developers</option>
          </select>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-name">Category name <span class="required">*</span></label>
          <input class="suggest-input" type="text" id="taxop-name" name="name" required maxlength="80"
                 placeholder="e.g. Engineering Intelligence">
        </div>
        <div class="suggest-form-group">
          <label for="taxop-description">Description <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="taxop-description" name="description" required maxlength="300"
                    placeholder="What domain of AI tools does this cover?"></textarea>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-example-tools">Example tools (optional)</label>
          <input class="suggest-input" type="text" id="taxop-example-tools" name="example_tools" maxlength="200"
                 placeholder="e.g. Tool A, Tool B">
        </div>
      `;
    } else if (op === 'add_tag') {
      fieldsHtml = `
        <div class="suggest-form-group">
          <label for="taxop-family">Tag family <span class="required">*</span></label>
          <select class="suggest-select" id="taxop-family" name="family" required>
            <option value="">Select a family…</option>
            <option value="capabilities">Capabilities — what the tool can do</option>
            <option value="integrations">Integrations — what it connects to</option>
            <option value="deployment">Deployment — how it's delivered</option>
            <option value="use-cases">Use Cases — primary use scenarios</option>
          </select>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-name">Tag name <span class="required">*</span></label>
          <input class="suggest-input" type="text" id="taxop-name" name="name" required maxlength="60"
                 placeholder="e.g. Multilingual">
        </div>
        <div class="suggest-form-group">
          <label for="taxop-description">Description <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="taxop-description" name="description" required maxlength="200"
                    placeholder="What does this tag mean? When does it apply?"></textarea>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-example-tools">Example tools that would have this tag (optional)</label>
          <input class="suggest-input" type="text" id="taxop-example-tools" name="example_tools" maxlength="200"
                 placeholder="e.g. Tool A, Tool B">
        </div>
      `;
    } else if (op === 'rename') {
      fieldsHtml = `
        <div class="suggest-form-group">
          <label for="taxop-target-kind">What to rename <span class="required">*</span></label>
          <select class="suggest-select" id="taxop-target-kind" name="target_kind" required>
            <option value="">Select…</option>
            <option value="category">Category</option>
            <option value="subcategory">Subcategory</option>
            <option value="tag">Tag</option>
          </select>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-target">Which one? <span class="required">*</span></label>
          <select class="suggest-select" id="taxop-target" name="target" required disabled>
            <option value="">Select what to rename first…</option>
          </select>
          <div class="suggest-hint">Pick the existing item to rename.</div>
        </div>
        <div class="suggest-form-group">
          <label for="taxop-new-name">Proposed new name <span class="required">*</span></label>
          <input class="suggest-input" type="text" id="taxop-new-name" name="new_name" required maxlength="100"
                 placeholder="e.g. Memory Layers">
        </div>
      `;
    } else if (op === 'other') {
      fieldsHtml = `
        <div class="suggest-form-group">
          <label for="taxop-details">Describe the restructuring <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="taxop-details" name="details" required maxlength="1000"
                    placeholder="e.g. Merge 'Agent Search' and 'Agent Memory' into a new 'Agent Context' subcategory because…"></textarea>
          <div class="suggest-hint">This will be reviewed manually — never auto-applied.</div>
        </div>
      `;
    }

    return `
      <form class="suggest-form" id="suggest-taxonomy-form" novalidate>
        <div id="suggest-form-error" class="suggest-error" hidden></div>

        ${fieldsHtml}

        <div class="suggest-form-group">
          <label for="taxop-rationale">Why? <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="taxop-rationale" name="rationale" required maxlength="500"
                    placeholder="Explain why this change would improve the taxonomy…"></textarea>
          <div class="suggest-hint">Required — helps reviewers understand the need.</div>
        </div>

        ${renderCreditConsent(user)}

        <div class="suggest-form-actions">
          <button class="suggest-btn" type="button" id="suggest-form-cancel">Cancel</button>
          <button class="suggest-btn suggest-btn-primary" type="submit" id="suggest-form-submit">Submit suggestion</button>
        </div>
      </form>
    `;
  }

  function buildAllCategoryOptions(taxonomy) {
    if (!taxonomy || !taxonomy.categories) return '';
    let html = '';
    for (const [track, cats] of Object.entries(taxonomy.categories)) {
      const trackLabel = track === 'users' ? 'For Users' : 'For Developers';
      for (const [id, cat] of Object.entries(cats || {})) {
        html += `<option value="${escapeHtml(id)}" data-track="${escapeHtml(track)}">${escapeHtml(trackLabel + ' › ' + cat.name)}</option>`;
      }
    }
    return html;
  }

  function wireTaxonomyOpForm(modal, op, taxonomy, user) {
    wireCreditConsent(modal);
    const form = modal.querySelector('#suggest-taxonomy-form');
    const cancelBtn = modal.querySelector('#suggest-form-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (!form) return;

    const kindSel = form.querySelector('#taxop-target-kind');
    const targetSel = form.querySelector('#taxop-target');
    if (kindSel && targetSel && targetSel.tagName === 'SELECT') {
      kindSel.addEventListener('change', () => {
        const objs = window.SuggestLogic.taxonomyObjects(window.landscapeData && window.landscapeData.taxonomy, kindSel.value);
        targetSel.innerHTML = objs.length
          ? '<option value="">Select…</option>' + objs.map(o => `<option value="${escapeHtml(o.slug)}">${escapeHtml(o.label)} (${escapeHtml(o.slug)})</option>`).join('')
          : '<option value="">Select what to rename first…</option>';
        targetSel.disabled = !objs.length;
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rationale = (form.querySelector('#taxop-rationale')?.value || '').trim();
      if (!rationale) {
        showError(modal, 'Rationale is required — please explain why this change would improve the taxonomy.');
        return;
      }

      if (!form.checkValidity()) { form.reportValidity(); return; }

      // Assemble op-specific payload
      let payload = { op };
      if (op === 'add_subcategory') {
        payload.parent_category = form.querySelector('#taxop-parent-category')?.value || '';
        payload.name = form.querySelector('#taxop-name')?.value.trim() || '';
        payload.description = form.querySelector('#taxop-description')?.value.trim() || '';
        const exTools = form.querySelector('#taxop-example-tools')?.value.trim();
        if (exTools) payload.example_tools = exTools.split(',').map(s => s.trim()).filter(Boolean);
      } else if (op === 'add_category') {
        payload.track = form.querySelector('#taxop-track')?.value || '';
        payload.name = form.querySelector('#taxop-name')?.value.trim() || '';
        payload.description = form.querySelector('#taxop-description')?.value.trim() || '';
        const exTools = form.querySelector('#taxop-example-tools')?.value.trim();
        if (exTools) payload.example_tools = exTools.split(',').map(s => s.trim()).filter(Boolean);
      } else if (op === 'add_tag') {
        payload.family = form.querySelector('#taxop-family')?.value || '';
        payload.name = form.querySelector('#taxop-name')?.value.trim() || '';
        payload.description = form.querySelector('#taxop-description')?.value.trim() || '';
        const exTools = form.querySelector('#taxop-example-tools')?.value.trim();
        if (exTools) payload.example_tools = exTools.split(',').map(s => s.trim()).filter(Boolean);
      } else if (op === 'rename') {
        payload.target_kind = form.querySelector('#taxop-target-kind')?.value || '';
        payload.target = form.querySelector('#taxop-target')?.value.trim() || '';
        payload.new_name = form.querySelector('#taxop-new-name')?.value.trim() || '';
      } else if (op === 'other') {
        payload.details = form.querySelector('#taxop-details')?.value.trim() || '';
      }

      const public_credit = form.querySelector('#suggest-public-credit')?.checked ?? true;
      const credit_name = public_credit
        ? (form.querySelector('#suggest-credit-name')?.value.trim().slice(0, 40) || '')
        : null;

      // Pre-check pending cap
      let pendingCount = 0;
      try { pendingCount = await window.SupabaseClient.countMyPending(); } catch (_) {}
      if (pendingCount >= 20) {
        showError(modal, 'You already have 20 pending suggestions. Please wait for some to be reviewed before submitting more.');
        return;
      }

      const submitBtn = form.querySelector('#suggest-form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      try {
        const { error } = await window.SupabaseClient.createSuggestion({
          kind: 'taxonomy_change',
          payload,
          rationale,
          credit_name: credit_name || null,
          public_credit
        });

        if (error) {
          showError(modal, "Couldn't save your suggestion — please try again later.");
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit suggestion'; }
          return;
        }

        const body = modal.querySelector('.suggest-modal-body');
        const titleEl = modal.querySelector('#suggest-modal-title');
        if (titleEl) titleEl.textContent = 'Suggestion submitted!';
        if (body) {
          body.innerHTML = `
            <div class="suggest-success">
              <div class="suggest-success-icon">✓</div>
              <h3>Thank you!</h3>
              <p>Your taxonomy suggestion has been submitted and is pending review.</p>
              <a href="/my-suggestions.html">Track it under My Suggestions</a>
            </div>
          `;
        }
      } catch (err) {
        showError(modal, "Couldn't save your suggestion — please try again later.");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit suggestion'; }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Form C — Move or Re-tag a Tool
  // ---------------------------------------------------------------------------

  function renderMoveRetagForm(tool, taxonomy, user) {
    const toolName = tool ? escapeHtml(tool.name) : 'this tool';
    const currentCat = tool ? escapeHtml(tool.category || '') : '';
    const currentSub = tool ? escapeHtml(tool.subcategory || '') : '';
    const currentTags = tool && Array.isArray(tool.tags) ? tool.tags : [];

    return `
      <form class="suggest-form" id="suggest-move-retag-form" novalidate>
        <div id="suggest-form-error" class="suggest-error" hidden></div>

        <div class="suggest-form-group">
          <label for="suggest-subcat-search">Move to a different subcategory?</label>
          <div class="suggest-typeahead" style="position:relative">
            <input class="suggest-input" type="text" id="suggest-subcat-search"
                   autocomplete="off"
                   placeholder="Type a category or subcategory… e.g. memory, ides"
                   aria-label="Search subcategories"
                   aria-autocomplete="list"
                   aria-controls="suggest-subcat-menu">
            <div id="suggest-subcat-menu" class="suggest-typeahead-menu" role="listbox" hidden></div>
          </div>
          <input type="hidden" id="suggest-new-subcategory" value="" data-category="" data-track="">
          <div class="suggest-hint">Leave blank to keep <strong>${currentSub || 'the current placement'}</strong> and only change tags.</div>
        </div>

        <p class="suggest-placement-helper">
          <strong>Subcategory</strong> = where the tool lives (one home).<br>
          <strong>Tags</strong> = cross-cutting traits — add as many as apply.
        </p>

        <div class="suggest-form-group">
          <label>Tags</label>
          <div id="suggest-tag-chips" class="suggest-tag-chips-row"></div>
          <div class="suggest-typeahead" style="position:relative;margin-top:6px">
            <input class="suggest-input" type="text" id="suggest-tag-search"
                   autocomplete="off"
                   placeholder="Type to add a tag…"
                   aria-label="Search tags"
                   aria-autocomplete="list"
                   aria-controls="suggest-tag-menu">
            <div id="suggest-tag-menu" class="suggest-typeahead-menu" role="listbox" hidden></div>
          </div>
          <div class="suggest-hint" style="margin-top:4px">Suggested:</div>
          <div id="suggest-tag-sugg" class="suggest-tag-sugg-row"></div>
        </div>

        <div class="suggest-form-group">
          <label for="suggest-retag-rationale">Why? <span class="required">*</span></label>
          <textarea class="suggest-textarea" id="suggest-retag-rationale" name="rationale" required maxlength="500"
                    placeholder="Explain why this placement or tag change is more accurate…"></textarea>
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
  // Type-ahead helpers for Move/Re-tag form
  // ---------------------------------------------------------------------------

  /**
   * Wire the subcategory type-ahead (#suggest-subcat-search → #suggest-subcat-menu
   * → #suggest-new-subcategory hidden input).
   * Builds a flat list of all subcategories from taxonomy at wire time.
   */
  function wireSubcategoryTypeahead(modal, taxonomy) {
    const searchInput = modal.querySelector('#suggest-subcat-search');
    const menu = modal.querySelector('#suggest-subcat-menu');
    const hiddenInput = modal.querySelector('#suggest-new-subcategory');
    if (!searchInput || !menu || !hiddenInput) return;

    // Build flat subcategory list once
    const allSubs = [];
    if (taxonomy && taxonomy.categories) {
      for (const [track, cats] of Object.entries(taxonomy.categories)) {
        const trackLabel = track === 'users' ? 'For Users' : 'For Developers';
        for (const [catId, cat] of Object.entries(cats || {})) {
          for (const [subId, sub] of Object.entries(cat.subcategories || {})) {
            allSubs.push({
              slug: subId,
              name: sub.name,
              catId,
              catName: cat.name,
              track,
              trackLabel,
              label: `${trackLabel} › ${cat.name} › ${sub.name}`,
            });
          }
        }
      }
    }

    function openMenu(items) {
      if (!items.length) {
        menu.innerHTML = `<div class="suggest-typeahead-noresult">No match</div>`;
      } else {
        menu.innerHTML = items.map(s =>
          `<div class="suggest-typeahead-item" role="option" tabindex="-1"
                data-slug="${escapeHtml(s.slug)}"
                data-category="${escapeHtml(s.catId)}"
                data-track="${escapeHtml(s.track)}">${escapeHtml(s.name)} <span class="suggest-typeahead-meta">— ${escapeHtml(s.catName)}</span></div>`
        ).join('');
        // Wire both mousedown (prevents blur) and click (handles programmatic clicks)
        menu.querySelectorAll('[data-slug]').forEach(item => {
          item.addEventListener('mousedown', (e) => {
            e.preventDefault(); // don't blur the input before we update
            selectSubcategory(item);
          });
          item.addEventListener('click', () => {
            selectSubcategory(item);
          });
        });
      }
      menu.hidden = false;
    }

    function closeMenu() {
      menu.hidden = true;
      menu.innerHTML = '';
    }

    function selectSubcategory(item) {
      const slug = item.dataset.slug;
      const category = item.dataset.category;
      const track = item.dataset.track;
      // Update hidden input
      hiddenInput.value = slug;
      hiddenInput.dataset.category = category;
      hiddenInput.dataset.track = track;
      // Update display text
      const sub = allSubs.find(s => s.slug === slug);
      searchInput.value = sub ? sub.label : slug;
      closeMenu();
    }

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (!q) { closeMenu(); return; }
      const matches = allSubs
        .filter(s => s.name.toLowerCase().includes(q) || s.catName.toLowerCase().includes(q) || s.slug.includes(q))
        .slice(0, 10);
      openMenu(matches);
    });

    searchInput.addEventListener('focus', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (q) {
        const matches = allSubs
          .filter(s => s.name.toLowerCase().includes(q) || s.catName.toLowerCase().includes(q) || s.slug.includes(q))
          .slice(0, 10);
        if (matches.length) openMenu(matches);
      }
    });

    // Blur guard: revert display input to the committed label when focus leaves without
    // a valid selection.  mousedown on menu items calls e.preventDefault() (above), so
    // the blur fires AFTER selectSubcategory() has already updated hiddenInput — meaning
    // the committed slug is already correct by the time we read it here, and we safely
    // skip the revert for a genuine click selection.
    searchInput.addEventListener('blur', () => {
      const committedSlug = hiddenInput.value;
      if (!committedSlug) {
        // Nothing committed yet — clear any partial query text
        searchInput.value = '';
      } else {
        // Restore the display label for the committed slug
        const committed = allSubs.find(s => s.slug === committedSlug);
        searchInput.value = committed ? committed.label : committedSlug;
      }
      closeMenu();
    });

    // Close menu when clicking outside
    function onDocClick(e) {
      if (!menu.contains(e.target) && e.target !== searchInput) closeMenu();
    }
    document.addEventListener('click', onDocClick);
    // TODO: cleanup is observer-based and coupled to overlay-removal DOM structure; prefer an explicit cleanup()/AbortController from destroyOverlay if the modal nesting changes.
    const observer = new MutationObserver(() => {
      if (!document.contains(modal)) {
        document.removeEventListener('click', onDocClick);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: false });
  }

  /**
   * Wire the tag type-ahead (#suggest-tag-search → #suggest-tag-menu → chips).
   * Selected tags are reflected as hidden inputs[name="selected_tag"] and
   * new tags as hidden inputs[name="new_tag"] for the submit handlers to read.
   *
   * @param {Element} modal
   * @param {object} taxonomy
   * @param {object} tool  — used to determine current (pre-selected) tags
   */
  function wireTagTypeahead(modal, taxonomy, tool) {
    const chipsContainer = modal.querySelector('#suggest-tag-chips');
    const searchInput = modal.querySelector('#suggest-tag-search');
    const menu = modal.querySelector('#suggest-tag-menu');
    const suggRow = modal.querySelector('#suggest-tag-sugg');
    if (!chipsContainer || !searchInput || !menu || !suggRow) return;

    const currentTags = (tool && Array.isArray(tool.tags)) ? tool.tags : [];

    // Build flat tag list
    const allTags = [];
    if (taxonomy && taxonomy.tags) {
      const families = ['capabilities', 'integrations', 'deployment', 'use-cases'];
      for (const fam of families) {
        const tags = taxonomy.tags[fam];
        if (tags && tags.length) {
          tags.forEach(t => allTags.push({ slug: t.slug, name: t.name, fam }));
        }
      }
    }

    // State: selected slugs (Set) and new tag names (Set)
    const selectedSlugs = new Set(currentTags);
    const newTagNames = new Set();

    function nameOf(slug) {
      const t = allTags.find(x => x.slug === slug);
      return t ? t.name : slug;
    }

    function rebuildHiddenInputs() {
      // Remove old hidden inputs
      modal.querySelectorAll('input[name="selected_tag"], input[name="new_tag"]').forEach(el => el.remove());
      const form = modal.querySelector('#suggest-move-retag-form');
      if (!form) return;
      selectedSlugs.forEach(slug => {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = 'selected_tag';
        inp.value = slug;
        form.appendChild(inp);
      });
      newTagNames.forEach(name => {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = 'new_tag';
        inp.value = name;
        form.appendChild(inp);
      });
    }

    function renderChips() {
      const parts = [];
      // Existing taxonomy tag chips
      selectedSlugs.forEach(slug => {
        const isCurrent = currentTags.includes(slug);
        parts.push(
          `<span class="suggest-chip${isCurrent ? ' suggest-chip--current' : ''}" data-slug="${escapeHtml(slug)}">${escapeHtml(nameOf(slug))}<button type="button" aria-label="Remove ${escapeHtml(nameOf(slug))}">×</button></span>`
        );
      });
      // New-tag chips (visually distinct)
      newTagNames.forEach(name => {
        parts.push(
          `<span class="suggest-chip suggest-chip--new" data-new-tag="${escapeHtml(name)}">${escapeHtml(name)}<button type="button" aria-label="Remove ${escapeHtml(name)}">×</button></span>`
        );
      });
      chipsContainer.innerHTML = parts.join('');
      // Wire remove buttons
      chipsContainer.querySelectorAll('[data-slug] button').forEach(btn => {
        btn.addEventListener('click', () => {
          const chip = btn.closest('[data-slug]');
          if (chip) {
            selectedSlugs.delete(chip.dataset.slug);
            renderChips();
            renderSuggested();
            rebuildHiddenInputs();
          }
        });
      });
      chipsContainer.querySelectorAll('[data-new-tag] button').forEach(btn => {
        btn.addEventListener('click', () => {
          const chip = btn.closest('[data-new-tag]');
          if (chip) {
            newTagNames.delete(chip.dataset.newTag);
            renderChips();
            rebuildHiddenInputs();
          }
        });
      });
    }

    function renderSuggested() {
      const suggested = allTags.filter(t => !selectedSlugs.has(t.slug)).slice(0, 6);
      if (!suggested.length) { suggRow.innerHTML = ''; return; }
      suggRow.innerHTML = suggested.map(t =>
        `<button type="button" class="suggest-sugg-btn" data-slug="${escapeHtml(t.slug)}">+ ${escapeHtml(t.name)}</button>`
      ).join('');
      suggRow.querySelectorAll('[data-slug]').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedSlugs.add(btn.dataset.slug);
          renderChips();
          renderSuggested();
          rebuildHiddenInputs();
        });
      });
    }

    function closeMenu() {
      menu.hidden = true;
      menu.innerHTML = '';
    }

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (!q) { closeMenu(); return; }

      const matches = allTags
        .filter(t => !selectedSlugs.has(t.slug) && (t.name.toLowerCase().includes(q) || t.slug.includes(q)))
        .slice(0, 8);

      let html = matches.map(t =>
        `<div class="suggest-typeahead-item" role="option" tabindex="-1"
              data-slug="${escapeHtml(t.slug)}">${escapeHtml(t.name)} <span class="suggest-typeahead-meta">— ${escapeHtml(t.fam)}</span></div>`
      ).join('');

      // Inline new-tag option: show if typed text doesn't exactly match any tag
      const rawInput = searchInput.value.trim();
      const exactMatch = allTags.some(t => t.name.toLowerCase() === q || t.slug === q);
      if (rawInput && !exactMatch) {
        html += `<div class="suggest-typeahead-item suggest-typeahead-item--new" role="option" tabindex="-1"
                      data-new-tag="${escapeHtml(rawInput)}">+ Suggest new tag "${escapeHtml(rawInput)}"</div>`;
      }

      if (!html) {
        menu.innerHTML = `<div class="suggest-typeahead-noresult">No match</div>`;
      } else {
        menu.innerHTML = html;
        // Wire existing-tag items (both mousedown to prevent blur and click for programmatic)
        menu.querySelectorAll('[data-slug]').forEach(item => {
          const addTag = () => {
            selectedSlugs.add(item.dataset.slug);
            searchInput.value = '';
            closeMenu();
            renderChips();
            renderSuggested();
            rebuildHiddenInputs();
          };
          item.addEventListener('mousedown', (e) => { e.preventDefault(); addTag(); });
          item.addEventListener('click', () => { addTag(); });
        });
        // Wire new-tag item (both mousedown and click)
        menu.querySelectorAll('[data-new-tag]').forEach(item => {
          const addNewTag = () => {
            newTagNames.add(item.dataset.newTag);
            searchInput.value = '';
            closeMenu();
            renderChips();
            rebuildHiddenInputs();
          };
          item.addEventListener('mousedown', (e) => { e.preventDefault(); addNewTag(); });
          item.addEventListener('click', () => { addNewTag(); });
        });
      }
      menu.hidden = false;
    });

    // Close menu when clicking outside
    function onDocClick(e) {
      if (!menu.contains(e.target) && e.target !== searchInput) closeMenu();
    }
    document.addEventListener('click', onDocClick);
    // TODO: cleanup is observer-based and coupled to overlay-removal DOM structure; prefer an explicit cleanup()/AbortController from destroyOverlay if the modal nesting changes.
    const observer = new MutationObserver(() => {
      if (!document.contains(modal)) {
        document.removeEventListener('click', onDocClick);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: false });

    // Initial render
    renderChips();
    renderSuggested();
    rebuildHiddenInputs();
  }

  function wireMoveRetagForm(modal, tool, taxonomy, user) {
    wireCreditConsent(modal);
    wireSubcategoryTypeahead(modal, taxonomy);
    wireTagTypeahead(modal, taxonomy, tool);

    const form = modal.querySelector('#suggest-move-retag-form');
    const cancelBtn = modal.querySelector('#suggest-form-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rationale = (form.querySelector('#suggest-retag-rationale')?.value || '').trim();
      if (!rationale) {
        showError(modal, 'Rationale is required — please explain why this placement change is more accurate.');
        return;
      }

      // TODO: this placement-value reading (subcategory + tagsAdd/tagsRemove + new-tag slugs) is duplicated in wireEditSubmit; extract a shared readPlacementFormValues(form, tool) helper.
      // Read subcategory from the hidden input (set by wireSubcategoryTypeahead)
      const hiddenSub = form.querySelector('#suggest-new-subcategory');
      const proposedSubcategory = hiddenSub ? hiddenSub.value : '';
      const proposedCategory = hiddenSub ? (hiddenSub.dataset.category || '') : '';

      // Read tags from hidden inputs (set by wireTagTypeahead)
      const currentTags = tool && Array.isArray(tool.tags) ? tool.tags : [];
      const selectedTagSlugs = Array.from(form.querySelectorAll('input[name="selected_tag"]')).map(i => i.value);
      const newTagNames = Array.from(form.querySelectorAll('input[name="new_tag"]')).map(i => i.value);
      const selectedExistingAdds = selectedTagSlugs.filter(s => !currentTags.includes(s));
      const newSlugs = newTagNames.map(n => window.SuggestLogic.slugify(n)).filter(Boolean);
      const tagsAdd = [...new Set([...selectedExistingAdds, ...newSlugs])];
      const tagsRemove = currentTags.filter(s => !selectedTagSlugs.includes(s));

      const current = {
        category: tool ? (tool.category || '') : '',
        subcategory: tool ? (tool.subcategory || '') : '',
        tags: currentTags
      };
      const proposed = {
        category: proposedCategory || current.category,
        subcategory: proposedSubcategory || current.subcategory,
        tags_add: tagsAdd,
        tags_remove: tagsRemove
      };

      let payload;
      try {
        payload = window.SuggestLogic.buildPayload('tool_placement', { current, proposed });
      } catch (err) {
        showError(modal, "Couldn't prepare your suggestion — please check your inputs and try again.");
        return;
      }

      const public_credit = form.querySelector('#suggest-public-credit')?.checked ?? true;
      const credit_name = public_credit
        ? (form.querySelector('#suggest-credit-name')?.value.trim().slice(0, 40) || '')
        : null;

      // Pre-check pending cap
      let pendingCount = 0;
      try { pendingCount = await window.SupabaseClient.countMyPending(); } catch (_) {}
      if (pendingCount >= 20) {
        showError(modal, 'You already have 20 pending suggestions. Please wait for some to be reviewed before submitting more.');
        return;
      }

      const submitBtn = form.querySelector('#suggest-form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      try {
        const { error } = await window.SupabaseClient.createSuggestion({
          kind: 'tool_placement',
          tool_slug: tool ? tool.slug : null,
          payload,
          rationale,
          credit_name: credit_name || null,
          public_credit
        });

        if (error) {
          showError(modal, "Couldn't save your suggestion — please try again later.");
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit suggestion'; }
          return;
        }

        // Fire add_tag taxonomy suggestions for any inline new tags (non-blocking)
        if (newTagNames.length) {
          const slugify = (window.SuggestLogic && window.SuggestLogic.slugify)
            ? window.SuggestLogic.slugify
            : (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          for (const name of newTagNames) {
            try {
              await window.SupabaseClient.createSuggestion({
                kind: 'taxonomy_change',
                tool_slug: null,
                payload: { op: 'add_tag', family: 'capabilities', name },
                rationale: 'Proposed alongside a re-tag suggestion',
                credit_name: credit_name || null,
                public_credit
              });
            } catch (_) {
              // Non-blocking: log but don't fail the main suggestion
              console.warn('[suggest] Failed to file add_tag suggestion for:', name);
            }
          }
        }

        const body = modal.querySelector('.suggest-modal-body');
        const titleEl = modal.querySelector('#suggest-modal-title');
        if (titleEl) titleEl.textContent = 'Suggestion submitted!';
        if (body) {
          body.innerHTML = `
            <div class="suggest-success">
              <div class="suggest-success-icon">✓</div>
              <h3>Thank you!</h3>
              <p>Your placement suggestion for <strong>${escapeHtml(tool ? tool.name : 'this tool')}</strong> has been submitted and is pending review.</p>
              ${newTagNames.length ? `<p class="suggest-hint">New tag suggestion(s) also filed: ${newTagNames.map(n => escapeHtml(n)).join(', ')}</p>` : ''}
              <a href="/my-suggestions.html">Track it under My Suggestions</a>
            </div>
          `;
        }
      } catch (err) {
        showError(modal, "Couldn't save your suggestion — please try again later.");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit suggestion'; }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Form D — Fix Tool Details
  // ---------------------------------------------------------------------------

  function renderFixDetailsForm(tool, user) {
    const t = tool || {};

    return `
      <form class="suggest-form" id="suggest-fix-details-form" novalidate>
        <div id="suggest-form-error" class="suggest-error" hidden></div>

        <p class="suggest-hint">Edit any field you'd like to update. Only changed fields are submitted.</p>

        <div class="suggest-form-group">
          <label for="fix-description">Description</label>
          <textarea class="suggest-textarea" id="fix-description" name="description"
                    maxlength="300"
                    placeholder="One-line description of what this tool does">${escapeHtml(t.desc || t.description || '')}</textarea>
        </div>

        <div class="suggest-form-group">
          <label for="fix-website">Website URL</label>
          <input class="suggest-input" type="url" id="fix-website" name="website"
                 value="${escapeHtml(t.url || t.website || '')}"
                 placeholder="https://example.com">
        </div>

        <div class="suggest-form-group">
          <label for="fix-github-url">GitHub URL (optional)</label>
          <input class="suggest-input" type="url" id="fix-github-url" name="github_url"
                 value="${escapeHtml(t.github_url || '')}"
                 placeholder="https://github.com/org/repo">
        </div>

        <div class="suggest-form-group">
          <label for="fix-rationale">Anything to add for the reviewer? (optional)</label>
          <textarea class="suggest-textarea" id="fix-rationale" name="rationale"
                    maxlength="300"
                    placeholder="e.g. The website changed, or the description is outdated…"></textarea>
        </div>

        ${renderCreditConsent(user)}

        <div class="suggest-form-actions">
          <button class="suggest-btn" type="button" id="suggest-form-cancel">Cancel</button>
          <button class="suggest-btn suggest-btn-primary" type="submit" id="suggest-form-submit">Submit suggestion</button>
        </div>
      </form>
    `;
  }

  function wireFixDetailsForm(modal, tool, user) {
    wireCreditConsent(modal);
    const form = modal.querySelector('#suggest-fix-details-form');
    const cancelBtn = modal.querySelector('#suggest-form-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (!form) return;

    // Snapshot original values from the tool context at wire-time
    const t = tool || {};
    const original = {
      description: t.desc || t.description || '',
      website: t.url || t.website || '',
      github_url: t.github_url || '',
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const edited = {
        description: (form.querySelector('#fix-description')?.value || '').trim(),
        website: (form.querySelector('#fix-website')?.value || '').trim(),
        github_url: (form.querySelector('#fix-github-url')?.value || '').trim(),
      };

      let payload;
      try {
        payload = window.SuggestLogic.buildPayload('tool_edit', { original, edited });
      } catch (err) {
        showError(modal, "Couldn't prepare your suggestion — please check your inputs and try again.");
        return;
      }

      if (!payload.changes || Object.keys(payload.changes).length === 0) {
        showError(modal, 'No changes detected — please modify at least one field before submitting.');
        return;
      }

      const rationale = (form.querySelector('#fix-rationale')?.value || '').trim();

      const public_credit = form.querySelector('#suggest-public-credit')?.checked ?? true;
      const credit_name = public_credit
        ? (form.querySelector('#suggest-credit-name')?.value.trim().slice(0, 40) || '')
        : null;

      // Pre-check pending cap
      let pendingCount = 0;
      try { pendingCount = await window.SupabaseClient.countMyPending(); } catch (_) {}
      if (pendingCount >= 20) {
        showError(modal, 'You already have 20 pending suggestions. Please wait for some to be reviewed before submitting more.');
        return;
      }

      const submitBtn = form.querySelector('#suggest-form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      try {
        const { error } = await window.SupabaseClient.createSuggestion({
          kind: 'tool_edit',
          tool_slug: tool ? tool.slug : null,
          payload,
          rationale: rationale || null,
          credit_name: credit_name || null,
          public_credit
        });

        if (error) {
          showError(modal, "Couldn't save your suggestion — please try again later.");
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit suggestion'; }
          return;
        }

        const body = modal.querySelector('.suggest-modal-body');
        const titleEl = modal.querySelector('#suggest-modal-title');
        if (titleEl) titleEl.textContent = 'Suggestion submitted!';
        if (body) {
          body.innerHTML = `
            <div class="suggest-success">
              <div class="suggest-success-icon">✓</div>
              <h3>Thank you!</h3>
              <p>Your detail fix for <strong>${escapeHtml(tool ? tool.name : 'this tool')}</strong> has been submitted and is pending review.</p>
              <a href="/my-suggestions.html">Track it under My Suggestions</a>
            </div>
          `;
        }
      } catch (err) {
        showError(modal, "Couldn't save your suggestion — please try again later.");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit suggestion'; }
      }
    });
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
      showInModal(modal, renderTaxonomyOpChooser());
      wireTaxonomyOpChooser(modal, taxonomy, user);
    } else if (subMode === 'move-retag') {
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Move or re-tag: ' + (tool ? escapeHtml(tool.name) : 'tool');
      showInModal(modal, renderMoveRetagForm(tool, taxonomy, user));
      wireMoveRetagForm(modal, tool, taxonomy, user);
      const firstInput = modal.querySelector('#suggest-subcat-search');
      if (firstInput) firstInput.focus();
    } else if (subMode === 'fix-details') {
      const titleEl = modal.querySelector('#suggest-modal-title');
      if (titleEl) titleEl.textContent = 'Suggest edits: ' + (tool ? escapeHtml(tool.name) : 'tool');
      showInModal(modal, renderFixDetailsForm(tool, user));
      wireFixDetailsForm(modal, tool, user);
      const firstInput = modal.querySelector('#fix-description');
      if (firstInput) firstInput.focus();
    }
  }

  // ---------------------------------------------------------------------------
  // open({ mode, tool, trigger })
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Edit mode: prefill form from a suggestion row, submit as UPDATE
  // ---------------------------------------------------------------------------

  async function openEditMode(suggestion, trigger) {
    triggerEl = trigger || document.activeElement || null;

    // Auth check (user must be signed in to edit their own row)
    let user = null;
    try { user = await window.SupabaseClient.getCurrentUser(); } catch (_) {}
    if (!user) {
      const modal = mountAndOpen('Sign in to edit', renderAuthGate());
      if (window.AuthSignIn) {
        window.AuthSignIn.initHandlers(modal, (err) => showError(modal, err));
      }
      return;
    }

    const taxonomy = (window.landscapeData && window.landscapeData.taxonomy) || null;
    const row = suggestion || {};
    const kind = row.kind || '';
    const payload = row.payload || {};

    // Map kind → sub-mode and route to correct form
    if (kind === 'new_tool') {
      const modal = mountAndOpen('Edit suggestion: new tool', renderNewToolForm(user, taxonomy));
      // Prefill fields
      const nameInput = modal.querySelector('#suggest-name');
      const websiteInput = modal.querySelector('#suggest-website');
      const descInput = modal.querySelector('#suggest-description');
      const rationaleInput = modal.querySelector('#suggest-rationale');
      const creditNameInput = modal.querySelector('#suggest-credit-name');
      const publicCreditBox = modal.querySelector('#suggest-public-credit');

      if (nameInput) nameInput.value = payload.name || '';
      if (websiteInput) websiteInput.value = payload.website || '';
      if (descInput) descInput.value = payload.description || '';
      if (rationaleInput) rationaleInput.value = row.rationale || '';
      if (creditNameInput) creditNameInput.value = row.credit_name || '';
      if (publicCreditBox) publicCreditBox.checked = row.public_credit !== false;

      wireDuplicateCheck(modal, taxonomy);
      wirePlacementCascade(modal, taxonomy);
      wireCreditConsent(modal);

      // Wire submit as UPDATE
      wireEditSubmit(modal, row, kind, 'new_tool');

      const cancelBtn = modal.querySelector('#suggest-form-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);

      if (nameInput) nameInput.focus();

    } else if (kind === 'taxonomy_change') {
      // Go straight to the taxonomy op form using the stored op
      const op = payload.op || 'other';
      const modal = mountAndOpen('Edit suggestion: taxonomy change', renderTaxonomyOpForm(op, taxonomy, user));

      // Prefill common fields
      const rationaleInput = modal.querySelector('#taxop-rationale');
      const creditNameInput = modal.querySelector('#suggest-credit-name');
      const publicCreditBox = modal.querySelector('#suggest-public-credit');
      if (rationaleInput) rationaleInput.value = row.rationale || '';
      if (creditNameInput) creditNameInput.value = row.credit_name || '';
      if (publicCreditBox) publicCreditBox.checked = row.public_credit !== false;

      // Prefill op-specific fields
      if (op === 'add_subcategory') {
        const parentCat = modal.querySelector('#taxop-parent-category');
        const nameInput = modal.querySelector('#taxop-name');
        const descInput = modal.querySelector('#taxop-description');
        const exToolsInput = modal.querySelector('#taxop-example-tools');
        if (parentCat) parentCat.value = payload.parent_category || '';
        if (nameInput) nameInput.value = payload.name || '';
        if (descInput) descInput.value = payload.description || '';
        if (exToolsInput) exToolsInput.value = Array.isArray(payload.example_tools) ? payload.example_tools.join(', ') : (payload.example_tools || '');
      } else if (op === 'add_category') {
        const trackSel = modal.querySelector('#taxop-track');
        const nameInput = modal.querySelector('#taxop-name');
        const descInput = modal.querySelector('#taxop-description');
        if (trackSel) trackSel.value = payload.track || '';
        if (nameInput) nameInput.value = payload.name || '';
        if (descInput) descInput.value = payload.description || '';
      } else if (op === 'add_tag') {
        const familySel = modal.querySelector('#taxop-family');
        const nameInput = modal.querySelector('#taxop-name');
        const descInput = modal.querySelector('#taxop-description');
        if (familySel) familySel.value = payload.family || '';
        if (nameInput) nameInput.value = payload.name || '';
        if (descInput) descInput.value = payload.description || '';
      } else if (op === 'rename') {
        const targetKind = modal.querySelector('#taxop-target-kind');
        const targetInput = modal.querySelector('#taxop-target');
        const newNameInput = modal.querySelector('#taxop-new-name');
        if (targetKind) targetKind.value = payload.target_kind || '';
        if (targetInput) targetInput.value = payload.target || '';
        if (newNameInput) newNameInput.value = payload.new_name || '';
      } else if (op === 'other') {
        const detailsInput = modal.querySelector('#taxop-details');
        if (detailsInput) detailsInput.value = payload.details || '';
      }

      wireCreditConsent(modal);
      wireEditSubmit(modal, row, kind, 'taxonomy_change', op);

      const cancelBtn = modal.querySelector('#suggest-form-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);

    } else if (kind === 'tool_placement') {
      // Build a synthetic tool object from the payload
      const current = payload.current || {};
      const tool = {
        name: row.tool_slug || 'this tool',
        slug: row.tool_slug || '',
        category: current.category || '',
        subcategory: current.subcategory || '',
        tags: current.tags || [],
      };
      const modal = mountAndOpen('Edit suggestion: move/re-tag', renderMoveRetagForm(tool, taxonomy, user));

      const rationaleInput = modal.querySelector('#suggest-retag-rationale');
      const creditNameInput = modal.querySelector('#suggest-credit-name');
      const publicCreditBox = modal.querySelector('#suggest-public-credit');
      if (rationaleInput) rationaleInput.value = row.rationale || '';
      if (creditNameInput) creditNameInput.value = row.credit_name || '';
      if (publicCreditBox) publicCreditBox.checked = row.public_credit !== false;

      wireCreditConsent(modal);
      // Wire type-ahead pickers (must run before wireEditSubmit so hidden inputs exist)
      wireSubcategoryTypeahead(modal, taxonomy);
      wireTagTypeahead(modal, taxonomy, tool);
      wireEditSubmit(modal, row, kind, 'tool_placement', null, tool);

      const cancelBtn = modal.querySelector('#suggest-form-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);

    } else if (kind === 'tool_edit') {
      // Build synthetic tool from payload.changes + original
      const orig = payload.original || {};
      const tool = {
        name: row.tool_slug || '',
        slug: row.tool_slug || '',
        desc: orig.description || '',
        url: orig.website || '',
        github_url: orig.github_url || '',
        type: orig.type || '',
        pricing_model: orig.pricing_model || '',
      };
      const modal = mountAndOpen('Edit suggestion: ' + (tool ? escapeHtml(tool.name) : 'tool'), renderFixDetailsForm(tool, user));

      // Prefill with proposed (edited) values if present
      const proposed = payload.edited || payload.changes || {};
      const descInput = modal.querySelector('#fix-description');
      const websiteInput = modal.querySelector('#fix-website');
      const githubInput = modal.querySelector('#fix-github-url');
      const rationaleInput = modal.querySelector('#fix-rationale');
      const creditNameInput = modal.querySelector('#suggest-credit-name');
      const publicCreditBox = modal.querySelector('#suggest-public-credit');

      if (descInput && proposed.description) descInput.value = proposed.description;
      if (websiteInput && proposed.website) websiteInput.value = proposed.website;
      if (githubInput && proposed.github_url) githubInput.value = proposed.github_url;
      if (rationaleInput) rationaleInput.value = row.rationale || '';
      if (creditNameInput) creditNameInput.value = row.credit_name || '';
      if (publicCreditBox) publicCreditBox.checked = row.public_credit !== false;

      wireCreditConsent(modal);
      wireEditSubmit(modal, row, kind, 'tool_edit', null, tool);

      const cancelBtn = modal.querySelector('#suggest-form-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);
    } else {
      // Unknown kind — fallback to a simple info modal
      const modal = mountAndOpen('Edit suggestion', `<p class="suggest-hint">Editing is not supported for this suggestion type (${escapeHtml(kind)}).</p><div class="suggest-form-actions"><button class="suggest-btn" type="button" id="suggest-form-cancel">Close</button></div>`);
      const cancelBtn = modal.querySelector('#suggest-form-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', close);
    }
  }

  // Wire edit form submit — calls updateMySuggestion (UPDATE, not INSERT; never capped)
  function wireEditSubmit(modal, row, kind, formKind, op, tool) {
    // Determine the form element to listen on
    const formIds = {
      new_tool: '#suggest-new-tool-form',
      taxonomy_change: '#suggest-taxonomy-form',
      tool_placement: '#suggest-move-retag-form',
      tool_edit: '#suggest-fix-details-form',
    };
    const formId = formIds[formKind] || '#suggest-new-tool-form';
    const form = modal.querySelector(formId);
    if (!form) return;

    // Remove any previously attached submit handlers by replacing with a clone
    // (avoids duplicate submit handlers from the original wire functions which we did NOT call)
    // We simply add our own listener; the forms don't have other listeners at this point.

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const public_credit = form.querySelector('#suggest-public-credit')?.checked ?? true;
      const credit_name = public_credit
        ? (form.querySelector('#suggest-credit-name')?.value.trim().slice(0, 40) || '')
        : null;

      // Build patch
      let patch = {
        credit_name: credit_name || null,
        public_credit,
      };

      if (formKind === 'new_tool') {
        const name = form.querySelector('#suggest-name')?.value.trim() || '';
        const website = form.querySelector('#suggest-website')?.value.trim() || '';
        const description = form.querySelector('#suggest-description')?.value.trim() || '';
        const rationale = form.querySelector('#suggest-rationale')?.value.trim() || '';
        const track = form.querySelector('#suggest-track')?.value || null;
        const category = form.querySelector('#suggest-category')?.value || null;
        const subcategory = form.querySelector('#suggest-subcategory')?.value || null;
        const tags = Array.from(form.querySelectorAll('input[name="tag"]:checked')).map(i => i.value);
        const type = form.querySelector('#suggest-type')?.value || null;
        const pricing_model = form.querySelector('#suggest-pricing-model')?.value || null;

        if (!name || !website || !description) {
          showError(modal, 'Name, website, and description are required.');
          return;
        }

        let payload;
        try {
          payload = window.SuggestLogic.buildPayload('new_tool', {
            name, website, description,
            placementProvided: !!(track && subcategory),
            track, category, subcategory,
            tags, type, pricing_model, notes: null
          });
        } catch (err) {
          showError(modal, "Couldn't prepare your suggestion — please check your inputs and try again.");
          return;
        }
        patch.payload = payload;
        patch.rationale = rationale || null;

      } else if (formKind === 'taxonomy_change') {
        const rationale = (form.querySelector('#taxop-rationale')?.value || '').trim();
        if (!rationale) {
          showError(modal, 'Rationale is required.');
          return;
        }
        let payload = { op: op || 'other' };
        if (op === 'add_subcategory') {
          payload.parent_category = form.querySelector('#taxop-parent-category')?.value || '';
          payload.name = form.querySelector('#taxop-name')?.value.trim() || '';
          payload.description = form.querySelector('#taxop-description')?.value.trim() || '';
        } else if (op === 'add_category') {
          payload.track = form.querySelector('#taxop-track')?.value || '';
          payload.name = form.querySelector('#taxop-name')?.value.trim() || '';
          payload.description = form.querySelector('#taxop-description')?.value.trim() || '';
        } else if (op === 'add_tag') {
          payload.family = form.querySelector('#taxop-family')?.value || '';
          payload.name = form.querySelector('#taxop-name')?.value.trim() || '';
          payload.description = form.querySelector('#taxop-description')?.value.trim() || '';
        } else if (op === 'rename') {
          payload.target_kind = form.querySelector('#taxop-target-kind')?.value || '';
          payload.target = form.querySelector('#taxop-target')?.value.trim() || '';
          payload.new_name = form.querySelector('#taxop-new-name')?.value.trim() || '';
        } else if (op === 'other') {
          payload.details = form.querySelector('#taxop-details')?.value.trim() || '';
        }
        patch.payload = payload;
        patch.rationale = rationale;

      } else if (formKind === 'tool_placement') {
        const rationale = (form.querySelector('#suggest-retag-rationale')?.value || '').trim();
        if (!rationale) {
          showError(modal, 'Rationale is required.');
          return;
        }
        // TODO: this placement-value reading (subcategory + tagsAdd/tagsRemove + new-tag slugs) is duplicated in wireEditSubmit; extract a shared readPlacementFormValues(form, tool) helper.
        // Read subcategory from hidden input (set by wireSubcategoryTypeahead)
        const hiddenSub = form.querySelector('#suggest-new-subcategory');
        const proposedSubcategory = hiddenSub ? hiddenSub.value : '';
        const proposedCategory = hiddenSub ? (hiddenSub.dataset.category || '') : '';
        // Read tags from hidden inputs (set by wireTagTypeahead)
        const currentTool = tool || {};
        const currentTagsList = currentTool.tags || [];
        const selectedTagSlugs = Array.from(form.querySelectorAll('input[name="selected_tag"]')).map(i => i.value);
        const newTagNamesEdit = Array.from(form.querySelectorAll('input[name="new_tag"]')).map(i => i.value);
        const selectedExistingAddsEdit = selectedTagSlugs.filter(s => !currentTagsList.includes(s));
        const newSlugsEdit = newTagNamesEdit.map(n => window.SuggestLogic.slugify(n)).filter(Boolean);
        const tagsAdd = [...new Set([...selectedExistingAddsEdit, ...newSlugsEdit])];
        const tagsRemove = currentTagsList.filter(s => !selectedTagSlugs.includes(s));
        const current = {
          category: currentTool.category || '',
          subcategory: currentTool.subcategory || '',
          tags: currentTagsList,
        };
        const proposed = {
          category: proposedCategory || current.category,
          subcategory: proposedSubcategory || current.subcategory,
          tags_add: tagsAdd,
          tags_remove: tagsRemove,
        };
        let payload;
        try {
          payload = window.SuggestLogic.buildPayload('tool_placement', { current, proposed });
        } catch (err) {
          showError(modal, "Couldn't prepare your suggestion — please check your inputs and try again.");
          return;
        }
        patch.payload = payload;
        patch.rationale = rationale;

      } else if (formKind === 'tool_edit') {
        const t = tool || {};
        const original = {
          description: t.desc || t.description || '',
          website: t.url || t.website || '',
          github_url: t.github_url || '',
        };
        const edited = {
          description: (form.querySelector('#fix-description')?.value || '').trim(),
          website: (form.querySelector('#fix-website')?.value || '').trim(),
          github_url: (form.querySelector('#fix-github-url')?.value || '').trim(),
        };
        let payload;
        try {
          payload = window.SuggestLogic.buildPayload('tool_edit', { original, edited });
        } catch (err) {
          showError(modal, "Couldn't prepare your suggestion — please check your inputs and try again.");
          return;
        }
        if (!payload.changes || Object.keys(payload.changes).length === 0) {
          showError(modal, 'No changes detected — please modify at least one field.');
          return;
        }
        patch.payload = payload;
        patch.rationale = (form.querySelector('#fix-rationale')?.value || '').trim() || null;
      }

      const submitBtn = form.querySelector('#suggest-form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }

      try {
        const { error } = await window.SupabaseClient.updateMySuggestion(row.id, patch);

        if (error) {
          showError(modal, "Couldn't save your suggestion — please try again later.");
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save changes'; }
          return;
        }

        // Success
        const body = modal.querySelector('.suggest-modal-body');
        const titleEl = modal.querySelector('#suggest-modal-title');
        if (titleEl) titleEl.textContent = 'Suggestion updated!';
        if (body) {
          body.innerHTML = `
            <div class="suggest-success">
              <div class="suggest-success-icon">✓</div>
              <h3>Saved!</h3>
              <p>Your suggestion has been updated and is still pending review.</p>
              <a href="/my-suggestions.html">Back to My Suggestions</a>
            </div>
          `;
        }
      } catch (err) {
        showError(modal, "Couldn't save your suggestion — please try again later.");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save changes'; }
      }
    });

    // Rename submit button
    const submitBtn = form.querySelector('#suggest-form-submit');
    if (submitBtn) submitBtn.textContent = 'Save changes';
  }

  async function open({ mode = 'add', tool = null, trigger = null, suggestion = null } = {}) {
    // Phase-5: edit mode implementation
    if (mode === 'edit') {
      await openEditMode(suggestion, trigger);
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
      const modal = mountAndOpen('Suggest a taxonomy change', renderTaxonomyOpChooser());
      wireTaxonomyOpChooser(modal, taxonomy, user);
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
  // renderCreditConsent, renderPlacementSection, renderTagGroups are exposed so
  // Forms B/C/D (Phase 3.6) can reuse the shared credit-consent component
  // and placement helpers without reimplementing them.

  window.Suggest = {
    open,
    close,
    // Reusable components for Phase 3.6 forms:
    renderCreditConsent,
    renderPlacementSection,
    renderTagGroups,
  };

  // ---------------------------------------------------------------------------
  // Graceful degradation bootstrap
  // ---------------------------------------------------------------------------
  // Runs on DOMContentLoaded. If the suggestions table does not exist yet,
  // hides all entry points so the site looks exactly like pre-feature UI.
  // Uses a <html> class so that dynamically-generated .card-suggest elements
  // (added later by landscape.js) are also hidden via CSS.

  document.addEventListener('DOMContentLoaded', async function suggestBootstrap() {
    if (!window.SupabaseClient || typeof window.SupabaseClient.isSuggestionsAvailable !== 'function') return;

    const available = await window.SupabaseClient.isSuggestionsAvailable();

    if (!available) {
      // Mark root so CSS can hide dynamic .card-suggest elements
      document.documentElement.classList.add('suggestions-disabled');

      // Hide static entry points
      const suggestOpen = document.getElementById('suggest-open');
      if (suggestOpen) suggestOpen.style.display = 'none';

      const toolSuggestOpen = document.getElementById('tool-suggest-open');
      if (toolSuggestOpen) toolSuggestOpen.style.display = 'none';

      // Hide .card-suggest buttons already in the DOM (static)
      document.querySelectorAll('.card-suggest').forEach(el => { el.style.display = 'none'; });

      // Hide the "My Suggestions" link in the auth dropdown (if already rendered)
      document.querySelectorAll('a[href="/my-suggestions.html"]').forEach(el => { el.style.display = 'none'; });
    } else {
      document.documentElement.classList.add('suggestions-enabled');
    }
  });

})();
