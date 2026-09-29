/* Bundle display preferences.
   Every option here is OFF by default, so the site renders exactly as designed
   until someone asks for a change. Each preference is a data-attribute on
   <html>; the CSS that reacts to it lives in global.css under one guarded
   block, which is why turning everything off leaves no trace in the cascade.
   The values are applied in an inline <head> script too, so a returning
   visitor never sees the default styling flash before their choice lands. */
(function () {
  'use strict';

  var KEY = 'bundle.display';

  var OPTS = {
    text:     { attr: 'data-a11y-text',     values: ['default', 'large', 'xlarge'] },
    motion:   { attr: 'data-a11y-motion',   values: ['default', 'reduce'] },
    contrast: { attr: 'data-a11y-contrast', values: ['default', 'high'] },
    links:    { attr: 'data-a11y-links',    values: ['default', 'underline'] },
    tape:     { attr: 'data-a11y-tape',     values: ['default', 'pause'] },
  };

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function apply(prefs) {
    var root = document.documentElement;
    Object.keys(OPTS).forEach(function (k) {
      var o = OPTS[k];
      var v = prefs[k];
      if (v && v !== 'default' && o.values.indexOf(v) > -1) root.setAttribute(o.attr, v);
      else root.removeAttribute(o.attr);
    });
  }

  var A11y = {
    get: read,
    set: function (key, value) {
      if (!OPTS[key]) return read();
      var prefs = read();
      prefs[key] = value;
      try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { }
      apply(prefs);
      document.dispatchEvent(new CustomEvent('bundle:display', { detail: prefs }));
      return prefs;
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { }
      apply({});
      document.dispatchEvent(new CustomEvent('bundle:display', { detail: {} }));
      paint();
    },
    apply: apply,
  };

  window.BundleA11y = A11y;

  /* ---------------- panel ---------------- */

  var panel = null;
  var launch = null;
  var lastFocus = null;

  function paint() {
    if (!panel) return;
    var prefs = read();
    panel.querySelectorAll('[data-a11y-opt]').forEach(function (input) {
      var key = input.getAttribute('data-a11y-opt');
      var val = input.getAttribute('data-a11y-val');
      var current = prefs[key] || 'default';
      if (input.type === 'checkbox') input.checked = current === val;
      else if (input.type === 'radio') input.checked = current === val;
    });
  }

  function open() {
    if (!panel) return;
    lastFocus = document.activeElement;
    panel.hidden = false;
    launch.setAttribute('aria-expanded', 'true');
    paint();
    var first = panel.querySelector('input, button');
    if (first) first.focus();
  }

  function close() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    launch.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function init() {
    panel = document.getElementById('a11y-panel');
    launch = document.getElementById('a11y-launch');
    if (!panel || !launch) return;

    launch.addEventListener('click', function () {
      if (panel.hidden) open(); else close();
    });

    panel.addEventListener('change', function (e) {
      var input = e.target.closest('[data-a11y-opt]');
      if (!input) return;
      var key = input.getAttribute('data-a11y-opt');
      var val = input.getAttribute('data-a11y-val');
      if (input.type === 'checkbox') A11y.set(key, input.checked ? val : 'default');
      else A11y.set(key, val);
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('[data-a11y-reset]')) A11y.reset();
      if (e.target.closest('[data-a11y-close]')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    /* Clicking away closes it, the same as the nav menus. */
    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (e.target.closest('#a11y-panel') || e.target.closest('#a11y-launch')) return;
      close();
    });

    /* The same controls appear on /accessibility, in the page itself rather
       than the floating panel, and stay in step with it. */
    document.addEventListener('bundle:display', function () {
      document.querySelectorAll('[data-a11y-mirror]').forEach(function (host) {
        var prefs = read();
        host.querySelectorAll('[data-a11y-opt]').forEach(function (input) {
          var key = input.getAttribute('data-a11y-opt');
          var val = input.getAttribute('data-a11y-val');
          input.checked = (prefs[key] || 'default') === val;
        });
      });
      paint();
    });

    document.querySelectorAll('[data-a11y-mirror]').forEach(function (host) {
      host.addEventListener('change', function (e) {
        var input = e.target.closest('[data-a11y-opt]');
        if (!input) return;
        var key = input.getAttribute('data-a11y-opt');
        var val = input.getAttribute('data-a11y-val');
        if (input.type === 'checkbox') A11y.set(key, input.checked ? val : 'default');
        else A11y.set(key, val);
      });
      host.addEventListener('click', function (e) {
        if (e.target.closest('[data-a11y-reset]')) A11y.reset();
      });
      var prefs = read();
      host.querySelectorAll('[data-a11y-opt]').forEach(function (input) {
        var key = input.getAttribute('data-a11y-opt');
        var val = input.getAttribute('data-a11y-val');
        input.checked = (prefs[key] || 'default') === val;
      });
    });

    apply(read());
    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
