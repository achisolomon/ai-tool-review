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
      if (window.SupabaseClient && window.SupabaseClient.ensureSupabase) await window.SupabaseClient.ensureSupabase();
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
    initAuth();
    // No DB probe on load — content pages stay request-free. The + Suggest
    // button always shows; its modal lazy-loads Supabase and degrades
    // gracefully (auth gate / "unavailable") if the DB/CDN is down.
    wireSuggest();
    // Admin badge needs the DB, but only matters for a signed-in admin. Gate on
    // the cached session (localStorage, no network); only then check in the
    // background. Logged-out visitors trigger zero DB calls.
    if (window.SupabaseClient && window.SupabaseClient.getCachedSession &&
        window.SupabaseClient.getCachedSession()) {
      initAdminBadge();
    }
    // OAuth redirect: SIGNED_IN fires after the library processes the hash.
    // auth-ui.js dispatches this DOM event so we don't need to load the
    // library here (it's already loaded by the time the event fires).
    document.addEventListener('auth:statechange', function (e) {
      if (e.detail.event === 'SIGNED_IN') initAdminBadge();
      if (e.detail.event === 'SIGNED_OUT') {
        var badge = document.getElementById('admin-badge');
        if (badge) badge.classList.add('hidden');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
