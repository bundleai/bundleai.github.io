/* Bundle Academy lesson player.

   Turns a lesson from src/data/lessons.ts into a short explainer that behaves
   like a video: a timeline you can play, pause, scrub and step, with a drawn
   scene and one line of narration per beat. Everything is rendered as inline
   SVG from data, so a lesson costs no media, works offline and stays legible
   at any width.

   Mounts every .lp element on the page, reading its lesson from the
   <script type="application/json"> child written by LessonPlayer.astro. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(n) {
    if (n >= 1000000) return '£' + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'm';
    if (n >= 1000) return '£' + Math.round(n).toLocaleString('en-GB');
    return '£' + Math.round(n);
  }

  function num(n) {
    return Math.abs(n) < 10 && n % 1 ? String(n) : Math.round(n).toLocaleString('en-GB');
  }

  function clock(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  var PALETTE = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
  var TONE = { up: 'var(--up)', down: 'var(--down)', mid: 'var(--sand)' };

  /* ---------- scene renderers ----------
     Each returns SVG markup for a 640x320 stage. Anything that should animate
     in carries class="lp-a" plus the final value in a data attribute; enter()
     applies those a frame later so the transition has something to run from. */

  var R = {};

  R.stat = function (d) {
    var v = d.value, txt = (d.prefix || '') + num(v) + (d.suffix || '');
    return '<text class="lp-stat-v lp-a" x="320" y="150" text-anchor="middle" data-count="' + v +
      '" data-prefix="' + esc(d.prefix || '') + '" data-suffix="' + esc(d.suffix || '') + '">' + esc(txt) + '</text>' +
      '<text class="lp-stat-l" x="320" y="192" text-anchor="middle">' + esc(d.label || '') + '</text>' +
      (d.sub ? '<text class="lp-stat-s" x="320" y="228" text-anchor="middle">' + esc(d.sub) + '</text>' : '');
  };

  R.bars = function (d) {
    var items = d.items || [], max = d.max || 1, n = items.length;
    var gap = n > 1 ? Math.min(56, 236 / (n - 1)) : 0;
    var top = Math.round((320 - ((n - 1) * gap + 18)) / 2) + 8;
    var x0 = 214, w = 380;
    var out = '<text class="lp-axis" x="20" y="26">' + esc(d.unit || '') + '</text>';
    items.forEach(function (it, i) {
      var y = top + i * gap;
      var frac = Math.max(0.004, Math.min(1, it.value / max));
      var fill = it.tone ? TONE[it.tone] : PALETTE[i % PALETTE.length];
      /* Long bars swallow their own label, so the value moves inside. */
      var inside = frac > 0.74;
      var vx = inside ? x0 + w * frac - 12 : x0 + w * frac + 8;
      out +=
        '<text class="lp-blabel" x="200" y="' + (y + 13) + '" text-anchor="end">' + esc(it.label) + '</text>' +
        '<rect class="lp-btrack" x="' + x0 + '" y="' + y + '" width="' + w + '" height="18" rx="9"/>' +
        '<rect class="lp-bar lp-a" x="' + x0 + '" y="' + y + '" width="' + w + '" height="18" rx="9" fill="' + fill +
        '" style="transform-origin:' + x0 + 'px 0" data-scale="' + frac.toFixed(4) + '"/>' +
        '<text class="lp-bval' + (inside ? ' inv' : '') + ' lp-a" x="' + vx + '" y="' + (y + 13) + '"' +
        (inside ? ' text-anchor="end"' : '') + ' data-fade="1">' +
        esc(d.money ? money(it.value) : num(it.value)) + '</text>';
    });
    return out;
  };

  R.dots = function (d) {
    var cols = 20, rows = 5, r = 7.5, dx = 30, dy = 30, x0 = 32, y0 = 84;
    var total = d.total || 100;
    var kind = [];

    if (d.mode === 'coverage') {
      var held = Math.max(1, Math.min(total, Math.round(d.held || 20)));
      for (var i = 0; i < total; i++) kind.push(i < held ? 'held' : 'out');
    } else {
      (d.groups || []).forEach(function (g) {
        for (var j = 0; j < g.n; j++) kind.push(g.tone);
      });
      while (kind.length < total) kind.push('mid');
    }

    var out = '';
    for (var k = 0; k < total; k++) {
      var cx = x0 + (k % cols) * dx, cy = y0 + Math.floor(k / cols) * dy;
      var t = kind[k];
      var fill = t === 'held' ? 'var(--green)' : t === 'out' ? 'var(--chart-track)' : TONE[t] || 'var(--chart-track)';
      out += '<circle class="lp-dot lp-a" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill +
        '" data-fade="1" style="transition-delay:' + (REDUCED ? 0 : Math.min(700, k * 6)) + 'ms"/>';
    }

    if (d.mode === 'coverage') {
      var h = Math.max(1, Math.min(total, Math.round(d.held || 20)));
      var p = 1 - Math.pow(1 - (d.winRate || 0.05), h);
      out = '<text class="lp-head" x="320" y="42" text-anchor="middle">' +
        h + ' positions · ' + Math.round(p * 100) + '% chance of holding at least one big winner</text>' + out;
      // Sits above the drag control, which occupies the foot of the stage.
      out += '<text class="lp-axis" x="320" y="244" text-anchor="middle">Green dots are companies you own, at a 5% winner rate</text>';
    } else {
      var lx = 32;
      out = '<text class="lp-head" x="320" y="42" text-anchor="middle">100 early-stage companies</text>' + out;
      (d.groups || []).forEach(function (g) {
        out += '<circle cx="' + (lx + 6) + '" cy="264" r="6" fill="' + (TONE[g.tone] || 'var(--chart-track)') + '"/>' +
          '<text class="lp-legend" x="' + (lx + 18) + '" y="269">' + esc(g.n + ' ' + g.label.toLowerCase()) + '</text>';
        lx += 26 + g.label.length * 7.4;
      });
    }
    return out;
  };

  R.donut = function (d) {
    var items = d.items || [];
    var totalV = items.reduce(function (a, b) { return a + b.value; }, 0) || 1;
    var Rr = 86, C = 2 * Math.PI * Rr, acc = 0, GAP = 4;
    var out = '';
    items.forEach(function (it, i) {
      var frac = it.value / totalV;
      var len = Math.max(frac * C - GAP, 1);
      out += '<circle class="lp-arc lp-a" cx="170" cy="160" r="' + Rr + '" fill="none" stroke="' +
        PALETTE[i % PALETTE.length] + '" stroke-width="26" stroke-linecap="butt"' +
        ' stroke-dasharray="0 ' + C + '" data-dash="' + len.toFixed(2) + ' ' + C.toFixed(2) + '"' +
        ' stroke-dashoffset="' + (-(acc * C + GAP / 2)).toFixed(2) + '" transform="rotate(-90 170 160)"' +
        ' style="transition-delay:' + (REDUCED ? 0 : i * 120) + 'ms"/>';
      acc += frac;
    });
    items.forEach(function (it, i) {
      var y = 100 + i * 34;
      out += '<circle cx="326" cy="' + (y - 5) + '" r="7" fill="' + PALETTE[i % PALETTE.length] + '"/>' +
        '<text class="lp-legend" x="344" y="' + y + '">' + esc(it.label) + '</text>' +
        '<text class="lp-legend strong" x="612" y="' + y + '" text-anchor="end">' +
        Math.round((it.value / totalV) * 100) + '%</text>';
    });
    return out;
  };

  R.timeline = function (d) {
    var items = d.items || [];
    var x0 = 70, x1 = 590, y = 168;
    var step = items.length > 1 ? (x1 - x0) / (items.length - 1) : 0;
    var out = '<line class="lp-tl-rail" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/>';
    items.forEach(function (it, i) {
      var x = x0 + i * step, up = i % 2 === 0;
      var delay = REDUCED ? 0 : i * 140;
      out += '<g class="lp-a" data-fade="1" style="transition-delay:' + delay + 'ms">' +
        '<circle class="lp-tl-dot" cx="' + x + '" cy="' + y + '" r="9"/>' +
        '<line class="lp-tl-tick" x1="' + x + '" y1="' + (up ? y - 12 : y + 12) + '" x2="' + x + '" y2="' + (up ? y - 34 : y + 34) + '"/>' +
        '<text class="lp-tl-at" x="' + x + '" y="' + (up ? y - 44 : y + 56) + '" text-anchor="middle">' + esc(it.at) + '</text>' +
        wrap(it.label, x, up ? y - 66 : y + 78, 17, 'lp-tl-label', up) +
        '</g>';
    });
    return out;
  };

  R.stack = function (d) {
    var rounds = d.rounds || [];
    var base = rounds[0] ? rounds[0].you : 1;
    var x0 = 74, w = 96, gap = 42, floor = 236, maxH = 150;
    var out = '<text class="lp-axis" x="20" y="26">Your stake, round by round</text>';
    rounds.forEach(function (r, i) {
      var h = Math.max(14, (r.you / base) * maxH);
      var x = x0 + i * (w + gap);
      out += '<rect class="lp-stack-ghost" x="' + x + '" y="' + (floor - maxH) + '" width="' + w + '" height="' + maxH + '" rx="8"/>' +
        '<rect class="lp-stack lp-a" x="' + x + '" y="' + (floor - h) + '" width="' + w + '" height="' + h + '" rx="8"' +
        ' style="transform-origin:0 ' + floor + 'px;transition-delay:' + (REDUCED ? 0 : i * 110) + 'ms" data-scaley="1"/>' +
        '<text class="lp-stack-v lp-a" x="' + (x + w / 2) + '" y="' + (floor - h - 12) + '" text-anchor="middle" data-fade="1">' +
        r.you.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '%</text>' +
        '<text class="lp-blabel" x="' + (x + w / 2) + '" y="' + (floor + 26) + '" text-anchor="middle">' + esc(r.name) + '</text>' +
        (r.newMoney ? '<text class="lp-legend" x="' + (x + w / 2) + '" y="' + (floor + 48) + '" text-anchor="middle">+' + r.newMoney + '% new shares</text>' : '');
    });
    return out;
  };

  R.curve = function (d) {
    var pts = d.points || [], labels = d.xLabels || [];
    var x0 = 64, x1 = 604, yTop = 60, yBot = 244;
    var max = Math.max.apply(null, pts) * 1.08, min = Math.min(0, Math.min.apply(null, pts));
    var sx = function (i) { return x0 + (i / Math.max(1, pts.length - 1)) * (x1 - x0); };
    var sy = function (v) { return yBot - ((v - min) / (max - min || 1)) * (yBot - yTop); };

    var line = pts.map(function (v, i) { return (i ? 'L' : 'M') + sx(i) + ' ' + sy(v); }).join(' ');
    var area = line + ' L' + sx(pts.length - 1) + ' ' + yBot + ' L' + x0 + ' ' + yBot + ' Z';

    var out = '<text class="lp-axis" x="20" y="34">' + esc(d.yLabel || '') + '</text>' +
      '<line class="lp-grid" x1="' + x0 + '" y1="' + yBot + '" x2="' + x1 + '" y2="' + yBot + '"/>' +
      '<path class="lp-area lp-a" d="' + area + '" data-fade="1"/>' +
      '<path class="lp-line lp-a" d="' + line + '" pathLength="1" data-draw="1"/>';

    pts.forEach(function (v, i) {
      out += '<circle class="lp-pt lp-a" cx="' + sx(i) + '" cy="' + sy(v) + '" r="5.5" data-fade="1"' +
        ' style="transition-delay:' + (REDUCED ? 0 : 380 + i * 90) + 'ms"/>' +
        '<text class="lp-pt-v lp-a" x="' + sx(i) + '" y="' + (sy(v) - 16) + '" text-anchor="middle" data-fade="1"' +
        ' style="transition-delay:' + (REDUCED ? 0 : 420 + i * 90) + 'ms">' + num(v) + (d.unit || '') + '</text>' +
        '<text class="lp-axis" x="' + sx(i) + '" y="' + (yBot + 26) + '" text-anchor="middle">' + esc(labels[i] || '') + '</text>';
    });
    return out;
  };

  /* Crude but predictable SVG text wrapping: labels here are short. */
  function wrap(text, x, y, perLine, cls, growUp) {
    var words = String(text).split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      if ((cur + ' ' + w).trim().length > perLine) { if (cur) lines.push(cur); cur = w; }
      else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    // Above the rail the block has to grow upward, or it walks over its own label.
    var y0 = growUp ? y - (lines.length - 1) * 18 : y;
    return lines.map(function (l, i) {
      return '<text class="' + cls + '" x="' + x + '" y="' + (y0 + i * 18) + '" text-anchor="middle">' + esc(l) + '</text>';
    }).join('');
  }

  /* ---------- player ---------- */

  function mount(root, lesson) {
    var scenes = lesson.scenes || [];
    var total = scenes.reduce(function (a, s) { return a + s.t; }, 0);
    var elapsed = 0, idx = -1, playing = false, raf = 0, last = 0, ended = false;
    var live = JSON.parse(JSON.stringify(scenes)); // knob edits stay local to the session

    root.innerHTML =
      '<div class="lp-stage">' +
      '<svg class="lp-svg" viewBox="0 0 640 320" role="img" aria-label="' + esc(lesson.title) + ' illustration"></svg>' +
      '<div class="lp-knob" hidden><label></label><input type="range"><output></output></div>' +
      '<button type="button" class="lp-veil" data-lp="play"><span class="lp-veil-btn">▶</span>' +
      '<span class="lp-veil-t">Play, ' + esc(lesson.minutes) + ' min</span></button>' +
      '<div class="lp-done" hidden></div>' +
      '</div>' +
      '<div class="lp-cap"><p class="lp-cap-t"></p><p class="lp-cap-b"></p></div>' +
      '<div class="lp-controls">' +
      '<button type="button" class="lp-btn" data-lp="play" aria-label="Play">▶</button>' +
      '<button type="button" class="lp-btn" data-lp="prev" aria-label="Previous scene">⏮</button>' +
      '<button type="button" class="lp-btn" data-lp="next" aria-label="Next scene">⏭</button>' +
      '<div class="lp-track" role="slider" tabindex="0" aria-label="Timeline" aria-valuemin="0" aria-valuemax="' +
      Math.round(total) + '" aria-valuenow="0">' +
      scenes.map(function (s, i) {
        return '<span class="lp-seg" data-i="' + i + '" style="flex:' + s.t +
          '" title="' + esc(s.title) + '"><span class="lp-seg-fill"></span></span>';
      }).join('') +
      '</div>' +
      '<span class="lp-time mono">0:00 / ' + clock(total) + '</span>' +
      '<button type="button" class="lp-btn" data-lp="restart" aria-label="Restart">↺</button>' +
      '</div>' +
      '<ol class="lp-chapters">' +
      scenes.map(function (s, i) {
        return '<li><button type="button" data-lp="jump" data-i="' + i + '">' +
          '<span class="lp-ch-n mono">' + (i + 1) + '</span><span>' + esc(s.title) + '</span></button></li>';
      }).join('') +
      '</ol>' +
      '<p class="lp-note small muted">' + esc(lesson.note) + '</p>';

    var svg = root.querySelector('.lp-svg');
    var capT = root.querySelector('.lp-cap-t');
    var capB = root.querySelector('.lp-cap-b');
    var veil = root.querySelector('.lp-veil');
    var doneEl = root.querySelector('.lp-done');
    var timeEl = root.querySelector('.lp-time');
    var track = root.querySelector('.lp-track');
    var knob = root.querySelector('.lp-knob');
    var knobIn = knob.querySelector('input');
    var knobLab = knob.querySelector('label');
    var knobOut = knob.querySelector('output');
    var segs = Array.prototype.slice.call(root.querySelectorAll('.lp-seg'));
    var chapters = Array.prototype.slice.call(root.querySelectorAll('.lp-chapters button'));

    function sceneAt(sec) {
      var acc = 0;
      for (var i = 0; i < scenes.length; i++) {
        acc += scenes[i].t;
        if (sec < acc - 0.0001) return i;
      }
      return scenes.length - 1;
    }

    function startOf(i) {
      var acc = 0;
      for (var k = 0; k < i; k++) acc += scenes[k].t;
      return acc;
    }

    function paintVisual(i) {
      var s = live[i];
      svg.innerHTML = (R[s.visual] || R.stat)(s.data);
      // Let the browser see the "from" state before flipping to the final one.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          svg.querySelectorAll('.lp-a').forEach(function (el) {
            if (el.hasAttribute('data-scale')) el.style.transform = 'scaleX(' + el.getAttribute('data-scale') + ')';
            if (el.hasAttribute('data-scaley')) el.style.transform = 'scaleY(1)';
            if (el.hasAttribute('data-dash')) el.setAttribute('stroke-dasharray', el.getAttribute('data-dash'));
            el.classList.add('in');
          });
          countUp(svg.querySelector('[data-count]'));
        });
      });
    }

    function countUp(el) {
      if (!el) return;
      var target = +el.getAttribute('data-count');
      var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
      if (REDUCED) { el.textContent = pre + num(target) + suf; return; }
      var t0 = performance.now(), dur = 850;
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + num(target * e) + suf;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }

    function paintScene(i, force) {
      if (i === idx && !force) return;
      idx = i;
      var s = live[i];
      capT.textContent = s.title;
      capB.textContent = s.caption;
      chapters.forEach(function (b, k) { b.classList.toggle('now', k === i); });
      paintVisual(i);

      if (s.knob) {
        knob.hidden = false;
        knobLab.textContent = s.knob.label;
        knobIn.min = s.knob.min; knobIn.max = s.knob.max; knobIn.step = s.knob.step || 1;
        knobIn.value = s.data[s.knob.field];
        knobOut.textContent = s.data[s.knob.field] + (s.knob.unit || '');
      } else {
        knob.hidden = true;
      }
    }

    function paintProgress() {
      var acc = 0;
      segs.forEach(function (seg, i) {
        var w = (elapsed - acc) / scenes[i].t;
        seg.querySelector('.lp-seg-fill').style.transform = 'scaleX(' + Math.max(0, Math.min(1, w)) + ')';
        acc += scenes[i].t;
      });
      timeEl.textContent = clock(elapsed) + ' / ' + clock(total);
      track.setAttribute('aria-valuenow', Math.round(elapsed));
    }

    function tick(now) {
      if (!playing) return;
      var dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      elapsed = Math.min(total, elapsed + dt);
      paintScene(sceneAt(elapsed));
      paintProgress();
      if (elapsed >= total) return finish();
      raf = requestAnimationFrame(tick);
    }

    function play() {
      if (ended) return restart();
      playing = true;
      veil.hidden = true;
      root.classList.add('playing');
      setPlayIcons('❚❚', 'Pause');
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function pause() {
      playing = false;
      cancelAnimationFrame(raf);
      root.classList.remove('playing');
      setPlayIcons('▶', 'Play');
    }

    function setPlayIcons(glyph, label) {
      var b = root.querySelector('.lp-controls [data-lp="play"]');
      if (b) { b.textContent = glyph; b.setAttribute('aria-label', label); }
    }

    function seek(sec, keepPlaying) {
      ended = false;
      doneEl.hidden = true;
      elapsed = Math.max(0, Math.min(total - 0.01, sec));
      paintScene(sceneAt(elapsed), true);
      paintProgress();
      if (keepPlaying && !playing) play();
    }

    function restart() {
      ended = false;
      doneEl.hidden = true;
      elapsed = 0;
      paintScene(0, true);
      paintProgress();
      play();
    }

    function finish() {
      pause();
      ended = true;
      elapsed = total;
      paintProgress();
      showDone();
      document.dispatchEvent(new CustomEvent('bundle:lesson-complete', { detail: { slug: lesson.slug } }));
    }

    function showDone() {
      var Auth = window.BundleAuth;
      var signedIn = !!(Auth && Auth.signedIn());
      if (Auth && Auth.completeLesson) Auth.completeLesson(lesson.slug);

      var next = lesson.next;
      var back = location.pathname + location.search;
      var gate = Auth && Auth.gateUrl ? Auth.gateUrl(back) : '/signup?next=' + encodeURIComponent(back);

      doneEl.innerHTML =
        '<div class="lp-done-card">' +
        '<span class="lp-done-tick">✓</span>' +
        '<p class="lp-done-h">' + esc(lesson.title) + ', complete.</p>' +
        (signedIn
          ? '<p class="lp-done-s">Saved to your account. ' +
            (next ? 'Next up: ' + esc(next.title) + '.' : 'That is the whole path, nicely done.') + '</p>' +
            '<div class="lp-done-actions">' +
            (next ? '<a class="btn btn-primary btn-sm" href="/learn/' + esc(next.slug) + '">Next lesson <span class="arrow">→</span></a>' : '') +
            '<a class="btn btn-ghost btn-sm" href="/learn">Back to the Academy</a></div>'
          : '<p class="lp-done-s">Sign in to save your progress, so the path picks up where you left it on any device.</p>' +
            '<div class="lp-done-actions">' +
            '<a class="btn btn-gold btn-sm" href="' + esc(gate) + '">Sign in to save progress <span class="arrow">→</span></a>' +
            (next ? '<a class="btn btn-ghost btn-sm" href="/learn/' + esc(next.slug) + '">Skip, next lesson</a>' : '<a class="btn btn-ghost btn-sm" href="/learn">Back to the Academy</a>') +
            '</div>') +
        '<button type="button" class="lp-done-replay" data-lp="restart">Replay</button>' +
        '</div>';
      doneEl.hidden = false;
    }

    /* ---- events ---- */

    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-lp]');
      if (el) {
        var act = el.getAttribute('data-lp');
        if (act === 'play') return playing ? pause() : play();
        if (act === 'restart') return restart();
        if (act === 'prev') return seek(idx > 0 && elapsed - startOf(idx) < 1.2 ? startOf(idx - 1) : startOf(idx), playing);
        if (act === 'next') return idx < scenes.length - 1 ? seek(startOf(idx + 1), playing) : finish();
        if (act === 'jump') return seek(startOf(+el.getAttribute('data-i')), true);
      }
      var seg = e.target.closest('.lp-seg');
      if (seg) seek(startOf(+seg.getAttribute('data-i')), true);
    });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); seek(elapsed + 5, playing); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); seek(elapsed - 5, playing); }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); playing ? pause() : play(); }
    });

    /* The knob rewrites the live copy of the scene and repaints it, without
       touching the timeline: fiddling with a control should not cost your place. */
    knobIn.addEventListener('input', function () {
      var s = live[idx];
      if (!s || !s.knob) return;
      s.data[s.knob.field] = +knobIn.value;
      knobOut.textContent = knobIn.value + (s.knob.unit || '');
      paintVisual(idx);
    });

    /* Pause when the player scrolls out of view: nothing worse than narration
       running on a screen nobody is looking at. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (!en.isIntersecting && playing) pause(); });
      }, { threshold: 0.25 }).observe(root);
    }

    paintScene(0, true);
    paintProgress();
  }

  function boot() {
    document.querySelectorAll('.lp').forEach(function (root) {
      if (root.dataset.mounted) return;
      var tag = root.querySelector('script[type="application/json"]');
      if (!tag) return;
      root.dataset.mounted = '1';
      try { mount(root, JSON.parse(tag.textContent)); } catch (e) { root.hidden = true; }
    });
  }

  window.BundleLesson = { mount: mount };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
