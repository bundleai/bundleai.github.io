/**
 * Post-trade capture.
 *
 * Clicking Trade sends someone to a third-party venue in a new tab. Bundle
 * never sees whether they went through with it, so when they come back we ask
 * once, and if they did invest we capture enough to make the dashboard real.
 *
 * Pending records live in localStorage and expire after 3 days so an abandoned
 * tab never nags forever.
 */
(function () {
  'use strict';

  var PKEY = 'bundle.pendingTrade';
  var MAX_AGE = 3 * 24 * 60 * 60 * 1000; // 3 days
  var SNOOZE = 24 * 60 * 60 * 1000;

  function read() {
    try { return JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch (e) { return null; }
  }
  function write(v) {
    try {
      if (v) localStorage.setItem(PKEY, JSON.stringify(v));
      else localStorage.removeItem(PKEY);
    } catch (e) { /* storage unavailable, the flow just degrades to nothing */ }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- recording the intent ---------- */

  var lastTrade = null;

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-trade]');
    if (!t) return;
    lastTrade = {
      id: t.getAttribute('data-deal-id') || '',
      name: t.getAttribute('data-deal-name') || 'this deal',
      venue: t.getAttribute('data-deal-venue') || 'the venue',
      sector: t.getAttribute('data-deal-sector') || '',
      url: t.getAttribute('data-deal-url') || '',
      currency: t.getAttribute('data-deal-currency') || '',
      price: parseFloat(t.getAttribute('data-deal-price') || '') || null,
    };
  }, true);

  // The venue can be opened straight away or after the profile modal, so hook
  // the actual navigation rather than the click.
  var nativeOpen = window.open;
  window.open = function (url) {
    if (lastTrade && url && url === lastTrade.url) {
      write({ deal: lastTrade, at: Date.now(), asked: 0 });
    }
    return nativeOpen.apply(window, arguments);
  };

  /* ---------- asking on return ---------- */

  var host = null;

  function close() {
    if (host) { host.remove(); host = null; }
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') { snooze(); }
  }
  function snooze() {
    var p = read();
    if (p) { p.asked = Date.now(); write(p); }
    close();
  }

  function ask(p) {
    var d = p.deal;
    host = document.createElement('div');
    host.className = 'tc-backdrop';
    host.innerHTML =
      '<div class="tc-modal" role="dialog" aria-modal="true" aria-labelledby="tc-title">' +
        '<button type="button" class="tc-x" data-act="snooze" aria-label="Close">×</button>' +
        '<div data-step="ask">' +
          '<p class="tc-eyebrow">Welcome back</p>' +
          '<h2 class="tc-title" id="tc-title">Did you invest in ' + esc(d.name) + '?</h2>' +
          '<p class="tc-sub">You opened this deal on ' + esc(d.venue) +
            '. Tell us how it went and we\'ll track the position in your portfolio. ' +
            'Bundle can\'t see your venue account, so this is the only way it shows up.</p>' +
          '<div class="tc-actions">' +
            '<button type="button" class="btn btn-primary" data-act="yes">Yes, I invested</button>' +
            '<button type="button" class="btn btn-ghost" data-act="snooze">Not yet</button>' +
            '<button type="button" class="btn btn-ghost" data-act="no">No, I passed</button>' +
          '</div>' +
        '</div>' +
        '<form data-step="form" hidden>' +
          '<p class="tc-eyebrow">Record your position</p>' +
          '<h2 class="tc-title">' + esc(d.name) + '</h2>' +
          '<div class="tc-grid">' +
            '<label class="tc-field"><span>Amount invested</span>' +
              '<input type="number" name="amount" min="0" step="any" required ' +
              'placeholder="' + esc(d.currency || '') + '0.00" /></label>' +
            '<label class="tc-field"><span>Price per share <i>optional</i></span>' +
              '<input type="number" name="price" min="0" step="any"' +
              (d.price ? ' value="' + d.price + '"' : '') + ' /></label>' +
            '<label class="tc-field"><span>Shares / units <i>optional</i></span>' +
              '<input type="number" name="shares" min="0" step="any" /></label>' +
            '<label class="tc-field"><span>Date</span>' +
              '<input type="date" name="date" /></label>' +
          '</div>' +
          '<div class="tc-actions">' +
            '<button type="submit" class="btn btn-primary">Save to my portfolio</button>' +
            '<button type="button" class="btn btn-ghost" data-act="snooze">Later</button>' +
          '</div>' +
          '<p class="tc-note">Stored in this browser only. Figures are yours to keep accurate, ' +
            'Bundle cannot verify them against the venue.</p>' +
        '</form>' +
        '<div data-step="done" hidden>' +
          '<p class="tc-eyebrow">Saved</p>' +
          '<h2 class="tc-title">' + esc(d.name) + ' is in your portfolio</h2>' +
          '<p class="tc-sub">You can edit or remove it any time from your dashboard.</p>' +
          '<div class="tc-actions">' +
            '<a class="btn btn-primary" href="/portfolio">Open my portfolio</a>' +
            '<button type="button" class="btn btn-ghost" data-act="close">Keep browsing</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(host);

    var modal = host.querySelector('.tc-modal');
    var stepAsk = host.querySelector('[data-step="ask"]');
    var form = host.querySelector('[data-step="form"]');
    var done = host.querySelector('[data-step="done"]');
    var dateInput = form.querySelector('input[name="date"]');
    dateInput.value = new Date().toISOString().slice(0, 10);

    modal.querySelector('.tc-x').focus();
    document.addEventListener('keydown', onKey);

    host.addEventListener('click', function (e) {
      if (e.target === host) { snooze(); return; }
      var act = e.target.closest('[data-act]');
      if (!act) return;
      var a = act.getAttribute('data-act');
      if (a === 'snooze') snooze();
      else if (a === 'close') { write(null); close(); }
      else if (a === 'no') { write(null); close(); }
      else if (a === 'yes') {
        stepAsk.hidden = true;
        form.hidden = false;
        form.querySelector('input[name="amount"]').focus();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = parseFloat(form.amount.value);
      if (!isFinite(amount) || amount <= 0) { form.amount.reportValidity(); return; }
      var price = parseFloat(form.price.value) || null;
      var shares = parseFloat(form.shares.value) || (price ? amount / price : null);

      var Auth = window.BundleAuth;
      if (Auth && Auth.addHolding) {
        Auth.addHolding({
          id: d.id, name: d.name, venue: d.venue, sector: d.sector, url: d.url,
          amount: amount, currency: d.currency || '', price: price, shares: shares,
          date: form.date.value || new Date().toISOString().slice(0, 10),
          confirmed: true, at: Date.now(),
        });
      }
      write(null);
      form.hidden = true;
      done.hidden = false;
      done.querySelector('.btn').focus();
      document.dispatchEvent(new CustomEvent('bundle:holding-added'));
    });
  }

  function maybeAsk() {
    if (host) return;
    var p = read();
    if (!p || !p.deal) return;
    if (Date.now() - p.at > MAX_AGE) { write(null); return; }
    if (p.asked && Date.now() - p.asked < SNOOZE) return;
    if (document.visibilityState !== 'visible') return;
    ask(p);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') setTimeout(maybeAsk, 600);
  });
  window.addEventListener('focus', function () { setTimeout(maybeAsk, 600); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(maybeAsk, 900); });
  } else {
    setTimeout(maybeAsk, 900);
  }
})();
