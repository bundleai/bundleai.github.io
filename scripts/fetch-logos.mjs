#!/usr/bin/env node
/**
 * Downloads company logos into public/logos/ and writes the manifest that
 * src/components/CoLogo.astro reads.
 *
 * Logos are self-hosted rather than hot-linked: a third-party logo CDN would
 * leak every visitor's IP to that service on every page view, and would break
 * the site whenever it went down or changed terms. Downloading once keeps the
 * build hermetic.
 *
 * Sources are favicon services, tried in order. Anything that fails is simply
 * absent from the manifest and the component falls back to initials.
 *
 * Usage: node scripts/fetch-logos.mjs [--force]
 */
import { writeFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'public/logos';
const MANIFEST = 'src/data/logos.ts';
const FORCE = process.argv.includes('--force');

/**
 * Deal id -> primary domain. Only companies with a real, checkable web
 * presence are listed; the rest keep their initials avatar, which is a
 * perfectly good fallback and avoids shipping a wrong company's mark.
 */
const DOMAINS = {
  // Pre-IPO / secondary names
  openai: 'openai.com',
  databricks: 'databricks.com',
  stripe: 'stripe.com',
  revolut: 'revolut.com',
  anduril: 'anduril.com',
  ramp: 'ramp.com',
  perplexity: 'perplexity.ai',
  'shield-ai': 'shield.ai',
  'figure-ai': 'figure.ai',
  fanatics: 'fanatics.com',
  rippling: 'rippling.com',
  deel: 'deel.com',
  'skild-ai': 'skild.ai',
  'epic-games': 'epicgames.com',
  discord: 'discord.com',
  kraken: 'kraken.com',
  lambda: 'lambda.ai',
  whoop: 'whoop.com',
  glean: 'glean.com',
  abridge: 'abridge.com',
  airtable: 'airtable.com',
  chainalysis: 'chainalysis.com',
  flexport: 'flexport.com',
  'impossible-foods': 'impossiblefoods.com',

  // Crowdfunding raises with a live site
  bito: 'bito.ai',
  'rise-robotics': 'riserobotics.com',
  'biostate-ai': 'biostate.ai',
  airthium: 'airthium.com',
  rentberry: 'rentberry.com',
  atombeam: 'atombeamtech.com',
  artly: 'artly.coffee',
  rhealth: 'rhealth.com',
  'rejuvenate-bio': 'rejuvenatebio.com',
  'oshi-inc': 'oshiseafood.com',
  'blushift-aerospace': 'blushiftaerospace.com',
  hevo: 'hevo.com',
  endosound: 'endosound.com',
  'cru-world-wine': 'cruworldwine.com',
  'deadly-dozen': 'deadlydozen.co.uk',
  'presto-coffee': 'prestocoffee.co.uk',
  nanoloom: 'nanoloom.co.uk',
  equisera: 'equisera.com',
  lireka: 'lireka.com',
  'alpha-311': 'alpha-311.com',
  collider: 'drinkcollider.com',
  greenback: 'greenbackrecycling.com',

  // Venues (used by the comparison rows)
  crowdcube: 'crowdcube.com',
  wefunder: 'wefunder.com',
  'republic-eu': 'republic.com',
  startengine: 'startengine.com',
  forge: 'forgeglobal.com',
  hiive: 'hiive.com',
  equityzen: 'equityzen.com',
  'nasdaq-pm': 'nasdaqprivatemarket.com',
  linqto: 'linqto.com',
  upmarket: 'upmarket.co',
  odin: 'joinodin.com',
  seedblink: 'seedblink.com',
};

const sources = (domain) => [
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
];

/**
 * Average luminance of the opaque pixels in a 32bpp ICO. A logo that is
 * essentially white (Anduril's is pure white on transparent) disappears on a
 * white tile, so those are flagged and rendered on a dark tile instead.
 * Only ICO is parsed; PNG/SVG would need a decoder, and any miss just falls
 * back to the normal light tile.
 */
function icoLuminance(buf) {
  try {
    const n = buf.readUInt16LE(4);
    let best = null;
    for (let k = 0; k < n; k++) {
      const o = 6 + k * 16;
      const w = buf[o] || 256;
      if (!best || w > best.w) best = { w, h: buf[o + 1] || 256, off: buf.readUInt32LE(o + 12) };
    }
    if (!best) return null;
    const hdr = buf.readUInt32LE(best.off);
    if (buf.readUInt16LE(best.off + 14) !== 32) return null;
    const px = best.off + hdr;
    let sum = 0;
    let cnt = 0;
    for (let i = 0; i < best.w * best.h; i++) {
      const p = px + i * 4;
      if (p + 3 >= buf.length) break;
      if (buf[p + 3] < 200) continue;
      sum += 0.2126 * buf[p + 2] + 0.7152 * buf[p + 1] + 0.0722 * buf[p];
      cnt++;
    }
    return cnt ? sum / cnt : null;
  } catch {
    return null;
  }
}

/** Logos known to be near-white in formats we cannot measure. */
const FORCE_DARK = new Set(['anduril']);

const EXT = { 'image/png': 'png', 'image/vnd.microsoft.icon': 'ico', 'image/x-icon': 'ico', 'image/svg+xml': 'svg', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

async function grab(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: 'follow' });
    if (!res.ok) return null;
    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    const ext = EXT[type];
    if (!ext) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Anything this small is a blank or error pixel, not a logo.
    if (buf.length < 120) return null;
    return { buf, ext };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const ids = Object.keys(DOMAINS);
const found = {};
const dark = new Set();
let fetched = 0;
let cached = 0;

function noteTone(id, buf, ext) {
  if (FORCE_DARK.has(id)) { dark.add(id); return; }
  if (ext !== 'ico') return;
  const l = icoLuminance(buf);
  if (l != null && l > 225) dark.add(id);
}

await Promise.all(
  ids.map(async (id) => {
    const domain = DOMAINS[id];

    if (!FORCE) {
      for (const ext of ['svg', 'png', 'ico', 'jpg', 'webp']) {
        const p = join(OUT_DIR, `${id}.${ext}`);
        if (existsSync(p) && statSync(p).size > 120) {
          found[id] = `/logos/${id}.${ext}`;
          noteTone(id, readFileSync(p), ext);
          cached++;
          return;
        }
      }
    }

    for (const url of sources(domain)) {
      const hit = await grab(url);
      if (hit) {
        writeFileSync(join(OUT_DIR, `${id}.${hit.ext}`), hit.buf);
        found[id] = `/logos/${id}.${hit.ext}`;
        noteTone(id, hit.buf, hit.ext);
        fetched++;
        return;
      }
    }
    console.warn(`  no logo: ${id} (${domain})`);
  })
);

const entries = Object.keys(found)
  .sort()
  .map((id) => `  '${id}': '${found[id]}',`)
  .join('\n');

writeFileSync(
  MANIFEST,
  `/**
 * Logo manifest — generated by scripts/fetch-logos.mjs, do not edit by hand.
 *
 * Maps deal/venue id to a self-hosted logo in public/logos/. Ids absent here
 * have no logo and fall back to an initials avatar.
 *
 * Logos are the trademarks of their respective owners and are used only to
 * identify the company or venue a listing refers to.
 */

export const logos: Record<string, string> = {
${entries}
};

/** Near-white marks that need a dark tile to be visible at all. */
export const darkTile: ReadonlySet<string> = new Set([
${[...dark].sort().map((id) => `  '${id}',`).join('\n')}
]);

export const logoFor = (id: string): string | undefined => logos[id];
export const needsDarkTile = (id: string): boolean => darkTile.has(id);
`
);

console.log(`logos: ${fetched} fetched, ${cached} cached, ${ids.length - Object.keys(found).length} missing`);
console.log(`manifest: ${MANIFEST} (${Object.keys(found).length} entries)`);
