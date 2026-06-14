// My Suggestions page logic
// =========================
// Depends on: window.SupabaseClient, window.AuthSignIn, window.Suggest

(function () {
  'use strict';

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  function showToast(toast, message, type) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
  }

  // Status chip HTML
  function statusChip(status) {
    const chips = {
      pending: '<span class="status-badge pending">Pending</span>',
      approved: '<span class="status-badge approved">Approved</span>',
      applied: '<span class="status-badge applied">Applied ✓ on the map</span>',
      rejected: '<span class="status-badge rejected">Not accepted</span>',
    };
    return chips[status] || '<span class="status-badge pending">' + escapeHtml(status) + '</span>';
  }

  // Kind label
  function kindLabel(kind) {
    const labels = {
      new_tool: 'New Tool',
      taxonomy_change: 'Taxonomy Change',
      tool_placement: 'Move / Re-tag',
      tool_edit: 'Fix Details',
    };
    return labels[kind] || escapeHtml(kind || 'Suggestion');
  }

  // One-line summary from a suggestion row
  function rowSummary(row) {
    if (!row) return '';
    const p = row.payload || {};
    if (row.kind === 'new_tool') return p.name || p.slug || 'New tool';
    if (row.kind === 'taxonomy_change') return p.name || p.target || p.op || 'Taxonomy change';
    if (row.kind === 'tool_placement') return (row.tool_slug ? row.tool_slug + ': ' : '') + 'placement change';
    if (row.kind === 'tool_edit') return (row.tool_slug ? row.tool_slug + ': ' : '') + 'detail fix';
    return row.tool_slug || 'Suggestion';
  }

  // Render a single suggestion card
  function renderCard(row, onEdit, onWithdraw) {
    const card = document.createElement('div');
    card.className = 'review-card suggestion-card';
    card.dataset.id = row.id;

    const date = new Date(row.updated_at || row.created_at)
      .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    let actionsHtml = '';
    if (row.status === 'pending') {
      actionsHtml = `
        <div class="suggestion-actions">
          <button class="btn btn-sm btn-ghost suggestion-edit-btn" data-id="${escapeHtml(String(row.id))}">Edit</button>
          <button class="btn btn-sm btn-danger suggestion-withdraw-btn" data-id="${escapeHtml(String(row.id))}">Withdraw</button>
        </div>
      `;
    }

    let rejectedNote = '';
    if (row.status === 'rejected') {
      const note = row.admin_note
        ? escapeHtml(row.admin_note)
        : 'No reason provided';
      rejectedNote = `<p class="suggestion-note"><strong>Note from admin:</strong> ${note}</p>`;
    }

    card.innerHTML = `
      <div class="review-card-header">
        <div class="review-tool-info">
          <strong class="tool-name">${escapeHtml(kindLabel(row.kind))}</strong>
          <span class="tool-category">${escapeHtml(rowSummary(row))}</span>
        </div>
        <div class="review-meta">
          ${statusChip(row.status)}
          <span class="review-date">${escapeHtml(date)}</span>
        </div>
      </div>
      <div class="review-card-body">
        ${rejectedNote}
        ${actionsHtml}
      </div>
    `;

    // Wire edit / withdraw
    const editBtn = card.querySelector('.suggestion-edit-btn');
    const withdrawBtn = card.querySelector('.suggestion-withdraw-btn');
    if (editBtn) editBtn.addEventListener('click', () => onEdit(row));
    if (withdrawBtn) withdrawBtn.addEventListener('click', () => onWithdraw(row.id));

    return card;
  }

  // Main page init
  async function init() {
    const loginRequired = document.getElementById('login-required');
    const loadingState = document.getElementById('loading-state');
    const mainContent = document.getElementById('main-content');
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const suggestionList = document.getElementById('suggestion-list');
    const emptyState = document.getElementById('empty-state');
    const emptyMessage = document.getElementById('empty-message');
    const toast = document.getElementById('toast');

    function justSignedIn() {
      const hash = window.location.hash;
      return hash.includes('access_token') || hash.includes('type=recovery');
    }

    // Render sign-in card
    if (loginRequired && window.AuthSignIn) {
      loginRequired.innerHTML = window.AuthSignIn.renderCard({
        title: 'Sign in required',
        description: 'Sign in to view and manage your submitted suggestions.'
      });
      window.AuthSignIn.initHandlers(loginRequired, (errorMsg) => {
        showToast(toast, errorMsg, 'error');
      });
    }

    // Auth check
    const justLoggedIn = justSignedIn();
    if (justLoggedIn) {
      await window.SupabaseClient.getSession();
      history.replaceState(null, '', window.location.pathname);
    }

    const user = await window.SupabaseClient.getCurrentUser();
    if (loadingState) loadingState.classList.add('hidden');

    if (!user) {
      if (loginRequired) loginRequired.classList.remove('hidden');
      return;
    }

    if (justLoggedIn) {
      showToast(toast, 'Signed in as ' + (user?.user_metadata?.user_name || user?.email), 'success');
    }

    if (userInfo) {
      userInfo.textContent = user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || '';
    }
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (mainContent) mainContent.classList.remove('hidden');

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await window.SupabaseClient.signOut();
        window.location.reload();
      });
    }

    // Check availability before loading (graceful degradation)
    const available = window.SupabaseClient.isSuggestionsAvailable
      ? await window.SupabaseClient.isSuggestionsAvailable()
      : true;

    if (!available) {
      if (suggestionList) suggestionList.innerHTML = '';
      if (emptyMessage) emptyMessage.textContent = "Suggestions aren't available yet.";
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    // Load suggestions
    await loadSuggestions(suggestionList, emptyState, emptyMessage, toast);
  }

  async function loadSuggestions(list, emptyState, emptyMessage, toast) {
    if (!list) return;
    list.innerHTML = '<div class="loading-inline"><div class="spinner-small"></div><span>Loading suggestions…</span></div>';
    if (emptyState) emptyState.classList.add('hidden');

    const { data, error } = await window.SupabaseClient.listMySuggestions();

    list.innerHTML = '';

    if (error) {
      // Check if this is a table-missing error (42P01 or PGRST205) — show calm state
      const msg = error.message || error.code || '';
      const tableMissing = msg.includes('42P01') || msg.includes('PGRST205') || msg.includes('not found in schema');
      if (tableMissing) {
        if (emptyMessage) emptyMessage.textContent = "Suggestions aren't available yet.";
        if (emptyState) emptyState.classList.remove('hidden');
      } else {
        list.innerHTML = '<p class="error">Failed to load suggestions. Please try again later.</p>';
      }
      return;
    }

    if (!data || data.length === 0) {
      if (emptyMessage) emptyMessage.textContent = "You haven't submitted any suggestions yet.";
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    for (const row of data) {
      const card = renderCard(
        row,
        (row) => handleEdit(row, list, emptyState, emptyMessage, toast),
        (id) => handleWithdraw(id, list, emptyState, emptyMessage, toast)
      );
      list.appendChild(card);
    }
  }

  function handleEdit(row, list, emptyState, emptyMessage, toast) {
    if (!window.Suggest) {
      showToast(toast, 'Suggest module not available.', 'error');
      return;
    }
    window.Suggest.open({ mode: 'edit', suggestion: row });
  }

  async function handleWithdraw(id, list, emptyState, emptyMessage, toast) {
    if (!window.confirm('Withdraw this suggestion? This cannot be undone.')) return;
    const { error } = await window.SupabaseClient.withdrawSuggestion(id);
    if (error) {
      showToast(toast, 'Failed to withdraw: ' + (error.message || 'Unknown error'), 'error');
      return;
    }
    showToast(toast, 'Suggestion withdrawn.', 'success');
    // Reload list
    await loadSuggestions(list, emptyState, emptyMessage, toast);
  }

  // Run on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

  window.MySuggestions = { init };
})();
