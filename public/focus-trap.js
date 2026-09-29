/* Keyboard containment for modal dialogs.
   Without this, Tab walks straight out of an open dialog and into the page
   behind the scrim: the cursor is somewhere the user cannot see and Enter
   presses something they did not mean to press.

   One document-level handler rather than a copy inside each dialog, so every
   modal added later is covered by construction. It deliberately applies only
   to aria-modal dialogs: the assistant, the display panel and the cookie
   banner are non-modal popovers, and tabbing out of those to carry on reading
   the page is correct behaviour, not a bug. */
(function () {
  'use strict';

  var SELECTOR = '.modal:not([hidden]), [role="dialog"][aria-modal="true"]:not([hidden])';

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
    'summary', 'details', 'audio[controls]', 'video[controls]',
  ].join(',');

  function visible(el) {
    if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return false;
    // offsetParent is null for display:none; the rect covers visibility:hidden
    // and zero-size elements such as the visually hidden radio inputs.
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  /* The topmost open dialog: last in document order wins, which matches the
     order they stack, so a confirmation opened over a dialog owns the keys. */
  function active() {
    var all = Array.prototype.filter.call(document.querySelectorAll(SELECTOR), visible);
    return all.length ? all[all.length - 1] : null;
  }

  function stops(dialog) {
    return Array.prototype.filter.call(dialog.querySelectorAll(FOCUSABLE), visible);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;

    var dialog = active();
    if (!dialog) return;

    var items = stops(dialog);
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];
    var here = document.activeElement;

    // Focus escaped the dialog entirely (a click on the scrim, or a fresh
    // page state): pull it back to the first stop rather than letting Tab
    // continue from wherever the browser thinks it is.
    if (!dialog.contains(here)) {
      e.preventDefault();
      first.focus();
      return;
    }

    if (e.shiftKey && here === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && here === last) {
      e.preventDefault();
      first.focus();
    }
  }, true);
})();
