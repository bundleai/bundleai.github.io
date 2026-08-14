/* Bundle investor-profile wizard.
   One engine, two hosts: the /portfolio page and the deal-card modal.
   Ported from the Sample_Questionnaire spec onto the Bundle design system.

   Usage:  BundleWizard.mount(containerEl, { compact, onSave })
   Also exposes BundleWizard.analyse(profile) so /dashboard can reuse the
   same risk / diversification logic without duplicating it. */
(function () {
  'use strict';

  var LB = {
    hnw: 'High-net-worth', soph: 'Sophisticated', restricted: 'Restricted',
    none: 'Not yet eligible', growth: 'Capital growth', access: 'Access & learning',
    tax: 'Tax efficiency', diversify: 'Diversification',
  };
  var SECN = {
    fintech: 'Fintech', ai: 'AI & deep tech', health: 'Health & biotech',
    climate: 'Climate & energy', consumer: 'Consumer', saas: 'Enterprise SaaS',
    proptech: 'Proptech', other: 'Open',
  };
  var PRN = { primary: 'Primary', secondary: 'Secondaries', syndicate: 'Syndicates', preipo: 'Pre-IPO' };
  var STG = { seed: 'Pre-seed / Seed', ab: 'Series A – B', growth: 'Growth / late stage', preipo: 'Pre-IPO' };
  var RISKN = { cautious: 'Cautious', balanced: 'Balanced', adventurous: 'Adventurous', high: 'High conviction' };

  function blank() {
    return {
      investingAs: null, ukTax: null, category: null, catConfirm: false,
      assets: null, allocation: 10, seis: null,
      a1: null, a2: null, a3: null, a4: null,
      goal: null, horizon: null, risk: null,
      holdings: 20, ticket: null, annual: null,
      sectors: [], stages: [], products: [], involvement: null,
    };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- shared analysis: also used by the dashboard ---------- */
  function analyse(s) {
    var spread = ({ cautious: 30, balanced: 25, adventurous: 18, high: 12 })[s.risk] || 20;
    var understood = s.a1 === 'yes' && s.a2 === 'no' && s.a3 === 'no' && s.a4 === 'yes';
    var risks = [];
    var actions = [];

    if (s.holdings < spread) {
      risks.push({
        level: 'warn',
        title: 'Concentration risk',
        body: 'You are targeting ' + s.holdings + ' companies. For a ' + (RISKN[s.risk] || 'balanced').toLowerCase() +
          ' approach, ' + spread + '+ positions spreads the risk of any single failure much further.',
      });
      actions.push('Build toward ' + spread + '+ positions before increasing your cheque size.');
    }
    if (s.holdings < 10) {
      risks.push({
        level: 'bad',
        title: 'Very few positions',
        body: 'Under ten holdings, a single failure can wipe out the return of everything else. Most early-stage bets fail; breadth is what lets the winners carry the portfolio.',
      });
    }
    if (s.category === 'restricted' && s.allocation > 10) {
      risks.push({
        level: 'bad',
        title: 'Above your self-certified cap',
        body: 'You self-certified as a restricted investor, which caps high-risk investments at 10% of net assets over twelve months. Your target allocation is ' + s.allocation + '%.',
      });
      actions.push('Bring your private-markets allocation back to 10% or re-check your investor category.');
    }
    if (s.allocation > 25) {
      risks.push({
        level: 'warn',
        title: 'High allocation to illiquid assets',
        body: s.allocation + '% of investable assets in private markets is a heavy weighting. These holdings cannot be sold on demand.',
      });
      actions.push('Keep enough liquid assets outside private markets to cover 6–12 months of needs.');
    }
    if (s.horizon === 'u3') {
      risks.push({
        level: 'bad',
        title: 'Horizon shorter than the asset class',
        body: 'Private holdings often take 5–10 years to return anything and cannot be sold on demand. A sub-three-year horizon sits badly with this asset class.',
      });
      actions.push('Extend your horizon to 5+ years, or keep this money in liquid assets instead.');
    }
    if (!understood) {
      risks.push({
        level: 'warn',
        title: 'Risk checks worth revisiting',
        body: 'Some answers on how these investments work need a recap: you can lose everything, they are hard to sell, they are not FSCS-protected, and your stake can be diluted by later rounds.',
      });
      actions.push('Re-take the risk check before your first commitment.');
    }
    if (s.category === 'none') {
      risks.push({
        level: 'bad',
        title: 'Not currently eligible',
        body: 'You are not in an eligible investor category, so live deals stay locked. You can still explore and learn.',
      });
    }
    if (s.sectors.length && s.sectors.length < 3 && s.sectors.indexOf('other') === -1) {
      actions.push('Widen beyond ' + s.sectors.length + ' sector' + (s.sectors.length === 1 ? '' : 's') + '. Sector shocks hit correlated holdings together.');
    }
    if (s.stages.length === 1) {
      actions.push('Mix stages: pairing earlier bets with later-stage or pre-IPO names smooths the risk curve.');
    }
    if (s.products.length === 1) {
      actions.push('Consider more than one route in: primaries, secondaries and syndicates carry different fees and liquidity.');
    }
    if (s.seis === 'no' && s.ukTax === 'yes') {
      actions.push('You are UK tax resident but skipping SEIS/EIS, worth checking what relief you are leaving on the table.');
    }
    if (!actions.length) actions.push('Your plan looks well spread. Keep position sizes even as you add names.');

    var score = 100;
    risks.forEach(function (r) { score -= r.level === 'bad' ? 22 : 11; });
    score = Math.max(12, Math.min(100, score));

    return {
      spread: spread, understood: understood, risks: risks, actions: actions,
      score: score,
      grade: score >= 80 ? 'Well spread' : score >= 55 ? 'Needs balancing' : 'Concentrated',
    };
  }

  /* ---------- controls ---------- */
  function optRows(ctx, field, list, opts) {
    opts = opts || {};
    var s = ctx.state;
    return '<div class="wz-opts' + (opts.cols === 2 ? ' two' : '') + '">' + list.map(function (o) {
      var sel = s[field] === o.v ? ' sel' : '';
      var sub = o.d ? '<small>' + esc(o.d) + '</small>' : '';
      return '<button type="button" class="wz-opt' + (opts.square ? ' sq' : '') + sel +
        '" data-pick="' + field + '" data-val="' + o.v + '">' +
        '<span class="wz-tick"></span><span class="wz-body"><b>' + esc(o.t) + '</b>' + sub + '</span></button>';
    }).join('') + '</div>';
  }

  function multiChips(ctx, field, list) {
    var s = ctx.state;
    return '<div class="wz-chips">' + list.map(function (o) {
      var sel = s[field].indexOf(o.v) >= 0 ? ' sel' : '';
      return '<button type="button" class="wz-chip' + sel + '" data-toggle="' + field + '" data-val="' + o.v + '">' + esc(o.t) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------- steps ---------- */
  var STEPS = [
    { key: 'Welcome', valid: function () { return true; }, render: sWelcome },
    { key: 'About you', valid: function (s) { return s.investingAs && s.ukTax; }, render: sAbout },
    { key: 'Eligibility', valid: function (s) { return s.category && (s.category === 'none' || s.catConfirm); }, render: sCategory },
    { key: 'Wealth', valid: function (s) { return s.assets && s.seis; }, render: sWealth },
    { key: 'Understanding', valid: function (s) { return s.a1 && s.a2 && s.a3 && s.a4; }, render: sApprop },
    { key: 'Goals', valid: function (s) { return s.goal && s.horizon && s.risk; }, render: sGoals },
    { key: 'Portfolio', valid: function (s) { return s.ticket && s.annual; }, render: sPortfolio },
    { key: 'Preferences', valid: function (s) { return s.sectors.length && s.products.length && s.involvement; }, render: sPrefs },
    { key: 'Your profile', valid: function () { return true; }, render: sResult, terminal: true },
  ];

  /* The case for the whole approach, before a single question. Short on
     purpose: three reasons, then straight into the profile. */
  function sWelcome(ctx) {
    return '<h2 class="wz-h">Why a portfolio, not a punt.</h2>' +
      '<p class="wz-lede">Most startups return nothing. A handful return everything. Nobody reliably picks which is which, so professionals own enough of the market to be holding the winners when they land.</p>' +
      '<ul class="wz-why">' +
      '<li><b>Spread does the work.</b> At 20+ positions, no single failure decides your outcome. At three, one does.</li>' +
      '<li><b>A cap keeps you safe.</b> Private markets are one slice of your wealth, sized deliberately rather than deal by deal.</li>' +
      '<li><b>Pacing beats timing.</b> A few deals a year across several years spreads you over vintages instead of betting on one.</li>' +
      '</ul>' +
      '<div class="wz-notice warn"><b>Before you start.</b> Investing in early-stage and private companies is high risk. You could lose all the money you put in, these holdings are hard to sell, and they are not protected by the Financial Services Compensation Scheme. A portfolio approach spreads that risk. It does not remove it.</div>' +
      '<p class="wz-lede" style="margin-bottom:0">Next, about three minutes of questions turns that into your plan: what you are eligible for, how much belongs here, and which deals fit.</p>';
  }

  function sAbout(ctx) {
    return '<h2 class="wz-h">First, the basics.</h2>' +
      '<div class="wz-q">Who is investing?</div>' +
      optRows(ctx, 'investingAs', [
        { v: 'individual', t: 'As an individual', d: 'In your own name' },
        { v: 'company', t: 'Through a company', d: 'Corporate or holding entity' },
        { v: 'trust', t: 'As a trustee', d: 'On behalf of a trust' },
        { v: 'pension', t: 'Via a SIPP / SSAS', d: 'Self-invested pension' },
      ], { cols: 2 }) +
      '<div class="wz-q">Are you a UK tax resident?</div>' +
      '<div class="wz-hint">This affects your eligibility for SEIS / EIS tax relief.</div>' +
      optRows(ctx, 'ukTax', [{ v: 'yes', t: 'Yes' }, { v: 'no', t: 'No' }], { cols: 2 });
  }

  function sCategory(ctx) {
    var s = ctx.state;
    var statement = {
      hnw: 'I confirm I have, in the last financial year, an annual income of £100,000 or more, or net assets of £250,000 or more (excluding my main home, pensions and life-cover benefits).',
      soph: 'I confirm I meet at least one of the sophisticated-investor criteria described above and understand I am self-certifying to that effect.',
      restricted: 'I confirm that in the next twelve months I will not invest more than 10% of my net assets in high-risk investments, and I understand why that limit exists to protect me.',
    }[s.category];
    var showConfirm = s.category && s.category !== 'none';

    return '<h2 class="wz-h">Are you eligible to invest?</h2>' +
      '<p class="wz-lede">UK rules mean we can only show high-risk private-market deals to investors in one of the categories below. Pick the one that fits you. You self-certify. Nothing here is shared publicly.</p>' +
      optRows(ctx, 'category', [
        { v: 'hnw', t: 'High-net-worth investor', d: 'Income of £100,000+ last year, or net assets of £250,000+ (excluding home, pension and life cover).' },
        { v: 'soph', t: 'Sophisticated investor', d: "You've been in an angel syndicate 6+ months, worked in private-equity or SME finance in the last 2 years, or been a director of a company turning over £1m+." },
        { v: 'restricted', t: 'Restricted (everyday) investor', d: "Neither of the above. You'll cap high-risk investments at 10% of your net assets over the next 12 months." },
        { v: 'none', t: 'None of these apply to me', d: "Let's see where that leaves you." },
      ]) +
      (s.category === 'none' ? '<div class="wz-notice warn"><b>You may not be eligible yet.</b> Access to these investments is restricted for good reason. You\'re welcome to explore Bundle\'s learning materials and watchlists, and revisit once one of the categories fits.</div>' : '') +
      (showConfirm ? '<div class="wz-notice">' + esc(statement) + '</div>' +
        '<button type="button" class="wz-opt sq' + (s.catConfirm ? ' sel' : '') + '" data-confirm="1" style="width:100%">' +
        '<span class="wz-tick"></span><span class="wz-body"><b>I confirm the statement above is true.</b></span></button>' : '');
  }

  /* Slider display is derived in one place so the initial render and the live
     in-place update during a drag can never disagree. */
  var SLIDERS = {
    allocation: {
      fill: function (s) { return (s.allocation / 50 * 100).toFixed(2); },
      value: function (s) { return s.allocation + '%'; },
      note: function (s) {
        return s.allocation <= 10 ? 'Conservative, in line with the everyday-investor cap.'
          : s.allocation <= 25 ? 'Moderate weighting toward private markets.'
            : 'A high concentration. Make sure the rest of your wealth is well diversified.';
      },
      warn: function (s) { return s.category === 'restricted' && s.allocation > 10; },
    },
    holdings: {
      fill: function (s) { return ((s.holdings - 1) / 49 * 100).toFixed(2); },
      value: function (s) { return s.holdings + (s.holdings === 50 ? '+' : ''); },
      note: function (s) {
        return s.holdings < 10 ? 'Concentrated. In early-stage investing most bets fail, so a handful of positions leans heavily on being right.'
          : s.holdings < 20 ? 'Reasonable spread. More positions further reduces reliance on any single outcome.'
            : 'Broad and disciplined. Wide diversification is how you survive the losers to catch the winners.';
      },
      warn: function () { return false; },
    },
  };

  function sWealth(ctx) {
    var s = ctx.state;
    var S = SLIDERS.allocation;

    return '<h2 class="wz-h">Your position, roughly.</h2>' +
      '<div class="wz-q">Your investable assets, cash and investments you could deploy, excluding your home and pension.</div>' +
      optRows(ctx, 'assets', [
        { v: 'u25', t: 'Under £25,000' }, { v: '25-100', t: '£25,000 – £100,000' },
        { v: '100-250', t: '£100,000 – £250,000' }, { v: '250-1m', t: '£250,000 – £1m' },
        { v: '1m+', t: 'Over £1m' },
      ], { cols: 2 }) +
      '<div class="wz-q">Of that, how much are you comfortable putting into private markets?</div>' +
      '<div class="wz-hint">A guardrail, not a target. Private markets should be one slice of a wider portfolio.</div>' +
      '<div class="wz-slider">' +
      '<input type="range" min="1" max="50" value="' + s.allocation + '" style="--fill:' + S.fill(s) + '%" data-slider="allocation" aria-label="Share of investable assets in private markets">' +
      '<div class="wz-slval"><b data-slider-value="allocation">' + S.value(s) + '</b>' +
      '<span class="wz-note" data-slider-note="allocation">' + S.note(s) + '</span></div>' +
      '<div class="wz-scale"><span>1%</span><span>25%</span><span>50%</span></div></div>' +
      '<div class="wz-notice warn" data-slider-warn="allocation"' + (S.warn(s) ? '' : ' hidden') +
      '><b>Heads up.</b> As a restricted investor you\'ve self-certified to a 10% cap on high-risk investments. We\'ll hold you to that when you allocate.</div>' +
      '<div class="wz-q">Interested in SEIS / EIS tax relief on qualifying deals?</div>' +
      optRows(ctx, 'seis', [
        { v: 'yes', t: 'Yes, prioritise it' }, { v: 'maybe', t: 'Show me where it applies' },
        { v: 'no', t: 'Not relevant to me' },
      ], { cols: 2 });
  }

  function sApprop(ctx) {
    var yn = [{ v: 'yes', t: 'Yes' }, { v: 'no', t: 'No' }];
    return '<h2 class="wz-h">Quick check on the risks.</h2>' +
      '<p class="wz-lede">No trick questions, just confirming the important stuff is clear before you invest.</p>' +
      '<div class="wz-q">Could you lose all the money you invest in a private company?</div>' + optRows(ctx, 'a1', yn, { cols: 2 }) +
      '<div class="wz-q">Can you usually sell these shares quickly, whenever you want?</div>' + optRows(ctx, 'a2', yn, { cols: 2 }) +
      '<div class="wz-q">Are these investments protected by the FSCS if the company fails?</div>' + optRows(ctx, 'a3', yn, { cols: 2 }) +
      '<div class="wz-q">Can your stake be diluted when a company raises money again later?</div>' + optRows(ctx, 'a4', yn, { cols: 2 });
  }

  function sGoals(ctx) {
    var s = ctx.state;
    return '<h2 class="wz-h">What are you here to do?</h2>' +
      '<div class="wz-q">Your main goal</div>' +
      optRows(ctx, 'goal', [
        { v: 'growth', t: 'Long-term capital growth', d: 'Back companies early and compound over years' },
        { v: 'access', t: 'Access & learning', d: 'Get into deals that used to be closed to you' },
        { v: 'tax', t: 'Tax-efficient investing', d: 'Lean into SEIS / EIS reliefs' },
        { v: 'diversify', t: 'Diversify beyond public markets', d: 'Add a different return stream' },
      ]) +
      '<div class="wz-q">When would you expect to see this money back?</div>' +
      optRows(ctx, 'horizon', [
        { v: 'u3', t: 'Under 3 years' }, { v: '3-5', t: '3 – 5 years' },
        { v: '5-7', t: '5 – 7 years' }, { v: '7+', t: '7 years or more' },
      ], { cols: 2 }) +
      (s.horizon === 'u3' ? '<div class="wz-notice warn"><b>Worth knowing.</b> Private holdings often take 5–10 years to return anything, and can\'t be sold on demand. A short horizon and this asset class don\'t sit easily together.</div>' : '') +
      '<div class="wz-q">How would you describe your appetite for risk?</div>' +
      optRows(ctx, 'risk', [
        { v: 'cautious', t: 'Cautious', d: 'Steady wins. Spread widely, avoid the wild swings.' },
        { v: 'balanced', t: 'Balanced', d: 'Comfortable with volatility for stronger long-term upside.' },
        { v: 'adventurous', t: 'Adventurous', d: 'Happy to take real risk on high-growth bets.' },
        { v: 'high', t: 'High conviction', d: 'Prepared to lose stakes entirely chasing outsized winners.' },
      ]);
  }

  function sPortfolio(ctx) {
    var s = ctx.state;
    var S = SLIDERS.holdings;

    return '<h2 class="wz-h">Shape of your portfolio.</h2>' +
      '<div class="wz-q">How many companies would you like to build toward holding?</div>' +
      '<div class="wz-hint">Breadth is the discipline that does the heavy lifting, no single deal should make or break you.</div>' +
      '<div class="wz-slider">' +
      '<input type="range" min="1" max="50" value="' + s.holdings + '" style="--fill:' + S.fill(s) + '%" data-slider="holdings" aria-label="Target number of companies">' +
      '<div class="wz-slval"><b data-slider-value="holdings">' + S.value(s) + '</b>' +
      '<span class="wz-note" data-slider-note="holdings">' + S.note(s) + '</span></div>' +
      '<div class="wz-scale"><span>1</span><span>25</span><span>50+</span></div></div>' +
      '<div class="wz-q">Typical amount per deal</div>' +
      optRows(ctx, 'ticket', [
        { v: 'u500', t: 'Under £500' }, { v: '500-2k', t: '£500 – £2,000' },
        { v: '2-10k', t: '£2,000 – £10,000' }, { v: '10k+', t: '£10,000+' },
      ], { cols: 2 }) +
      '<div class="wz-q">Roughly how much do you plan to invest across a year?</div>' +
      optRows(ctx, 'annual', [
        { v: 'u5k', t: 'Under £5,000' }, { v: '5-25k', t: '£5,000 – £25,000' },
        { v: '25-100k', t: '£25,000 – £100,000' }, { v: '100k+', t: '£100,000+' },
      ], { cols: 2 });
  }

  function sPrefs(ctx) {
    return '<h2 class="wz-h">What do you want to see?</h2>' +
      '<div class="wz-q">Sectors that interest you</div>' +
      multiChips(ctx, 'sectors', [
        { v: 'fintech', t: 'Fintech' }, { v: 'ai', t: 'AI & deep tech' },
        { v: 'health', t: 'Health & biotech' }, { v: 'climate', t: 'Climate & energy' },
        { v: 'consumer', t: 'Consumer & brands' }, { v: 'saas', t: 'Enterprise SaaS' },
        { v: 'proptech', t: 'Proptech' }, { v: 'other', t: 'Open to anything' },
      ]) +
      '<div class="wz-q">Stages you\'re open to</div>' +
      multiChips(ctx, 'stages', [
        { v: 'seed', t: 'Pre-seed / Seed' }, { v: 'ab', t: 'Series A – B' },
        { v: 'growth', t: 'Growth / late stage' }, { v: 'preipo', t: 'Pre-IPO' },
      ]) +
      '<div class="wz-q">Which routes into deals interest you?</div>' +
      '<div class="wz-hint">Bundle indexes across all of these. Pick any that appeal.</div>' +
      multiChips(ctx, 'products', [
        { v: 'primary', t: 'Primary raises' }, { v: 'secondary', t: 'Secondaries' },
        { v: 'syndicate', t: 'Syndicates' }, { v: 'preipo', t: 'Pre-IPO access' },
      ]) +
      '<div class="wz-q">How hands-on do you want to be?</div>' +
      optRows(ctx, 'involvement', [
        { v: 'auto', t: 'Guided', d: 'Bundle proposes a diversified allocation inside my rules; I approve.' },
        { v: 'mixed', t: 'Collaborative', d: 'Suggestions welcome, but I make the final call on each deal.' },
        { v: 'self', t: 'Self-directed', d: "I'll browse and pick everything myself." },
      ]);
  }

  function sResult(ctx) {
    var s = ctx.state;
    var a = analyse(s);
    var secTags = s.sectors.map(function (x) { return '<span>' + esc(SECN[x]) + '</span>'; }).join('') || '<span>Any</span>';
    var prodTags = s.products.map(function (x) { return '<span>' + esc(PRN[x]) + '</span>'; }).join('') || '<span>Any</span>';
    var nudge = s.holdings < a.spread
      ? 'Given a ' + (RISKN[s.risk] || 'balanced').toLowerCase() + ' appetite, consider building toward ' + a.spread + '+ positions rather than ' + s.holdings + ': the extra breadth is what protects you.'
      : 'Your target of ' + s.holdings + ' positions gives you healthy diversification for a ' + (RISKN[s.risk] || 'balanced').toLowerCase() + ' approach.';

    return '<h2 class="wz-h">Here\'s your profile.</h2>' +
      '<p class="wz-lede">This is the starting point Bundle uses to filter deals and keep you diversified. You can change any of it later.</p>' +
      '<div class="wz-rgrid">' +
      cell('Investor category', LB[s.category] || '-') +
      cell('Risk appetite', RISKN[s.risk] || '-') +
      cell('Primary goal', LB[s.goal] || '-') +
      cell('Private-markets allocation', s.allocation + '% of investable assets') +
      '<div class="wz-rcell wide"><div class="wz-k">Target diversification</div><div class="wz-v">Building toward ' + s.holdings + (s.holdings === 50 ? '+' : '') + ' companies</div></div>' +
      '<div class="wz-rcell wide"><div class="wz-k">Sectors</div><div class="wz-tags">' + secTags + '</div></div>' +
      '<div class="wz-rcell wide"><div class="wz-k">Deal routes</div><div class="wz-tags">' + prodTags + '</div></div>' +
      '</div>' +
      '<div class="wz-notice"><b>Discipline note.</b> ' + esc(nudge) + '</div>' +
      (!a.understood ? '<div class="wz-notice warn"><b>Worth a recap.</b> A couple of your answers on how these investments work are worth revisiting. You can lose everything, they\'re hard to sell, they aren\'t FSCS-protected, and your stake can be diluted. We\'ll walk you through it before your first commitment.</div>' : '') +
      (s.category === 'none' ? '<div class="wz-notice warn"><b>Note.</b> You\'re not currently in an eligible category, so live deals stay locked. Explore and learn in the meantime.</div>' : '');
  }

  function cell(k, v) {
    return '<div class="wz-rcell"><div class="wz-k">' + esc(k) + '</div><div class="wz-v">' + esc(v) + '</div></div>';
  }

  /* ---------- engine ---------- */
  function mount(root, opts) {
    opts = opts || {};
    var ctx = { state: opts.state || blank(), step: 0 };
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('bundle.profileDraft') || 'null'); } catch (e) { }
    if (saved && !opts.state) { Object.keys(saved).forEach(function (k) { ctx.state[k] = saved[k]; }); }

    root.classList.add('wz');
    if (opts.compact) root.classList.add('wz-compact');

    function persistDraft() {
      try { localStorage.setItem('bundle.profileDraft', JSON.stringify(ctx.state)); } catch (e) { }
    }

    function draw() {
      var st = STEPS[ctx.step];
      var spine = STEPS.map(function (_, i) {
        return '<span class="wz-node ' + (i < ctx.step ? 'done' : i === ctx.step ? 'now' : '') + '"></span>';
      }).join('');

      var nav = st.terminal
        ? '<div class="wz-nav"><button type="button" class="btn btn-ghost" data-nav="restart">Start over</button>' +
        '<button type="button" class="btn btn-gold" data-nav="save">' + (opts.saveLabel || 'Save my profile') + ' <span class="arrow">→</span></button></div>'
        : '<div class="wz-nav">' +
        (ctx.step > 0 ? '<button type="button" class="btn btn-ghost" data-nav="back">← Back</button>' : '<span></span>') +
        '<button type="button" class="btn btn-primary" data-nav="next"' + (st.valid(ctx.state) ? '' : ' disabled') + '>' +
        (ctx.step === 0 ? 'Start building my plan' : 'Continue') + ' <span class="arrow">→</span></button></div>';

      root.innerHTML =
        '<div class="wz-spine">' + spine + '</div>' +
        '<div class="wz-meta"><span class="wz-key">' + esc(st.key) + '</span>' +
        '<span class="wz-cnt">' + (st.terminal ? 'Complete' : 'Step ' + ctx.step + ' of ' + (STEPS.length - 2)) + '</span></div>' +
        '<div class="wz-card">' + st.render(ctx) + nav + '</div>';
      persistDraft();
    }

    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-pick],[data-toggle],[data-nav],[data-confirm]');
      if (!el || !root.contains(el)) return;
      e.preventDefault();

      if (el.hasAttribute('data-pick')) {
        ctx.state[el.getAttribute('data-pick')] = el.getAttribute('data-val');
        return draw();
      }
      if (el.hasAttribute('data-toggle')) {
        var f = el.getAttribute('data-toggle'), v = el.getAttribute('data-val');
        var arr = ctx.state[f], i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else arr.push(v);
        return draw();
      }
      if (el.hasAttribute('data-confirm')) {
        ctx.state.catConfirm = !ctx.state.catConfirm;
        return draw();
      }
      var nav = el.getAttribute('data-nav');
      if (nav === 'next') {
        if (!STEPS[ctx.step].valid(ctx.state)) return;
        ctx.step = Math.min(STEPS.length - 1, ctx.step + 1);
        draw(); scrollTop();
      } else if (nav === 'back') {
        ctx.step = Math.max(0, ctx.step - 1);
        draw(); scrollTop();
      } else if (nav === 'restart') {
        ctx.state = blank(); ctx.step = 0; draw(); scrollTop();
      } else if (nav === 'save') {
        if (opts.onSave) opts.onSave(ctx.state, analyse(ctx.state));
      }
    });

    /* Patch the slider's readouts in place. A full draw() here would replace
       root.innerHTML, destroying the very <input> being dragged, which is
       what made these sliders stutter and drop the drag. */
    root.addEventListener('input', function (e) {
      var sl = e.target.closest('[data-slider]');
      if (!sl) return;

      var field = sl.getAttribute('data-slider');
      var S = SLIDERS[field];
      ctx.state[field] = +sl.value;
      if (!S) return;

      sl.style.setProperty('--fill', S.fill(ctx.state) + '%');

      var val = root.querySelector('[data-slider-value="' + field + '"]');
      if (val) val.textContent = S.value(ctx.state);

      var note = root.querySelector('[data-slider-note="' + field + '"]');
      if (note) note.textContent = S.note(ctx.state);

      var warn = root.querySelector('[data-slider-warn="' + field + '"]');
      if (warn) warn.hidden = !S.warn(ctx.state);
    });

    // Persist once the drag settles, not on every pixel.
    root.addEventListener('change', function (e) {
      if (e.target.closest('[data-slider]')) persistDraft();
    });

    function scrollTop() {
      if (opts.compact) {
        var sc = root.closest('.wz-scroll');
        if (sc) sc.scrollTop = 0;
      } else {
        root.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }

    draw();
    return ctx;
  }

  window.BundleWizard = {
    mount: mount, analyse: analyse, blank: blank,
    labels: { LB: LB, SECN: SECN, PRN: PRN, STG: STG, RISKN: RISKN },
  };
})();
