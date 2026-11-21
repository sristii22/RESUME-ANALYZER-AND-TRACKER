/*
 * auth-guard.js: sends visitors to login.html until they have signed in.
 * Add it in the <head> of every protected page:
 *   <script src="js/auth-guard.js"></script>
 *
 * • With the Node backend (npm start → localhost:3000) it asks /api/auth/me.
 * • With VS Code Live Server (no backend) it checks the demo sign-in saved by login.html.
 * It also adds a "Sign out" button to the sidebar.
 */
(function () {
  var KEY = 'ot_demo_user';
  var LOGIN = 'login.html';
  var root = document.documentElement;

  // Hide the page until we know the visitor is signed in (no flash of the dashboard)
  root.style.visibility = 'hidden';

  function storedUser() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || 'null');
    } catch (e) {
      return null;
    }
  }
  function clearStored() {
    try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {}
  }
  function toLogin() {
    location.replace(LOGIN);
  }
  function show(user) {
    root.style.visibility = '';
    var ready = function () { addSignOut(user); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
    else ready();
  }

  fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
    .then(function (r) {
      if (r.ok) return r.json().then(function (d) { show(d.user); });
      if (r.status === 401) { clearStored(); return toLogin(); }
      throw new Error('no backend'); // e.g. 404 on Live Server
    })
    .catch(function () {
      var u = storedUser();
      if (u) show(u); else toLogin();
    });

  // Sign out (works with or without the backend)
  window.otSignOut = function () {
    clearStored();
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
      .catch(function () {})
      .then(function () { location.replace(LOGIN); });
  };

  function addSignOut(user) {
    var footer = document.querySelector('.sidebar-footer');
    if (!footer || document.getElementById('ot-signout')) return;

    if (user && user.name) {
      var nameEl = footer.querySelector('.user-info p');
      if (nameEl) nameEl.textContent = user.name;
    }

    var btn = document.createElement('button');
    btn.id = 'ot-signout';
    btn.type = 'button';
    btn.title = 'Sign out';
    btn.setAttribute('aria-label', 'Sign out');
    btn.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>' +
      '<span>Sign out</span>';
    btn.style.cssText =
      'margin-top:12px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;' +
      'padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.22);' +
      'background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.9);font:inherit;font-size:13px;' +
      'font-weight:600;cursor:pointer;transition:background .2s,border-color .2s;';
    btn.onmouseenter = function () { btn.style.background = 'rgba(255,255,255,0.18)'; };
    btn.onmouseleave = function () { btn.style.background = 'rgba(255,255,255,0.08)'; };
    btn.onclick = window.otSignOut;
    footer.appendChild(btn);
  }
})();
