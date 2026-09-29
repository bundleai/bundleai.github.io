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
  var MKEY = 'bundle.marketing';

  /* Every key this site is allowed to write, in one list. "Delete my data"
     walks THIS, not a prefix scan, so a key added without being documented in
     the cookie policy is a key that deletion would miss: the list is the
     thing that keeps the policy and the code honest about each other. */
  var OWNED = [
    'bundle.user', 'bundle.profile', 'bundle.profileDraft', 'bundle.holdings',
    'bundle.lessons', 'bundle.watchlist', 'bundle.pendingTrade',
    'bundle.navHintSeen', 'bundle.marketing', 'bundle.display', 'bundle.consent',
  ];

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

    /* Marketing consent is its own record with its own timestamp, separate
       from the account, so it can be evidenced and withdrawn on its own.
       An unticked box is stored as an explicit false, not as nothing. */
    marketingConsent: function () { return read(MKEY); },
    setMarketingConsent: function (on) {
      write(MKEY, { granted: !!on, at: Date.now() });
      document.dispatchEvent(new CustomEvent('bundle:marketing'));
      return read(MKEY);
    },

    holdings: function () { return read(HKEY) || []; },
    addHolding: function (h) {
      var all = Auth.holdings();
      var i = all.findIndex(function (x) { return x.id === h.id; });
      if (i > -1) {
        // A confirmed position (with amounts) supersedes the click-through
        // record written when someone merely opened the venue.
        if (!h.confirmed && all[i].confirmed) return all;
        all[i] = Object.assign({}, all[i], h);
      } else {
        all.push(h);
      }
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

    /* ---- Your data: portability and erasure ----
       Both are local and immediate, because the data is local. There is no
       server copy to request, queue or chase. */

    /** Everything this site holds about you, as a plain object. */
    exportData: function () {
      var out = {
        exported: new Date().toISOString(),
        note: 'Everything bundle.ai stores in this browser. It was never transmitted to Bundle.',
        data: {},
      };
      OWNED.forEach(function (k) {
        var v = read(k);
        if (v !== null) out.data[k] = v;
      });
      return out;
    },

    /** Which of the owned keys currently exist, for showing before deleting. */
    dataPresent: function () {
      return OWNED.filter(function (k) {
        try { return localStorage.getItem(k) !== null; } catch (e) { return false; }
      });
    },

    /**
     * Erase. `keepConsent` leaves the cookie answer and display preferences
     * in place, so someone deleting their account is not handed the banner
     * again as if they were new; passing false wipes those too.
     */
    eraseAll: function (keepConsent) {
      var spare = keepConsent === false ? [] : ['bundle.consent', 'bundle.display'];
      var removed = [];
      OWNED.forEach(function (k) {
        if (spare.indexOf(k) > -1) return;
        try {
          if (localStorage.getItem(k) !== null) removed.push(k);
          localStorage.removeItem(k);
        } catch (e) { }
      });
      document.dispatchEvent(new CustomEvent('bundle:auth'));
      document.dispatchEvent(new CustomEvent('bundle:erased', { detail: removed }));
      return removed;
    },

    ownedKeys: function () { return OWNED.slice(); },
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
