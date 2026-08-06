/* Bundle portfolio view.
   Renders a saved investor profile as a live, adjustable plan: a health ring,
   what-if controls, a sector split, a build-out projection, the risks the plan
   carries and how to improve it.

   The controls re-run BundleWizard.analyse on every change, so the score,
   risks and suggestions here are the same logic the questionnaire uses — the
   two can't drift apart.

   Usage: BundlePortfolio.render(rootEl, profile, { onSave, holdings }) */
(function () {
  'use strict';

  var L = null; // BundleWizard.labels, resolved at render time

  var ASSET_MID = { u25: 12500, '25-100': 62500, '100-250': 175000, '250-1m': 625000, '1m+': 1500000 };
  var TICKET_MID = { u500: 300, '500-2k': 1250, '2-10k': 6000, '10k+': 15000 };
  var ANNUAL_MID = { u5k: 3000, '5-25k': 15000, '25-100k': 60000, '100k+': 150000 };
  var HORIZON = { u3: 'Under 3 years', '3-5': '3 – 5 years', '5-7': '5 – 7 years', '7+': '7 years or more' };
  var TICKET = { u500: 'Under £500', '500-2k': '£500 – £2,000', '2-10k': '£2,000 – £10,000', '10k+': '£10,000+' };
  var INVOLVE = { auto: 'Guided', mixed: 'Collaborative', self: 'Self-directed' };
  var SEIS = { yes: 'Prioritised', maybe: 'Show where it applies', no: 'Not relevant' };
  var CHART = ['#1f7a54', '#a8871f', '#2a6fb0', '#c2643c', '#0e9384', '#7a5aa6'];

  var ALL_SECTORS = [
    { v: 'fintech', t: 'Fintech' }, { v: 'ai', t: 'AI & deep tech' },
    { v: 'health', t: 'Health & biotech' }, { v: 'climate', t: 'Climate & energy' },
    { v: 'consumer', t: 'Consumer' }, { v: 'saas', t: 'Enterprise SaaS' },
    { v: 'proptech', t: 'Proptech' }, { v: 'other', t: 'Open' },
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    if (!n) return '—';
    return '£' + Math.round(n).toLocaleString('en-GB');
  }

  function scoreColour(score) {
    return score >= 80 ? 'var(--up)' : score >= 55 ? 'var(--sand)' : 'var(--down)';
  }

  /* ---------- pieces ---------- */

  function healthRing(a) {
    var R = 52, C = 2 * Math.PI * R;
    var len = (a.score / 100) * C;
    return '' +
      '<div class="pv-ring">' +
      '<svg viewBox="0 0 128 128" role="img" aria-label="Plan health ' + a.score + ' out of 100, ' + esc(a.grade) + '">' +
      '<circle cx="64" cy="64" r="' + R + '" fill="none" stroke="var(--chart-track)" stroke-width="11"/>' +
      '<circle class="pv-ring-fill" cx="64" cy="64" r="' + R + '" fill="none" stroke="' + scoreColour(a.score) + '"' +
      ' stroke-width="11" stroke-linecap="round" stroke-dasharray="' + len + ' ' + C + '"' +
      ' transform="rotate(-90 64 64)"/>' +
      '</svg>' +
      '<div class="pv-ring-mid"><span class="pv-ring-num" data-pv="score">' + a.score + '</span>' +
      '<span class="pv-ring-of">/100</span></div>' +
      '</div>' +
      '<p class="pv-ring-grade" data-pv="grade" style="color:' + scoreColour(a.score) + '">' + esc(a.grade) + '</p>';
  }

  function sectorDonut(p) {
    var secs = (p.sectors || []).slice(0, 6);
    if (!secs.length) {
      return '<p class="pv-empty">No sectors picked yet — add some below and the split appears here.</p>';
    }
    var R = 42, C = 2 * Math.PI * R, GAP = 2.5;
    var share = 100 / secs.length;
    var acc = 0;
    var arcs = secs.map(function (s, i) {
      var frac = 1 / secs.length;
      var len = Math.max(frac * C - GAP, 0.75);
      var off = -(acc * C + GAP / 2);
      acc += frac;
      return { label: (L.SECN[s] || s), colour: CHART[i], len: len, off: off };
    });
    return '' +
      '<div class="pv-donut">' +
      '<svg viewBox="0 0 110 110" role="img" aria-label="Even target split across ' + secs.length + ' sectors">' +
      arcs.map(function (x) {
        return '<circle cx="55" cy="55" r="' + R + '" fill="none" stroke="' + x.colour + '" stroke-width="13"' +
          ' stroke-dasharray="' + x.len + ' ' + C + '" stroke-dashoffset="' + x.off + '" transform="rotate(-90 55 55)"/>';
      }).join('') +
      '</svg>' +
      '<span class="pv-donut-mid"><b>' + secs.length + '</b><small>sectors</small></span>' +
      '</div>' +
      '<ul class="pv-legend">' +
      arcs.map(function (x) {
        return '<li><span class="pv-sw" style="background:' + x.colour + '"></span>' +
          '<span class="pv-lg-label">' + esc(x.label) + '</span>' +
          '<span class="pv-lg-val mono tabular">' + share.toFixed(0) + '%</span></li>';
      }).join('') +
      '</ul>';
  }

  function projection(p) {
    var perDeal = TICKET_MID[p.ticket] || 0;
    var annual = ANNUAL_MID[p.annual] || 0;
    var perYear = perDeal ? Math.max(1, Math.round(annual / perDeal)) : 0;
    if (!perYear) return '<p class="pv-empty">Set a cheque size and yearly budget to see the build-out.</p>';

    var years = Math.min(10, Math.max(1, Math.ceil(p.holdings / perYear)));
    var bars = [];
    for (var y = 1; y <= years; y++) {
      bars.push({ y: y, n: Math.min(p.holdings, perYear * y) });
    }
    var max = p.holdings;
    return '' +
      '<div class="pv-proj" role="img" aria-label="Positions held by year at your current pace">' +
      bars.map(function (b) {
        var h = Math.max(4, (b.n / max) * 100);
        var done = b.n >= max;
        return '<div class="pv-proj-col">' +
          '<span class="pv-proj-n">' + b.n + '</span>' +
          '<span class="pv-proj-bar" style="height:' + h + '%;background:' + (done ? 'var(--up)' : 'var(--c1)') + '"></span>' +
          '<span class="pv-proj-y">Y' + b.y + '</span></div>';
      }).join('') +
      '</div>' +
      '<p class="pv-note">About <strong>' + perYear + '</strong> deal' + (perYear === 1 ? '' : 's') +
      ' a year at ' + esc(TICKET[p.ticket] || '—') + ' — roughly <strong>' + years + ' year' +
      (years === 1 ? '' : 's') + '</strong> to reach ' + p.holdings + ' positions.</p>';
  }

  function coverage(p) {
    var rows = [
      ['Sectors', (p.sectors || []).length, (p.sectors || []).map(function (x) { return L.SECN[x] || x; })],
      ['Stages', (p.stages || []).length, (p.stages || []).map(function (x) { return L.STG[x] || x; })],
      ['Routes', (p.products || []).length, (p.products || []).map(function (x) { return L.PRN[x] || x; })],
    ];
    return rows.map(function (r) {
      var w = Math.min(100, (r[1] / 4) * 100);
      return '<div class="pv-cov"><div class="pv-cov-top"><span>' + r[0] + '</span>' +
        '<span class="mono tabular">' + r[1] + ' / 4</span></div>' +
        '<span class="pv-cov-track"><span style="width:' + w + '%"></span></span>' +
        '<p class="pv-cov-detail">' + (r[2].length ? esc(r[2].join(' · ')) : 'None picked') + '</p></div>';
    }).join('');
  }

  function riskList(a) {
    if (!a.risks.length) {
      return '<div class="pv-clear"><span class="pv-clear-tick">✓</span>' +
        '<span>No structural warnings on this plan. Market risk never goes away — you can still lose everything you put in.</span></div>';
    }
    return a.risks.map(function (r) {
      return '<div class="pv-risk ' + (r.level === 'bad' ? 'bad' : '') + '">' +
        '<span class="pv-risk-dot"></span><div><p class="pv-risk-t">' + esc(r.title) + '</p>' +
        '<p class="pv-risk-b">' + esc(r.body) + '</p></div></div>';
    }).join('');
  }

  function actionList(a) {
    return a.actions.map(function (t) {
      return '<li><span class="pv-tick"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" ' +
        'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 6.5 4.5 9.5 10.5 2.5"/></svg>' +
        '</span><span>' + esc(t) + '</span></li>';
    }).join('');
  }

  function holdingsList(held) {
    if (!held.length) {
      return '<p class="pv-empty">Nothing tracked yet. Pick a deal in the <a href="/deals">screener</a> and it appears here.</p>';
    }
    return held.map(function (h) {
      return '<div class="pv-hold"><div style="min-width:0"><div class="pv-hold-n">' + esc(h.name) + '</div>' +
        '<div class="pv-hold-m">' + esc(h.venue) + (h.sector ? ' · ' + esc(h.sector) : '') + '</div></div>' +
        (h.url ? '<a class="text-link small" href="' + esc(h.url) + '" target="_blank" rel="noopener noreferrer">Open ↗</a>' : '') +
        '</div>';
    }).join('');
  }

  /* Suggested deals, ranked by BundleMatch. Diversification reasons lead,
     because widening the spread is the thing the plan most often needs. */
  function fitList(p, held) {
    if (!window.BundleMatch) return '';
    var ranked = window.BundleMatch.rank(p, held).filter(function (r) { return !r.blocked; }).slice(0, 3);
    if (!ranked.length) {
      return '<p class="pv-empty">No open listings match your plan right now. Widen your sectors or routes above and they will appear here.</p>';
    }
    var pf = window.BundleMatch.data().platforms;
    return '<div class="pv-fits">' + ranked.map(function (r) {
      var d = r.deal;
      var reasons = window.BundleMatch.ordered(
        r.reasons.filter(function (x) { return x.kind !== 'warn' && x.kind !== 'block'; })
      ).slice(0, 2);
      var warn = r.reasons.filter(function (x) { return x.kind === 'warn'; })[0];
      return '<article class="pv-fit" data-trade data-deal-id="' + esc(d.id) + '" data-deal-name="' + esc(d.name) +
        '" data-deal-venue="' + esc(window.BundleMatch.platformName(d.platform, pf)) + '" data-deal-sector="' + esc(d.sector) +
        '" data-deal-url="' + esc(d.url) + '" role="button" tabindex="0" aria-label="Open ' + esc(d.name) + '">' +
        '<header class="pv-fit-head">' +
        '<span class="pv-fit-avatar" style="--h: var(--' + esc(d.hue) + ')">' +
        esc(d.name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2)) + '</span>' +
        '<span class="pv-fit-id"><span class="pv-fit-name">' + esc(d.name) + '</span>' +
        '<span class="pv-fit-sub">' + esc(d.sector) + ' · ' + esc(window.BundleMatch.typeLabel(d.type)) + '</span></span>' +
        '<span class="src-chip">' + esc(window.BundleMatch.platformName(d.platform, pf)) + '</span>' +
        '</header>' +
        '<ul class="pv-why">' +
        reasons.map(function (x) {
          return '<li class="' + (x.kind === 'diversify' ? 'div' : '') + '">' +
            '<span class="pv-why-dot"></span>' + esc(x.text) + '</li>';
        }).join('') +
        (warn ? '<li class="warn"><span class="pv-why-dot"></span>' + esc(warn.text) + '</li>' : '') +
        '</ul>' +
        '<footer class="pv-fit-foot"><span class="pv-fit-cta">Open on ' +
        esc(window.BundleMatch.platformName(d.platform, pf)) + ' ↗</span>' +
        '<span class="pv-fit-min mono">' + esc(d.minTicket) + '</span></footer>' +
        '</article>';
    }).join('') + '</div>' +
      '<a class="text-link small pv-fit-all" href="/deals?fit=1">See every deal ranked for your plan <span class="arrow">→</span></a>';
  }

  /* A plain-language nudge about the biggest gap in the plan. */
  function gapNudge(p, held) {
    if (!window.BundleMatch) return '';
    var g = window.BundleMatch.gaps(p, held);
    if (!g.length) return '';
    var names = g.map(function (k) { return L.SECN[k] || k; });
    var list = names.length === 1 ? names[0]
      : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    return '<div class="pv-nudge"><span class="pv-nudge-icon">◆</span><p>' +
      'You picked <strong>' + esc(list) + '</strong> but hold nothing there yet. ' +
      'Filling those gaps spreads your risk faster than adding to a sector you already own.' +
      '</p></div>';
  }

  /* ---------- main render ---------- */

  function render(root, profile, opts) {
    opts = opts || {};
    L = window.BundleWizard.labels;
    var p = JSON.parse(JSON.stringify(profile));
    var saved = JSON.stringify(profile);
    var held = opts.holdings || [];

    function analyse() { return window.BundleWizard.analyse(p); }

    function budget() {
      var assets = ASSET_MID[p.assets] || 0;
      return assets * (p.allocation / 100);
    }

    root.innerHTML =
      '<div class="pv">' +

      '<section class="pv-hero">' +
      '<div class="pv-hero-ring">' + healthRing(analyse()) + '</div>' +
      '<div class="pv-hero-copy">' +
      '<p class="eyebrow no-rule">Your portfolio plan</p>' +
      '<h2 class="h2 pv-h2">' + esc(L.RISKN[p.risk] || 'Balanced') + ', across <span data-pv="hcount">' +
      p.holdings + '</span> companies</h2>' +
      '<p class="pv-lede">Drag the controls to test a different shape. Everything below — the score, the risks, the suggestions — updates as you go.</p>' +
      '<div class="pv-kpis">' +
      '<div class="pv-kpi"><span class="pv-kpi-k">Private-markets budget</span><span class="pv-kpi-v" data-pv="budget">' + money(budget()) + '</span></div>' +
      '<div class="pv-kpi"><span class="pv-kpi-k">Per position</span><span class="pv-kpi-v" data-pv="each">' + money(budget() / p.holdings) + '</span></div>' +
      '<div class="pv-kpi"><span class="pv-kpi-k">Category</span><span class="pv-kpi-v">' + esc(L.LB[p.category] || '—') + '</span></div>' +
      '</div>' +
      '<div class="pv-hero-cta">' +
      '<a href="/deals?fit=1" class="btn btn-primary">Find deals that fit <span class="arrow">→</span></a>' +
      '<a href="/portfolio?edit=1" class="btn btn-ghost">Retake the questionnaire</a>' +
      '</div>' +
      '</div>' +
      '</section>' +

      '<section class="pv-controls card">' +
      '<div class="pv-ctl">' +
      '<label for="pv-holdings">Target companies <b data-pv="holdings-val">' + p.holdings + (p.holdings === 50 ? '+' : '') + '</b></label>' +
      '<input id="pv-holdings" type="range" min="1" max="50" value="' + p.holdings + '" data-pv-slider="holdings">' +
      '</div>' +
      '<div class="pv-ctl">' +
      '<label for="pv-alloc">Share of investable assets <b data-pv="alloc-val">' + p.allocation + '%</b></label>' +
      '<input id="pv-alloc" type="range" min="1" max="50" value="' + p.allocation + '" data-pv-slider="allocation">' +
      '</div>' +
      '<div class="pv-ctl pv-ctl-wide">' +
      '<span class="pv-ctl-label">Sectors you want to see</span>' +
      '<div class="pv-chips">' +
      ALL_SECTORS.map(function (o) {
        var on = (p.sectors || []).indexOf(o.v) >= 0;
        return '<button type="button" class="wz-chip' + (on ? ' sel' : '') + '" data-pv-sector="' + o.v + '">' + esc(o.t) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +
      '<div class="pv-save" data-pv="save-row" hidden>' +
      '<span class="pv-save-note">You have unsaved changes to your plan.</span>' +
      '<span class="pv-save-btns">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-pv-reset>Reset</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-pv-save>Save changes</button>' +
      '</span></div>' +
      '</section>' +

      '<section class="pv-fit-block" data-pv="fitblock">' +
      '<div class="pv-fit-head-row"><h3 class="pv-h3">Deals that fit your plan</h3>' +
      '<span class="badge badge-green">Matched to your answers</span></div>' +
      '<div data-pv="nudge">' + gapNudge(p, held) + '</div>' +
      '<div data-pv="fits">' + fitList(p, held) + '</div>' +
      '</section>' +

      '<div class="pv-grid">' +
      '<div class="pv-col">' +
      '<h3 class="pv-h3">Coverage</h3>' +
      '<div class="card pv-card" data-pv="coverage">' + coverage(p) + '</div>' +
      '<h3 class="pv-h3">Risks in this plan</h3>' +
      '<div data-pv="risks">' + riskList(analyse()) + '</div>' +
      '<h3 class="pv-h3">How to improve it</h3>' +
      '<ul class="check-list card pv-card" data-pv="actions">' + actionList(analyse()) + '</ul>' +
      '</div>' +

      '<div class="pv-col">' +
      '<h3 class="pv-h3">Target sector split</h3>' +
      '<div class="card pv-card pv-donut-card" data-pv="donut">' + sectorDonut(p) + '</div>' +
      '<p class="pv-cap">An even starting split across the sectors you picked — a guardrail, not a recommendation.</p>' +
      '<h3 class="pv-h3">Build-out at your pace</h3>' +
      '<div class="card pv-card" data-pv="projection">' + projection(p) + '</div>' +
      '<h3 class="pv-h3">The rest of your plan</h3>' +
      '<div class="card pv-card"><dl class="pv-dl">' +
      row('Primary goal', L.LB[p.goal] || '—') +
      row('Horizon', HORIZON[p.horizon] || '—') +
      row('Typical cheque', TICKET[p.ticket] || '—') +
      row('Involvement', INVOLVE[p.involvement] || '—') +
      row('SEIS / EIS', SEIS[p.seis] || '—') +
      '</dl></div>' +
      '<h3 class="pv-h3">Tracking</h3>' +
      '<div class="card pv-card" data-pv="holdings">' + holdingsList(held) + '</div>' +
      '</div>' +
      '</div>' +

      '</div>';

    function row(k, v) {
      return '<div class="pv-row"><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>';
    }

    var q = function (sel) { return root.querySelector(sel); };

    /* live recompute — cheap, patches only what changed */
    function refresh() {
      var a = analyse();
      var col = scoreColour(a.score);
      var R = 52, C = 2 * Math.PI * R;

      var fill = q('.pv-ring-fill');
      if (fill) {
        fill.setAttribute('stroke-dasharray', (a.score / 100) * C + ' ' + C);
        fill.setAttribute('stroke', col);
      }
      q('[data-pv="score"]').textContent = a.score;
      var g = q('[data-pv="grade"]');
      g.textContent = a.grade; g.style.color = col;

      q('[data-pv="hcount"]').textContent = p.holdings;
      q('[data-pv="holdings-val"]').textContent = p.holdings + (p.holdings === 50 ? '+' : '');
      q('[data-pv="alloc-val"]').textContent = p.allocation + '%';
      q('[data-pv="budget"]').textContent = money(budget());
      q('[data-pv="each"]').textContent = money(budget() / p.holdings);

      q('[data-pv="risks"]').innerHTML = riskList(a);
      q('[data-pv="actions"]').innerHTML = actionList(a);
      q('[data-pv="projection"]').innerHTML = projection(p);
      q('[data-pv="donut"]').innerHTML = sectorDonut(p);
      q('[data-pv="coverage"]').innerHTML = coverage(p);
      q('[data-pv="nudge"]').innerHTML = gapNudge(p, held);
      q('[data-pv="fits"]').innerHTML = fitList(p, held);

      var dirty = JSON.stringify(p) !== saved;
      q('[data-pv="save-row"]').hidden = !dirty;
      var shell = root.querySelector('.pv');
      if (shell) shell.classList.toggle('pv--dirty', dirty);
    }

    root.addEventListener('input', function (e) {
      var sl = e.target.closest('[data-pv-slider]');
      if (!sl) return;
      p[sl.getAttribute('data-pv-slider')] = +sl.value;
      refresh();
    });

    root.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-pv-sector]');
      if (chip) {
        var v = chip.getAttribute('data-pv-sector');
        p.sectors = p.sectors || [];
        var i = p.sectors.indexOf(v);
        if (i >= 0) p.sectors.splice(i, 1); else p.sectors.push(v);
        chip.classList.toggle('sel');
        return refresh();
      }
      if (e.target.closest('[data-pv-save]')) {
        saved = JSON.stringify(p);
        if (opts.onSave) opts.onSave(JSON.parse(saved));
        refresh();
        return;
      }
      if (e.target.closest('[data-pv-reset]')) {
        p = JSON.parse(saved);
        var hs = q('[data-pv-slider="holdings"]'); if (hs) hs.value = p.holdings;
        var as = q('[data-pv-slider="allocation"]'); if (as) as.value = p.allocation;
        root.querySelectorAll('[data-pv-sector]').forEach(function (c) {
          c.classList.toggle('sel', (p.sectors || []).indexOf(c.getAttribute('data-pv-sector')) >= 0);
        });
        return refresh();
      }
    });
  }

  window.BundlePortfolio = { render: render };
})();
