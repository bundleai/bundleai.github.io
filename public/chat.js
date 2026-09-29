/**
 * Bundle assistant.
 *
 * Answers are COMPOSED from the payload in #bundle-chat-data and nothing else.
 * That grounding is the whole design: the assistant can quote a price because
 * the page can, and it says "I don't hold that" the moment a question leaves
 * the data. It never estimates a number and never gives advice.
 *
 * There is no model call here. The site is static, so an API key would be
 * public; instead this resolves intent locally and builds the answer from
 * structured records. If a backend is added later, set window.BUNDLE_CHAT_API
 * to its URL and answers will be routed there, with this as the fallback.
 */
(function () {
  'use strict';

  var DATA = null;
  var els = {};
  var open = false;
  var lastFocus = null;

  function load() {
    if (DATA) return DATA;
    var tag = document.getElementById('bundle-chat-data');
    if (!tag) return null;
    try {
      DATA = JSON.parse(tag.textContent || '{}');
    } catch (e) {
      DATA = null;
    }
    return DATA;
  }

  /* ---------------- text helpers ---------------- */

  var STOP = new Set(['the', 'a', 'an', 'is', 'are', 'of', 'to', 'in', 'on', 'for', 'and',
    'or', 'what', 'whats', 'how', 'do', 'does', 'i', 'me', 'my', 'you', 'can', 'with',
    'at', 'it', 'this', 'that', 'be', 'was', 'about', 'tell', 'show', 'give', 'please']);

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s.%+-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokens(s) {
    return norm(s).split(' ').filter(function (t) { return t && !STOP.has(t); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function money(cur, n) {
    if (n == null || !isFinite(n)) return '-';
    return cur + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function link(href, label) {
    return '<a href="' + esc(href) + '">' + esc(label) + '</a>';
  }

  /* ---------------- entity resolution ---------------- */

  function findDeal(q) {
    var d = load();
    if (!d) return null;
    var n = norm(q);
    var best = null;
    var bestScore = 0;
    d.deals.forEach(function (deal) {
      var name = norm(deal.name);
      var score = 0;
      if (n.indexOf(name) > -1) score = 100 + name.length;
      else if (n.split(' ').indexOf(norm(deal.code)) > -1) score = 90;
      else {
        // Partial: every word of the company name present somewhere.
        var parts = name.split(' ').filter(function (w) { return w.length > 2; });
        if (parts.length && parts.every(function (w) { return n.indexOf(w) > -1; })) {
          score = 60 + name.length;
        }
      }
      if (score > bestScore) { bestScore = score; best = deal; }
    });
    return bestScore > 0 ? best : null;
  }

  function findSector(q) {
    var d = load();
    if (!d) return null;
    var n = norm(q);
    var hit = null;
    d.sectors.forEach(function (s) {
      var sn = norm(s.sector);
      if (n.indexOf(sn) > -1 && (!hit || sn.length > norm(hit.sector).length)) hit = s;
    });
    return hit;
  }

  function findVenue(q) {
    var d = load();
    if (!d) return null;
    var n = norm(q);
    var hit = null;
    d.venues.forEach(function (v) {
      var vn = norm(v.name);
      if (n.indexOf(vn) > -1 && (!hit || vn.length > norm(hit.name).length)) hit = v;
    });
    return hit;
  }

  function scoreOverlap(qt, text) {
    var t = new Set(tokens(text));
    var hits = 0;
    qt.forEach(function (w) { if (t.has(w)) hits++; });
    return qt.length ? hits / qt.length : 0;
  }

  /* ---------------- answer builders ---------------- */

  function answerDeal(deal, q) {
    var n = norm(q);
    var out = [];
    var head = '<b>' + esc(deal.name) + '</b> · ' + esc(deal.sector) + ' · ' +
      esc(deal.type === 'crowdfunding' ? 'Crowdfunding' : deal.type === 'pre-ipo' ? 'Pre-IPO' : 'Secondary');
    out.push(head);

    // Where to buy / cheapest
    if (/cheap|best price|where|venue|platform|compare|buy/.test(n) && deal.venues.length > 1) {
      var rows = deal.venues.filter(function (v) { return v.price != null; })
        .sort(function (a, b) { return a.price - b.price; });
      if (rows.length) {
        out.push('Listed on ' + rows.length + ' venues:');
        out.push('<ul>' + rows.map(function (v) {
          return '<li>' + esc(v.name) + ': <b>' + money(deal.currency, v.price) + '</b>' +
            (v.liveOrders != null ? ' · ' + v.liveOrders + ' live orders' : '') + '</li>';
        }).join('') + '</ul>');
        if (deal.cheapest) {
          out.push('Cheapest is <b>' + esc(deal.cheapest.venue) + '</b> at ' +
            money(deal.currency, deal.cheapest.price) +
            (deal.spreadPct != null ? ', a ' + deal.spreadPct + '% spread across venues.' : '.'));
          if (deal.spreadPct != null && deal.spreadPct > 25) {
            out.push('<i>A gap that wide usually means a different share class or a stale mark, not a saving.</i>');
          }
        }
      }
    } else if (/pro|con|risk|good|bad|should|worth|invest/.test(n) && (deal.pros.length || deal.cons.length)) {
      if (deal.pros.length) {
        out.push('<b>Strengths</b><ul>' + deal.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>');
      }
      if (deal.cons.length) {
        out.push('<b>Risks</b><ul>' + deal.cons.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>');
      }
      out.push('<i>That is Bundle\'s framing of public factors, not advice or a recommendation.</i>');
    } else {
      // Default: the vitals.
      if (deal.price != null) {
        out.push('Venue mark <b>' + money(deal.currency, deal.price) + '</b> per share on ' + esc(deal.venue) +
          (deal.change != null ? ' (' + (deal.change > 0 ? '+' : '') + deal.change + '%)' : '') + '.');
      } else if (deal.raised) {
        out.push('Raised <b>' + esc(deal.raised) + '</b>' +
          (deal.investors != null ? ' from ' + deal.investors + ' investors' : '') + ' on ' + esc(deal.venue) +
          (deal.closes ? ', closing in ' + esc(deal.closes) : '') + '.');
      }
      var facts = [];
      if (deal.valuation) facts.push('Valuation ' + deal.valuation);
      if (deal.hq) facts.push('HQ ' + deal.hq);
      if (deal.founded) facts.push('Founded ' + deal.founded);
      if (deal.employees) facts.push('Team ' + deal.employees);
      facts.push('Min ' + deal.minTicket);
      out.push(facts.join(' · '));
      if (deal.about) out.push(esc(deal.about));
      if (deal.venues.length > 1) {
        out.push('Listed on ' + deal.venues.length + ' venues' +
          (deal.cheapest ? ', cheapest ' + esc(deal.cheapest.venue) + ' at ' + money(deal.currency, deal.cheapest.price) : '') + '.');
      }
    }

    return {
      html: out.join('<br>'),
      actions: [{ href: '/company/' + deal.id, label: 'Open ' + deal.name }],
    };
  }

  function answerList(q) {
    var d = load();
    var n = norm(q);
    var pool = d.deals.slice();

    var typeWanted = /crowdfund|primary|raise/.test(n) ? 'crowdfunding'
      : /pre.?ipo/.test(n) ? 'pre-ipo'
      : /secondar/.test(n) ? 'secondary' : null;
    if (typeWanted) pool = pool.filter(function (x) { return x.type === typeWanted; });

    var sec = findSector(q);
    if (sec) pool = pool.filter(function (x) { return x.sector === sec.sector; });

    var ven = findVenue(q);
    if (ven) {
      pool = pool.filter(function (x) {
        if (norm(x.venue) === norm(ven.name)) return true;
        return (x.venues || []).some(function (r) { return norm(r.name) === norm(ven.name); });
      });
    }

    // "under $500" style budget filter on the minimum ticket.
    var budget = /(?:under|below|less than|max)\s*[£$€]?\s*([\d,]+)\s*(k)?/.exec(n);
    if (budget) {
      var cap = parseFloat(budget[1].replace(/,/g, '')) * (budget[2] ? 1000 : 1);
      pool = pool.filter(function (x) {
        var m = /([\d,]+(?:\.\d+)?)/.exec(x.minTicket || '');
        return m && parseFloat(m[1].replace(/,/g, '')) <= cap;
      });
    }

    if (/closing|soon|deadline|ending/.test(n)) {
      pool = pool.filter(function (x) { return x.closes; });
    }
    if (/rising|gain|up|best perform/.test(n)) {
      pool = pool.filter(function (x) { return x.change != null && x.change > 0; })
        .sort(function (a, b) { return b.change - a.change; });
    } else if (/falling|down|worst|dropp/.test(n)) {
      pool = pool.filter(function (x) { return x.change != null && x.change < 0; })
        .sort(function (a, b) { return a.change - b.change; });
    }

    if (!pool.length) return null;

    var shown = pool.slice(0, 6);
    var bits = ['Found <b>' + pool.length + '</b> matching ' + (pool.length === 1 ? 'deal' : 'deals') + ':'];
    bits.push('<ul>' + shown.map(function (x) {
      var val = x.price != null ? money(x.currency, x.price) + '/share'
        : x.raised ? x.raised + ' raised' : x.valuation;
      return '<li>' + link('/company/' + x.id, x.name) + ': ' + esc(val) +
        (x.change != null && x.change !== 0 ? ' <span class="' + (x.change > 0 ? 'up' : 'down') + '">' +
          (x.change > 0 ? '+' : '') + x.change + '%</span>' : '') +
        ' · ' + esc(x.venue) + ' · min ' + esc(x.minTicket) + '</li>';
    }).join('') + '</ul>');
    if (pool.length > shown.length) bits.push('…and ' + (pool.length - shown.length) + ' more on the screener.');

    return { html: bits.join('<br>'), actions: [{ href: '/deals', label: 'Open the screener' }] };
  }

  function answerSector(sec) {
    var d = load();
    var names = d.deals.filter(function (x) { return x.sector === sec.sector; }).slice(0, 5);
    var bits = ['<b>' + esc(sec.sector) + '</b> on Bundle: ' + sec.count + ' deals tracked, ' +
      'average move <b>' + (sec.avgChange > 0 ? '+' : '') + sec.avgChange + '%</b>, ' +
      'tracked valuation ' + esc(sec.valuation) + ' (' + esc(sec.trend) + ').'];
    if (names.length) {
      bits.push('<ul>' + names.map(function (x) {
        return '<li>' + link('/company/' + x.id, x.name) + ' · ' + esc(x.venue) + '</li>';
      }).join('') + '</ul>');
    }
    return { html: bits.join('<br>'), actions: [{ href: '/deals', label: 'Screen this sector' }] };
  }

  function answerVenue(v) {
    var d = load();
    // Match against every venue that lists a deal, not just the deal's primary
    // venue: Hiive and Nasdaq Private Market only ever appear as secondary
    // listings, so a primary-only check reported them as untracked.
    var mine = d.deals.filter(function (x) {
      if (norm(x.venue) === norm(v.name)) return true;
      return (x.venues || []).some(function (r) { return norm(r.name) === norm(v.name); });
    });
    var bits = ['<b>' + esc(v.name) + '</b>: ' + esc(v.model) + ' · ' + esc(v.region) +
      ' · access: ' + esc(v.access) + '.'];
    bits.push(mine.length
      ? 'Bundle tracks <b>' + mine.length + '</b> ' + (mine.length === 1 ? 'listing' : 'listings') + ' there.'
      : 'Bundle does not currently track listings from this venue.');
    bits.push('<i>You invest on the venue itself, under its rules and eligibility checks. Bundle never holds your money.</i>');
    return { html: bits.join('<br>'), actions: mine.length ? [{ href: '/deals', label: 'See its listings' }] : [] };
  }

  function answerLesson(q) {
    var d = load();
    var qt = tokens(q);
    var best = null;
    var bestScore = 0.34;
    d.lessons.forEach(function (l) {
      var s = Math.max(
        scoreOverlap(qt, l.title + ' ' + l.blurb),
        scoreOverlap(qt, (l.takeaways || []).join(' ')) * 0.9
      );
      if (s > bestScore) { bestScore = s; best = l; }
    });
    if (!best) return null;
    var bits = ['<b>' + esc(best.title) + '</b>', esc(best.blurb)];
    if (best.takeaways.length) {
      bits.push('<ul>' + best.takeaways.slice(0, 4).map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join('') + '</ul>');
    }
    return {
      html: bits.join('<br>'),
      actions: [{ href: '/learn/' + best.slug, label: best.minutes + ' min lesson' }],
    };
  }

  function answerFaq(q) {
    var d = load();
    var qt = tokens(q);
    var best = null;
    var bestScore = 0.3;
    d.faqs.forEach(function (f) {
      var s = scoreOverlap(qt, f.q);
      if (s > bestScore) { bestScore = s; best = f; }
    });
    if (!best) return null;
    return {
      html: esc(best.a),
      actions: best.link ? [{ href: best.link, label: best.linkLabel }] : [],
    };
  }

  /* ---------------- routing ---------------- */

  var ADVICE = /should i (buy|invest|sell)|is it a good (buy|investment)|will .* (go up|rise|moon|double)|what should i (buy|invest)|best investment|guarantee|how much will i (make|earn)|is .* worth buying/;

  function respond(q) {
    var d = load();
    if (!d) {
      return { html: 'The deal data has not loaded on this page. Try the ' + link('/deals', 'screener') + '.', actions: [] };
    }

    if (ADVICE.test(norm(q))) {
      return {
        html: 'I can\'t tell you what to invest in. Bundle gives no advice or recommendations, ' +
          'and no one can tell you where a private company\'s price goes.<br>' +
          'What I can do is show you the numbers: prices across venues, how a sector is moving, ' +
          'what a company\'s round documents say. Ask me about a specific company and I\'ll lay out both sides.',
        actions: [{ href: '/legal/risk-warning', label: 'The risks' }],
      };
    }

    // A named company wins, unless the question is clearly a list query.
    var listy = /\b(list|which|any|show me|find|all|cheapest deals|deals? (in|under|on))\b/.test(norm(q));
    var deal = findDeal(q);
    if (deal && !listy) return answerDeal(deal, q);

    var listed = /\b(deal|deals|list|show|find|which|under|cheap|closing|rising|falling)\b/.test(norm(q))
      ? answerList(q) : null;
    if (listed) return listed;

    if (deal) return answerDeal(deal, q);

    var ven = findVenue(q);
    if (ven) return answerVenue(ven);

    var sec = findSector(q);
    if (sec) return answerSector(sec);

    var faq = answerFaq(q);
    if (faq) return faq;

    var lesson = answerLesson(q);
    if (lesson) return lesson;

    return {
      html: "I don't hold anything on that. I can answer from Bundle's own data: a company we track, " +
        'prices across venues, how a sector is moving, what a term like dilution means, or how Bundle itself works.',
      actions: [{ href: '/deals', label: 'Browse deals' }],
      suggest: true,
    };
  }

  /* Optional backend. Set window.BUNDLE_CHAT_API to a URL that accepts
     {message, context} and returns {reply}. Falls back to local on any error. */
  function ask(q, done) {
    var api = window.BUNDLE_CHAT_API;
    if (!api) return done(respond(q));
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 12000);
    fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q, context: load() }),
      signal: ctl.signal,
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
      .then(function (j) {
        done(j && j.reply ? { html: esc(j.reply).replace(/\n/g, '<br>'), actions: [] } : respond(q));
      })
      .catch(function () { done(respond(q)); })
      .finally(function () { clearTimeout(timer); });
  }

  /* ---------------- UI ---------------- */

  var SUGGESTIONS = [
    'Where is OpenAI cheapest?',
    'Crowdfunding deals under $100',
    'What does dilution mean?',
    'How does Bundle make money?',
  ];

  function bubble(who, html, actions) {
    var wrap = document.createElement('div');
    wrap.className = 'bc-msg bc-' + who;
    var body = '<div class="bc-bubble">' + html;
    if (actions && actions.length) {
      body += '<div class="bc-actions">' + actions.map(function (a) {
        return '<a class="bc-act" href="' + esc(a.href) + '">' + esc(a.label) + ' →</a>';
      }).join('') + '</div>';
    }
    body += '</div>';
    wrap.innerHTML = body;
    els.log.appendChild(wrap);
    els.log.scrollTop = els.log.scrollHeight;
    return wrap;
  }

  function chips() {
    var wrap = document.createElement('div');
    wrap.className = 'bc-chips';
    wrap.innerHTML = SUGGESTIONS.map(function (s) {
      return '<button type="button" class="bc-chip">' + esc(s) + '</button>';
    }).join('');
    els.log.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('.bc-chip');
      if (!b) return;
      send(b.textContent);
    });
  }

  function send(text) {
    var q = (text || els.input.value || '').trim();
    if (!q) return;
    els.input.value = '';
    bubble('you', esc(q));

    var thinking = bubble('bot', '<span class="bc-dots"><i></i><i></i><i></i></span>');
    ask(q, function (res) {
      thinking.remove();
      bubble('bot', res.html, res.actions);
      if (res.suggest) chips();
    });
  }

  function build() {
    var root = document.createElement('div');
    root.className = 'bc-root';
    root.innerHTML =
      '<button type="button" class="bc-launch" aria-expanded="false" aria-controls="bc-panel">' +
        '<span class="bc-launch-ico" aria-hidden="true">◆</span>' +
        '<span class="bc-launch-txt">Ask Bundle</span>' +
      '</button>' +
      '<section class="bc-panel" id="bc-panel" role="dialog" aria-label="Bundle assistant" hidden>' +
        '<header class="bc-head">' +
          '<span class="bc-title">Ask Bundle</span>' +
          '<button type="button" class="bc-x" aria-label="Close">×</button>' +
        '</header>' +
        '<div class="bc-log" role="log" aria-live="polite"></div>' +
        '<form class="bc-form">' +
          '<input class="bc-input" type="text" autocomplete="off" ' +
            'placeholder="Ask about a company, venue or term…" aria-label="Your question" />' +
          '<button class="bc-send" type="submit" aria-label="Send">→</button>' +
        '</form>' +
        '<p class="bc-foot">Answers come from Bundle\'s own listing data. No advice, and figures are ' +
          'indicative venue marks, not live quotes.</p>' +
      '</section>';
    document.body.appendChild(root);

    els.root = root;
    els.launch = root.querySelector('.bc-launch');
    els.panel = root.querySelector('.bc-panel');
    els.log = root.querySelector('.bc-log');
    els.input = root.querySelector('.bc-input');

    els.launch.addEventListener('click', toggle);
    root.querySelector('.bc-x').addEventListener('click', toggle);
    root.querySelector('.bc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      send();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) toggle();
    });
  }

  function toggle() {
    if (!open) lastFocus = document.activeElement;
    open = !open;
    els.panel.hidden = !open;
    els.launch.setAttribute('aria-expanded', String(open));
    els.root.classList.toggle('is-open', open);
    if (open) {
      if (!els.log.children.length) {
        var d = load();
        bubble('bot',
          'I can answer from Bundle\'s listing data' +
          (d ? ': <b>' + d.deals.length + '</b> deals across ' + d.venues.length + ' venues, as of ' + esc(d.asOf) : '') +
          '. Ask about a company, where it is cheapest, a sector, or how any of this works.');
        chips();
      }
      els.input.focus();
    } else {
      // The launcher is display:none while the panel is open, so on close it
      // is the thing that reappears where focus should land.
      var back = (lastFocus && document.contains(lastFocus) && lastFocus !== document.body)
        ? lastFocus
        : els.launch;
      if (back && back.focus) back.focus();
      lastFocus = null;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
