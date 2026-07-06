// QA screenshot helper: node scripts/shoot.mjs <path> <outname> [--mobile] [--full] [--scroll=N]
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const path = args[0] || '/';
const out = args[1] || 'shot';
const mobile = args.includes('--mobile');
const full = args.includes('--full');
const scrollArg = args.find((a) => a.startsWith('--scroll='));
const scrollY = scrollArg ? parseInt(scrollArg.split('=')[1], 10) : 0;
const selArg = args.find((a) => a.startsWith('--sel='));
const sel = selArg ? selArg.split('=')[1] : null;

const browser = await chromium.launch({
  executablePath:
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 960 },
  deviceScaleFactor: mobile ? 2 : 1,
});

await page.goto(`http://localhost:4321${path}`, { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: '*{transition-duration:0s !important;animation-duration:0s !important}',
});
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  document.querySelectorAll('[data-count]').forEach((el) => {
    const d = parseInt(el.dataset.decimals || '0', 10);
    const v = parseFloat(el.dataset.count || '0');
    el.textContent =
      'plain' in el.dataset
        ? String(v)
        : v.toLocaleString('en-GB', {
            minimumFractionDigits: d,
            maximumFractionDigits: d,
          });
  });
});
await page.waitForTimeout(400);
if (scrollY) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(900);
}
if (sel) {
  await page.evaluate((s) => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector(s)?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, sel);
  await page.waitForTimeout(600);
}
await page.screenshot({
  path: `/tmp/bundle-shots/${out}.png`,
  fullPage: full,
});
await browser.close();
console.log(`saved /tmp/bundle-shots/${out}.png`);
