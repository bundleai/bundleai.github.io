// Interaction QA: exercises nav dropdown, mobile menu, meter slider, quiz, waitlist form.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

const shot = (page, name) =>
  page.screenshot({ path: `/tmp/bundle-shots/ix-${name}.png` });

// 1. Desktop: nav dropdown open
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await desktop.addStyleTag({ content: '*{transition-duration:0s !important}' });
await desktop.evaluate(() =>
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
);
await desktop.hover('.nav-item.has-menu >> nth=0');
await desktop.waitForTimeout(350);
await shot(desktop, 'nav-dropdown');

// 2. Meter slider at 12 and 24 positions
const setMeter = async (v) => {
  await desktop.evaluate((val) => {
    const r = document.querySelector('#meter-range');
    r.value = String(val);
    r.dispatchEvent(new Event('input', { bubbles: true }));
    document.documentElement.style.scrollBehavior = 'auto';
    document
      .querySelector('.meter-demo-card')
      .scrollIntoView({ block: 'center', behavior: 'instant' });
  }, v);
  await desktop.waitForTimeout(400);
};
await setMeter(12);
await shot(desktop, 'meter-12');
await setMeter(24);
await shot(desktop, 'meter-24');

// 3. Waitlist submit
await desktop.goto('http://localhost:4321/waitlist', { waitUntil: 'networkidle' });
await desktop.evaluate(() =>
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
);
await desktop.fill('input[type="email"]', 'test@example.com');
await desktop.click('[data-waitlist] button[type="submit"]');
await desktop.waitForTimeout(400);
await shot(desktop, 'waitlist-done');

// 4. Lesson quiz: wrong answer feedback
await desktop.goto(
  'http://localhost:4321/learn/why-diversification-matters',
  { waitUntil: 'networkidle' }
);
await desktop.evaluate(() => {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  document.documentElement.style.scrollBehavior = 'auto';
});
await desktop.check('input[name="q1"][value="a"]');
await desktop.evaluate(() =>
  document.querySelector('[data-quiz]').scrollIntoView({ block: 'center', behavior: 'instant' })
);
await desktop.waitForTimeout(300);
await shot(desktop, 'quiz-wrong');

// 5. Login pre-launch notice
await desktop.goto('http://localhost:4321/login', { waitUntil: 'networkidle' });
await desktop.evaluate(() =>
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
);
await desktop.click('button:has-text("Log in")');
await desktop.waitForTimeout(300);
await shot(desktop, 'login-notice');

// 6. Mobile: burger menu open
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await mobile.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await mobile.click('#nav-burger');
await mobile.waitForTimeout(300);
await mobile.click('.m-group >> nth=0');
await mobile.waitForTimeout(300);
await shot(mobile, 'mobile-menu');

await browser.close();
console.log('interaction shots saved');
