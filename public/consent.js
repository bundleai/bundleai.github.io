/* Bundle cookie / storage consent.
   Bundle currently sets NO cookies at all: everything it remembers lives in
   this browser's localStorage, and the only third-party request any page makes
   is to Google Fonts. The banner therefore is not consent theatre for trackers
   that already fired; it records a decision this site honours BEFORE anything
   non-essential is ever added.
   Anything optional must ask BundleConsent.allows(...) first. Nothing in the
   codebase may read an optional category without going through here. */
(function () {
  'use strict';

  var KEY = 'bundle.consent';
  var VERSION = 1;

  /* Categories. `essential` is not a choice: it is the storage the product
     cannot work without (your saved plan, your holdings, this decision).
     It carries no identifiers and never leaves the device. */
  var OPTIONAL = ['analytics', 'personalisation'];

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return v && v.v === VERSION ? v : null;
    } catch (e) { return null; }
  }

  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { }
    document.dispatchEvent(new CustomEvent('bundle:consent', { detail: v }));
  }

  function decide(prefs) {
    var v = { v: VERSION, essential: true, ts: Date.now() };
    OPTIONAL.forEach(function (c) { v[c] = !!(prefs && prefs[c]); });
    write(v);
    hide();
    return v;
  }

  var Consent = {
    get: read,
    /* No record means no consent. Optional storage stays off until asked. */
    allows: function (cat) {
      if (cat === 'essential') return true;
      var v = read();
      return !!(v && v[cat]);
    },
    acceptAll: function () {
      var p = {};
      OPTIONAL.forEach(function (c) { p[c] = true; });
      return decide(p);
    },
    essentialOnly: function () { return decide({}); },
    set: decide,
    /* Withdrawing is exactly as easy as giving: the same panel, one click.
       Called by the footer's "Cookie preferences" control. */
    open: function () { show(true); },
    categories: OPTIONAL.slice(),
  };

  window.BundleConsent = Consent;

  /* ---------------- banner ---------------- */

  var el = null;
  var lastFocus = null;

  function find() {
    el = el || document.getElementById('cookie-banner');
    return el;
  }

  function show(manual) {
    var b = find();
    if (!b) return;
    lastFocus = document.activeElement;
    var v = read();
    // Re-opening from the footer shows the current answer, not a blank slate.
    b.querySelectorAll('input[data-consent-cat]').forEach(function (input) {
      var cat = input.getAttribute('data-consent-cat');
      input.checked = !!(v && v[cat]);
    });
    b.hidden = false;
    b.classList.toggle('is-manual', !!manual);
    if (manual) {
      // The detail block is display:none until expanded, and its checkboxes
      // come first in the DOM: focusing one of those silently does nothing
      // and leaves the keyboard stranded back on the footer link.
      var stops = b.querySelectorAll('button, input, a');
      for (var i = 0; i < stops.length; i++) {
        var el = stops[i];
        if (el.offsetWidth || el.offsetHeight || el.getClientRects().length) {
          el.focus();
          break;
        }
      }
    }
  }

  function hide() {
    var b = find();
    if (!b) return;
    b.hidden = true;
    b.classList.remove('is-manual');
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); lastFocus = null; }
  }

  function prefsFromForm() {
    var b = find();
    var p = {};
    if (!b) return p;
    b.querySelectorAll('input[data-consent-cat]').forEach(function (input) {
      p[input.getAttribute('data-consent-cat')] = input.checked;
    });
    return p;
  }

  function init() {
    var b = find();
    if (!b) return;

    b.addEventListener('click', function (e) {
      var act = e.target.closest('[data-consent-action]');
      if (!act) return;
      var a = act.getAttribute('data-consent-action');
      if (a === 'all') Consent.acceptAll();
      else if (a === 'essential') Consent.essentialOnly();
      else if (a === 'save') decide(prefsFromForm());
      else if (a === 'details') {
        var open = b.classList.toggle('show-detail');
        act.setAttribute('aria-expanded', String(open));
        act.textContent = open ? 'Hide detail' : 'Choose what to allow';
      }
    });

    // Escape closes the panel when it was opened deliberately from the footer.
    // On a first visit it leaves the banner up: no decision has been made yet,
    // and silently dismissing is not consent.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && b.classList.contains('is-manual')) hide();
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cookie-prefs]')) {
        e.preventDefault();
        Consent.open();
      }
    });

    if (!read()) show(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
