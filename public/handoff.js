/* Bundle hand-off overlay.
   Sits between finishing the investor-profile questionnaire and the next page
   (sign-up, or the dashboard if already signed in).

   This used to run for 7.5 seconds through five steps including "Checking
   eligibility and guardrails", which is work this site does not do: eligibility
   is checked by the venue at the point of investment, not here. A progress
   animation that narrates work nobody is doing is a manufactured wait, so it
   was cut to three steps that are each true, shortened to under two seconds,
   and made skippable with Escape, a click, or the Skip button.

   If you add a step here, it has to name something the code actually does.

   Usage:  BundleHandoff.run('/signup?next=/dashboard') */
(function () {
  'use strict';

  var STEPS = [
    'Saving your answers',       // BundleAuth.saveDraft / saveProfile
    'Setting your guardrails',   // ticket size and concentration cap from the wizard
    'Opening your plan',         // the navigation itself
  ];

  var MARK =
    '<svg viewBox="0 0 32 32" width="38" height="38" aria-hidden="true">' +
    '<rect class="hb hb1" x="2.4"  y="15" width="5" height="14" rx="2.5" fill="#ffffff"/>' +
    '<rect class="hb hb2" x="9.8"  y="3"  width="5" height="26" rx="2.5" fill="#ffffff"/>' +
    '<rect class="hb hb3" x="17.2" y="11" width="5" height="18" rx="2.5" fill="#c9a227"/>' +
    '<rect class="hb hb4" x="24.6" y="7"  width="5" height="22" rx="2.5" fill="#ffffff"/>' +
    '</svg>';

  function run(next) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-a11y-motion') === 'reduce';
    // 3 steps × 520ms ≈ 1.6s end to end. Long enough to read, short enough
    // that nobody is being held.
    var stepMs = reduced ? 180 : 520;
    var total = STEPS.length * stepMs;

    var el = document.createElement('div');
    el.className = 'handoff';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="handoff-inner">' +
      '<span class="handoff-mark">' + MARK + '</span>' +
      '<p class="handoff-title">Saving your plan</p>' +
      '<p class="handoff-sub">Turning your answers into guardrails. This stays on your device.</p>' +
      '<ul class="handoff-steps">' +
      STEPS.map(function (s) {
        return '<li><span class="hs-dot"></span><span class="hs-label">' + s + '</span></li>';
      }).join('') +
      '</ul>' +
      '<div class="handoff-bar"><span></span></div>' +
      '<button type="button" class="handoff-skip">Skip</button>' +
      '</div>';

    document.body.appendChild(el);
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /* Leave once, whether the timer got there first or the user did. */
    var left = false;
    var timers = [];
    function go() {
      if (left) return;
      left = true;
      timers.forEach(clearTimeout);
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      window.location.href = next;
    }
    function onKey(ev) {
      if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        go();
      }
    }
    document.addEventListener('keydown', onKey, true);
    el.addEventListener('click', go);
    var skip = el.querySelector('.handoff-skip');
    if (skip) setTimeout(function () { skip.focus(); }, 60);

    var bar = el.querySelector('.handoff-bar > span');
    var items = Array.prototype.slice.call(el.querySelectorAll('.handoff-steps li'));

    requestAnimationFrame(function () {
      el.classList.add('in');
      bar.style.transitionDuration = total + 'ms';
      requestAnimationFrame(function () { bar.style.width = '100%'; });
    });

    items.forEach(function (li, i) {
      timers.push(setTimeout(function () {
        li.classList.add('active');
        if (i > 0) {
          items[i - 1].classList.remove('active');
          items[i - 1].classList.add('done');
        }
      }, i * stepMs));
    });

    // last step ticks just before we leave
    timers.push(setTimeout(function () {
      var last = items[items.length - 1];
      last.classList.remove('active');
      last.classList.add('done');
    }, Math.max(0, total - 120)));

    timers.push(setTimeout(function () {
      el.classList.add('out');
      timers.push(setTimeout(go, 200));
    }, total + 160));
  }

  window.BundleHandoff = { run: run, steps: STEPS };
})();
