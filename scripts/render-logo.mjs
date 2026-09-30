/**
 * Rasterise the brand lockup to PNG.
 *
 * The logo is not a single SVG: it is the bar mark plus a Playfair Display
 * wordmark set in live text, so tracing the SVG alone would lose half of it.
 * This renders the real component markup in Chrome, waits for the webfont to
 * land, and shoots each variant on a transparent background.
 *
 * Usage: node scripts/render-logo.mjs
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('docs/brand');

// Mirrors src/components/Logo.astro and the tokens in global.css.
const INK = '#14281e';        // --ink, the wordmark
const BAR = '#21402e';        // --green, the mark
const GOLD = '#c9a227';       // --gold, the third bar
const GOLD_DEEP = '#ad8a1d';  // --gold-deep, the ".ai"

/* The component sets `gap: 0.6rem` and `translateY(-1px)`, both FIXED pixels
   against a 26px mark. Scaling the artwork up means re-expressing them as
   ratios of that 26, or the lockup comes out tighter and higher than the logo
   people actually see on the site. */
const GAP = 0.6 * 16 / 26;   // 0.369
const LIFT = 1 / 26;         // 0.038

const page = (tone, markOnly, size) => {
  const bar = tone === 'white' ? '#ffffff' : BAR;
  const word = tone === 'white' ? '#ffffff' : INK;
  const ai = tone === 'white' ? GOLD : GOLD_DEEP;
  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; background: transparent; }
  body { display: inline-block; }
  .logo {
    display: inline-flex; align-items: center; gap: ${size * GAP}px;
    line-height: 1; padding: ${size * 0.12}px;
  }
  .word {
    font-family: "Playfair Display", Georgia, serif;
    font-weight: 400; letter-spacing: -0.015em;
    font-size: ${size * 0.95}px; color: ${word};
    transform: translateY(-${size * LIFT}px);
  }
  .ai { color: ${ai}; }
</style></head>
<body><span class="logo" id="shot">
  <svg width="${size}" height="${size}" viewBox="0 0 32 32" role="img" aria-label="Bundle.ai">
    <rect x="2.4"  y="15" width="5" height="14" rx="2.5" fill="${bar}"/>
    <rect x="9.8"  y="3"  width="5" height="26" rx="2.5" fill="${bar}"/>
    <rect x="17.2" y="11" width="5" height="18" rx="2.5" fill="${GOLD}"/>
    <rect x="24.6" y="7"  width="5" height="22" rx="2.5" fill="${bar}"/>
  </svg>
  ${markOnly ? '' : '<span class="word">Bundle<span class="ai">.ai</span></span>'}
</span></body></html>`;
};

/** The app icon is its own artwork: white bars on a rounded green tile. */
const iconPage = (px) => `<!doctype html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}body{display:inline-block}</style></head>
<body><svg id="shot" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}">
  <rect width="64" height="64" rx="14" fill="${BAR}"/>
  <g fill="#FFFFFF">
    <rect x="7.4"  y="31" width="9" height="22" rx="4.5"/>
    <rect x="20.8" y="13" width="9" height="40" rx="4.5"/>
    <rect x="34.2" y="25" width="9" height="28" rx="4.5"/>
    <rect x="47.6" y="19" width="9" height="34" rx="4.5"/>
  </g>
</svg></body></html>`;

const variants = [
  { file: 'bundle-logo.png',            html: page('default', false, 256), note: 'full lockup, for light backgrounds' },
  { file: 'bundle-logo-white.png',      html: page('white',   false, 256), note: 'full lockup, for dark backgrounds' },
  { file: 'bundle-mark.png',            html: page('default', true,  400), note: 'mark only, for light backgrounds' },
  { file: 'bundle-mark-white.png',      html: page('white',   true,  400), note: 'mark only, for dark backgrounds' },
  { file: 'bundle-icon.png',            html: iconPage(1024),              note: 'app icon, solid green tile' },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
// 3x so the smallest variant still lands near 2000px on its long edge.
const ctx = await browser.newContext({ deviceScaleFactor: 3 });
const pg = await ctx.newPage();

for (const v of variants) {
  await pg.setContent(v.html, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  const el = await pg.$('#shot');
  const file = path.join(OUT, v.file);
  await el.screenshot({ path: file, omitBackground: true });
  const box = await el.boundingBox();
  console.log(
    `${v.file.padEnd(24)} ${String(Math.round(box.width * 3)).padStart(5)}x${String(Math.round(box.height * 3)).padEnd(5)}  ${v.note}`
  );
}

await browser.close();
