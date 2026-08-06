/* Bundle deal matching.
   Ranks the aggregated deal set against a saved investor profile, favouring
   the sectors and routes someone actually asked for and — deliberately — the
   ones that widen their spread rather than deepen it.

   This is a filter over public listings, not advice: every reason it gives is
   traceable to an answer the investor typed or a position they already hold.

   Usage: BundleMatch.rank(profile, holdings) -> [{ deal, score, reasons, blocked }] */
(function () {
  'use strict';

  /* Profile sector keys → the sector strings the venues actually use. */
  var SECTOR_MAP = {
    fintech: ['Fintech'],
    ai: ['AI', 'Data & AI', 'Robotics'],
    health: ['Biotech'],
    climate: ['Climate', 'Energy', 'Agritech'],
    consumer: ['Consumer'],
    saas: ['Data & AI'],
    proptech: [],
    other: [],
  };

  var ROUTE_OF = { crowdfunding: 'primary', secondary: 'secondary', 'pre-ipo': 'preipo' };
  var TYPE_LABEL = { crowdfunding: 'Crowdfunding', secondary: 'Secondary', 'pre-ipo': 'Pre-IPO' };
  var CATEGORY = { hnw: 'High-net-worth', soph: 'Sophisticated', restricted: 'Restricted', none: 'Not yet eligible' };

  function data() {
    var el = document.getElementById('bundle-deals');
    if (!el) return { deals: [], platforms: [] };
    try { return JSON.parse(el.textContent); } catch (e) { return { deals: [], platforms: [] }; }
  }

  function wantedSectors(profile) {
    var out = [];
    (profile.sectors || []).forEach(function (k) {
      (SECTOR_MAP[k] || []).forEach(function (s) { if (out.indexOf(s) < 0) out.push(s); });
    });
    return out;
  }

  function platformName(id, platforms) {
    for (var i = 0; i < platforms.length; i++) if (platforms[i].id === id) return platforms[i].name;
    return id;
  }

  function scoreOne(deal, profile, held, wants, openToAny) {
    var reasons = [];
    var s = 0;
    var blocked = false;
    var heldSectors = held.map(function (h) { return h.sector; });

    /* Eligibility first — an inaccessible deal is not a match at any score. */
    if (/accredited/i.test(deal.minTicket || '')) {
      if (profile.category === 'hnw' || profile.category === 'soph') {
        s += 1;
        reasons.push({ kind: 'access', text: 'Accredited access — your ' + (CATEGORY[profile.category] || '').toLowerCase() + ' category qualifies' });
      } else {
        blocked = true;
        reasons.push({ kind: 'block', text: 'Accredited investors only — you self-certified as ' + (CATEGORY[profile.category] || 'ineligible').toLowerCase() });
      }
    } else {
      s += 2;
      reasons.push({ kind: 'access', text: deal.minTicket + ' minimum — inside your usual cheque' });
    }

    /* Sectors they asked for */
    if (openToAny || wants.indexOf(deal.sector) >= 0) {
      s += 3;
      reasons.push({
        kind: 'sector',
        text: openToAny && wants.indexOf(deal.sector) < 0
          ? deal.sector + ' — you said you were open to anything'
          : deal.sector + ' — one of the sectors you picked',
      });
    }

    /* Diversification is the point: reward what widens the spread. */
    if (heldSectors.indexOf(deal.sector) < 0) {
      s += 2.5;
      reasons.push({
        kind: 'diversify',
        text: held.length
          ? 'Widens your spread — nothing in ' + deal.sector + ' yet'
          : 'Would be your first position, in ' + deal.sector,
      });
    } else {
      s -= 2.5;
      reasons.push({ kind: 'warn', text: 'You already hold ' + deal.sector + ' — this concentrates rather than spreads' });
    }

    /* Routes they picked */
    var route = ROUTE_OF[deal.type];
    if ((profile.products || []).indexOf(route) >= 0) {
      s += 2;
      reasons.push({ kind: 'route', text: TYPE_LABEL[deal.type] + ' — a route you asked to see' });
    }

    if (deal.closes) reasons.push({ kind: 'warn', text: 'Closing in ' + deal.closes });
    if (deal.trending) s += 0.5;

    return { deal: deal, score: s, reasons: reasons, blocked: blocked };
  }

  function rank(profile, held) {
    var d = data();
    held = held || [];
    if (!profile) return [];

    var heldIds = held.map(function (h) { return h.id; });
    var wants = wantedSectors(profile);
    var openToAny = (profile.sectors || []).indexOf('other') >= 0 || !(profile.sectors || []).length;

    return d.deals
      .filter(function (x) { return heldIds.indexOf(x.id) < 0; })
      .map(function (x) { return scoreOne(x, profile, held, wants, openToAny); })
      .sort(function (a, b) {
        if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
        return b.score - a.score;
      });
  }

  /* Which of their chosen sectors they hold nothing in — the gap worth filling. */
  function gaps(profile, held) {
    var heldSectors = (held || []).map(function (h) { return h.sector; });
    var out = [];
    (profile.sectors || []).forEach(function (k) {
      if (k === 'other') return;
      var venueSectors = SECTOR_MAP[k] || [];
      var covered = venueSectors.some(function (s) { return heldSectors.indexOf(s) >= 0; });
      if (!covered) out.push(k);
    });
    return out;
  }

  /* Reason display order: why it widens the spread first, then why it is
     relevant, then the mechanics. Callers should not re-derive this. */
  var PRIORITY = ['block', 'diversify', 'sector', 'route', 'access', 'warn'];

  function ordered(reasons) {
    return reasons.slice().sort(function (a, b) {
      return PRIORITY.indexOf(a.kind) - PRIORITY.indexOf(b.kind);
    });
  }

  window.BundleMatch = {
    rank: rank,
    ordered: ordered,
    gaps: gaps,
    data: data,
    platformName: platformName,
    typeLabel: function (t) { return TYPE_LABEL[t] || t; },
  };
})();
