/* Bundle hand-off overlay.
   Sits between finishing the investor-profile questionnaire and the next page
   (sign-up, or the dashboard if already signed in). Runs ~7.5s, stepping
   through what Bundle is doing with the answers, then navigates.

   Usage:  BundleHandoff.run('/signup?next=/dashboard') */
(function () {
  'use strict';

  var STEPS = [
    'Reading your answers',
    'Understanding your goals',
    'Checking eligibility and guardrails',
    'Creating your investor profile',
    'Building your portfolio',
  ];

  var MARK =
    '<svg viewBox="0 0 32 32" width="38" height="38" aria-hidden="true">' +
    '<rect class="hb hb1" x="2.4"  y="15" width="5" height="14" rx="2.5" fill="#ffffff"/>' +
    '<rect class="hb hb2" x="9.8"  y="3"  width="5" height="26" rx="2.5" fill="#ffffff"/>' +
    '<rect class="hb hb3" x="17.2" y="11" width="5" height="18" rx="2.5" fill="#c9a227"/>' +
    '<rect class="hb hb4" x="24.6" y="7"  width="5" height="22" rx="2.5" fill="#ffffff"/>' +
    '</svg>';

  function run(next) {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 5 steps × 1400ms ≈ 7.0s, plus the fade in/out ≈ 7.5s end to end.
    var stepMs = reduced ? 420 : 1400;
    var total = STEPS.length * stepMs;

    var el = document.createElement('div');
    el.className = 'handoff';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="handoff-inner">' +
      '<span class="handoff-mark">' + MARK + '</span>' +
      '<p class="handoff-title">Building your portfolio</p>' +
      '<p class="handoff-sub">A moment while we turn your answers into a plan.</p>' +
      '<ul class="handoff-steps">' +
      STEPS.map(function (s) {
        return '<li><span class="hs-dot"></span><span class="hs-label">' + s + '</span></li>';
      }).join('') +
      '</ul>' +
      '<div class="handoff-bar"><span></span></div>' +
      '</div>';

    document.body.appendChild(el);
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var bar = el.querySelector('.handoff-bar > span');
    var items = Array.prototype.slice.call(el.querySelectorAll('.handoff-steps li'));

    requestAnimationFrame(function () {
      el.classList.add('in');
      bar.style.transitionDuration = total + 'ms';
      requestAnimationFrame(function () { bar.style.width = '100%'; });
    });

    items.forEach(function (li, i) {
      setTimeout(function () {
        li.classList.add('active');
        if (i > 0) {
          items[i - 1].classList.remove('active');
          items[i - 1].classList.add('done');
        }
      }, i * stepMs);
    });

    // last step ticks just before we leave
    setTimeout(function () {
      var last = items[items.length - 1];
      last.classList.remove('active');
      last.classList.add('done');
    }, total - 140);

    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () {
        document.body.style.overflow = prevOverflow;
        window.location.href = next;
      }, 280);
    }, total + 240);
  }

  window.BundleHandoff = { run: run, steps: STEPS };
})();
