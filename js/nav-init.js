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

  function init() {
    // auth-ui runs its own health check so a dead DB can't hang its spinner.
    // The "+ Suggest" button / Admin badge are hidden by the suggest.js
    // bootstrap (suggestions-disabled) when the DB is unreachable.
    initAuth();
    wireSuggest();
    initAdminBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
