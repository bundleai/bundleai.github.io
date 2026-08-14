/* Bundle client-side account simulation.
   This site is a static build: there is no server and no real authentication.
   Everything below lives in localStorage on this device so the product flow can
   be walked end to end. Nothing is transmitted. */
(function () {
  'use strict';

  var UKEY = 'bundle.user';
  var PKEY = 'bundle.profile';
  var DKEY = 'bundle.profileDraft';
  var HKEY = 'bundle.holdings';
  var LSKEY = 'bundle.lessons';

  function read(k) {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  function write(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { }
  }

  var Auth = {
    user: function () { return read(UKEY); },
    signedIn: function () { return !!read(UKEY); },

    signIn: function (email, name) {
      write(UKEY, { email: email, name: name || email.split('@')[0], since: Date.now() });
      // A profile completed before signing up gets promoted on the way in.
      var draft = read(DKEY);
      if (draft && !read(PKEY)) write(PKEY, draft);
      document.dispatchEvent(new CustomEvent('bundle:auth'));
      return Auth.user();
    },

    signOut: function () {
      try { localStorage.removeItem(UKEY); } catch (e) { }
      document.dispatchEvent(new CustomEvent('bundle:auth'));
    },

    profile: function () { return read(PKEY); },
    saveProfile: function (p) { write(PKEY, p); write(DKEY, p); },
    saveDraft: function (p) { write(DKEY, p); },
    draft: function () { return read(DKEY); },

    /* Academy progress. Completions are recorded on this device either way;
       signing in is what makes them portable, which is what the player says. */
    lessonsDone: function () { return read(LSKEY) || []; },
    lessonDone: function (slug) { return Auth.lessonsDone().indexOf(slug) >= 0; },
    completeLesson: function (slug) {
      var all = Auth.lessonsDone();
      if (all.indexOf(slug) < 0) {
        all.push(slug);
        write(LSKEY, all);
        document.dispatchEvent(new CustomEvent('bundle:lessons'));
      }
      return all;
    },

    holdings: function () { return read(HKEY) || []; },
    addHolding: function (h) {
      var all = Auth.holdings();
      if (all.some(function (x) { return x.id === h.id; })) return all;
      all.push(h);
      write(HKEY, all);
      return all;
    },

    /* Where to send someone after they sign in. */
    gateUrl: function (next) {
      return '/signup?next=' + encodeURIComponent(
        next || location.pathname + location.search + location.hash
      );
    },

    gateTo: function (next) {
      location.href = Auth.gateUrl(next);
    },
  };

  window.BundleAuth = Auth;

  var HINT = 'bundle.navHintSeen';

  /* Point a newly signed-in person at the Portfolio menu item, once ever.
     Clears on click, on reaching /portfolio, or after ten seconds. */
  function navHint() {
    if (!Auth.signedIn()) return;
    try { if (localStorage.getItem(HINT)) return; } catch (e) { return; }

    if (location.pathname.replace(/\/$/, '') === '/portfolio') return dismiss();

    var links = document.querySelectorAll('[data-nav-portfolio]');
    if (!links.length) return;
    links.forEach(function (el) { el.classList.add('nav-hint'); });

    links.forEach(function (el) {
      el.addEventListener('click', dismiss, { once: true });
    });
    setTimeout(dismiss, 10000);
  }

  function dismiss() {
    try { localStorage.setItem(HINT, '1'); } catch (e) { }
    document.querySelectorAll('.nav-hint').forEach(function (el) {
      el.classList.remove('nav-hint');
    });
  }

  /* Nav reflects signed-in state on every page. */
  function paintNav() {
    var signed = Auth.signedIn();
    document.querySelectorAll('[data-auth="out"]').forEach(function (el) { el.hidden = signed; });
    document.querySelectorAll('[data-auth="in"]').forEach(function (el) { el.hidden = !signed; });
    var u = Auth.user();
    if (u) {
      document.querySelectorAll('[data-auth-name]').forEach(function (el) { el.textContent = u.name; });
    }
    navHint();
  }

  Auth.dismissNavHint = dismiss;
  document.addEventListener('DOMContentLoaded', paintNav);
  document.addEventListener('bundle:auth', paintNav);
  if (document.readyState !== 'loading') paintNav();

  document.addEventListener('click', function (e) {
    var out = e.target.closest('[data-signout]');
    if (out) { e.preventDefault(); Auth.signOut(); location.href = '/'; }
  });
})();
