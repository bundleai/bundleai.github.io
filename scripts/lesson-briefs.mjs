#!/usr/bin/env node
/**
 * Generates one NotebookLM source document per Academy lesson, as PDF.
 *
 * NotebookLM builds its video from whatever the source says, so these are
 * written as briefing documents rather than as the lesson itself: the argument
 * in order, the numbers with their basis, the visuals to draw, the narration
 * beats, and an explicit "what not to say" section so the generated video does
 * not drift into advice or invent figures.
 *
 * Content comes from src/data/lessons.ts, so the videos and the site cannot
 * disagree with each other.
 *
 * Usage: node scripts/lesson-briefs.mjs
 * Output: docs/notebooklm/<slug>.pdf
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright-core';

const OUT = 'docs/notebooklm';
const TMP = '.lesson-briefs-tmp';

// --- load the lesson data by transpiling the TS module ---
mkdirSync(TMP, { recursive: true });
execSync(
  `node_modules/.bin/esbuild src/data/lessons.ts --format=esm --platform=node --outfile=${TMP}/lessons.mjs --log-level=error`
);
const { lessons } = await import(`../${TMP}/lessons.mjs`);

const esc = (s) =>
  String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

/** Turns a scene's data blob into a plain-English description of the visual. */
function describeVisual(scene) {
  const d = scene.data || {};
  switch (scene.visual) {
    case 'dots': {
      if (d.groups) {
        const parts = d.groups.map((g) => `${g.n} ${g.label.toLowerCase()}`);
        return `A grid of ${d.total} dots, one per company, split into: ${parts.join('; ')}.`;
      }
      if (d.mode === 'coverage') {
        return `A grid of ${d.total} dots where ${d.held} are held, showing how many winners a portfolio of that size is likely to capture at a ${Math.round((d.winRate || 0) * 100)}% hit rate.`;
      }
      return `A grid of ${d.total ?? 'many'} dots representing individual companies.`;
    }
    case 'bars': {
      const items = (d.items || []).map((i) => `${i.label} = ${i.value}${d.unit ? ' ' + d.unit : ''}`);
      return `A bar chart${d.unit ? ` measured in ${d.unit}` : ''}: ${items.join('; ')}.`;
    }
    case 'curve':
      return `A curve over time. ${d.caption || 'Shape matters more than precise values.'}`;
    case 'stack':
      return 'A stacked bar showing how the whole is divided, and how the division shifts.';
    default:
      return `A ${scene.visual} visual.`;
  }
}

function page(l) {
  const scenes = l.scenes
    .map(
      (s, i) => `
      <section class="beat">
        <h3><span class="n">${i + 1}</span> ${esc(s.title)}</h3>
        <p class="say"><b>Narration:</b> ${esc(s.caption)}</p>
        <p class="show"><b>On screen:</b> ${esc(describeVisual(s))}</p>
        <p class="hold"><b>Hold:</b> about ${s.t} seconds${s.knob ? ` · interactive control: ${esc(s.knob.label)} (${s.knob.min}–${s.knob.max}${s.knob.unit ? ' ' + s.knob.unit : ''})` : ''}</p>
      </section>`
    )
    .join('');

  const prose = (l.text || []).map((p) => `<p>${esc(p)}</p>`).join('');
  const takeaways = (l.takeaways || []).map((t) => `<li>${esc(t)}</li>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(l.title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #14281e;
         font-size: 10.5pt; line-height: 1.55; margin: 0; }
  h1 { font-size: 22pt; margin: 0 0 2mm; letter-spacing: -0.5pt; }
  h2 { font-size: 12pt; margin: 8mm 0 3mm; padding-bottom: 1.5mm;
       border-bottom: 1.5pt solid #21402e; text-transform: uppercase;
       letter-spacing: 0.8pt; }
  h3 { font-size: 11pt; margin: 0 0 2mm; }
  p { margin: 0 0 2.5mm; }
  .meta { color: #5f705f; font-size: 9pt; margin-bottom: 4mm; }
  .lede { font-size: 12pt; color: #34473a; border-left: 3pt solid #c9a227;
          padding-left: 4mm; margin-bottom: 5mm; }
  .beat { border: 0.7pt solid #d9e2db; border-radius: 3mm; padding: 4mm;
          margin-bottom: 3mm; break-inside: avoid; }
  .n { display: inline-block; background: #21402e; color: #fff; width: 6mm; height: 6mm;
       border-radius: 50%; text-align: center; line-height: 6mm; font-size: 8.5pt;
       margin-right: 2mm; }
  .say { color: #14281e; }
  .show, .hold { color: #5f705f; font-size: 9.5pt; }
  ul { margin: 0 0 3mm; padding-left: 5mm; }
  li { margin-bottom: 1.5mm; }
  .rules li { margin-bottom: 2mm; }
  .warn { background: #fdf6e3; border: 0.7pt solid #e6d9a8; border-radius: 3mm;
          padding: 4mm; break-inside: avoid; }
  .foot { margin-top: 8mm; padding-top: 3mm; border-top: 0.7pt solid #d9e2db;
          color: #5f705f; font-size: 8.5pt; }
</style></head><body>

<h1>${esc(l.title)}</h1>
<p class="meta">Bundle Academy · ${esc(l.category)} · Level ${l.level} · ${l.minutes} min ·
   Source document for NotebookLM video generation</p>

<p class="lede">${esc(l.blurb)}</p>

<h2>What this video must land</h2>
<p>By the end the viewer should be able to state the argument below in their own words.
   It is one argument, not a list of tips. Every number is illustrative of published
   ranges, not a forecast of any specific investment.</p>
<ul>${takeaways}</ul>

<h2>The argument, in order</h2>
${scenes}

<h2>The same argument in prose</h2>
${prose}

<h2>Tone and constraints</h2>
<div class="warn">
  <ul class="rules">
    <li><b>Never give advice.</b> Describe how the asset class behaves. Do not tell the
        viewer what to buy, how much to invest, or that anything is a good opportunity.
        No "you should", no "we recommend".</li>
    <li><b>Do not invent numbers.</b> Use only the figures in this document. If a figure
        is not here, leave it out rather than estimating one.</li>
    <li><b>Keep the risk honest.</b> Losing everything is the single most likely outcome
        for any one early-stage company. Never soften that, and never end on a purely
        upbeat note that contradicts it.</li>
    <li><b>Plain English.</b> UK spelling. Expand any term the first time it appears.
        No hype words: no "unlock", "supercharge", "game-changing", "revolutionary".</li>
    <li><b>Calm, factual delivery.</b> This is an explainer, not a pitch. No urgency,
        no countdowns, no scarcity.</li>
    <li><b>No specific companies.</b> Do not name real companies as examples, and do not
        imply any listing is available or recommended.</li>
  </ul>
</div>

<h2>Basis of the figures</h2>
<p>${esc(l.note)}</p>

<p class="foot">Bundle is an aggregator of private-market opportunities listed on
third-party venues. It holds no client money, executes no trades and gives no advice.
Private-market investments are illiquid, are not covered by the FSCS, and you may lose
all the money you invest. This document is educational source material, not a financial
promotion.</p>
</body></html>`;
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--no-sandbox'],
});

// One page per lesson, rendered concurrently.
await Promise.all(
  lessons.map(async (l) => {
    const p = await browser.newPage();
    await p.setContent(page(l), { waitUntil: 'load' });
    await p.pdf({ path: `${OUT}/${l.slug}.pdf`, format: 'A4', printBackground: true });
    await p.close();
    console.log(`  ${OUT}/${l.slug}.pdf`);
  })
);

await browser.close();
rmSync(TMP, { recursive: true, force: true });
console.log(`\n${lessons.length} briefs written to ${OUT}/`);
