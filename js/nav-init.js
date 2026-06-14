// Canonical toolbar initializer. Wires the shared nav (_includes/nav.html):
//   - auth UI into #auth-container
//   - "+ Suggest" button → suggestion modal (built by suggest.js)
//   - Admin badge (hidden unless a signed-in admin)
// Single source of truth — loaded via _includes/nav-scripts.html on every page.
(function () {
  function initAuth() {
    if (window.AuthUI) window.AuthUI.init('auth-container');
  }

  function wireSuggest() {
    var btn = document.getElementById('suggest-open');
    if (btn && window.Suggest) {
      btn.hidden = false; // revealed only when the DB is healthy
      btn.addEventListener('click', function (e) {
        window.Suggest.open({ mode: 'add', trigger: e.currentTarget });
      });
    }
  }

  async function initAdminBadge() {
    if (!window.AdminAPI) return;
    try {
      var result = await window.AdminAPI.checkIsAdmin();
      if (!result || !result.isAdmin) return;
      var badge = document.getElementById('admin-badge');
      var countSpan = document.getElementById('admin-badge-count');
      if (!badge || !countSpan) return;
      var count = await window.AdminAPI.getPendingCount();
      if (count > 0) countSpan.textContent = '(' + count + ')';
      badge.classList.remove('hidden');
    } catch (_) { /* non-admin or offline — leave badge hidden */ }
  }

  async function init() {
    // auth-ui runs its own health check (so it can clear its spinner fast).
    initAuth();

    // Gate the DB-dependent toolbar items on a single health probe. The
    // "+ Suggest" button starts hidden (see _includes/nav.html) and the Admin
    // badge starts hidden; both are revealed only when the DB is reachable.
    // When unreachable, they stay hidden rather than opening a modal / loading
    // data that can't reach the database.
    if (!window.SupabaseClient) return;
    var healthy = await window.SupabaseClient.isDatabaseHealthy();
    if (!healthy) return;

    wireSuggest();
    initAdminBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
