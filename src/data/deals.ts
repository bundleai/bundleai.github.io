/**
 * Aggregated deal + venue data powering the market UI.
 *
 * Sourced from venue public pages on 19 July 2026:
 *  - Secondary / pre-IPO rows: Forge Global public "Forge Price" and
 *    Forge Price valuation (forgeglobal.com/<slug>_stock/), all marked
 *    "Updated Jul 19, 2026" at capture time.
 *  - Crowdfunding rows: Crowdcube public company pages (total raised /
 *    investor count) and Wefunder explore listings (raised, investors,
 *    valuation caps, closing status).
 *
 * Prices are indicative venue marks, not live quotes or offers. Refresh
 * by re-scraping the `url` on each deal. Companies checked and excluded:
 * SpaceX (IPO'd June 2026, NASDAQ: SPCX), Anthropic (no direct share
 * transfers permitted on Forge), Canva/Monzo/Starling (no public mark).
 */

export const dataAsOf = '19 July 2026';

export type DealType = 'crowdfunding' | 'secondary' | 'pre-ipo';

export interface Platform {
  id: string;
  name: string;
  type: DealType | 'spv';
  region: string;
}

export interface Deal {
  id: string;
  name: string;
  code: string; // short ticker-style code (Bundle's own, not official)
  sector: string;
  type: DealType;
  platform: string; // Platform.id
  url: string; // the venue page this deal lives on
  currency: '£' | '$' | '€';
  price?: number; // per-share venue mark (Forge Price), if published
  change?: number; // % move shown by the venue alongside the mark
  valuation: string; // Forge Price valuation, or crowdfunding valuation (cap)
  raised?: string; // crowdfunding: total raised shown publicly
  investors?: number; // crowdfunding: investor count shown publicly
  closes?: string; // e.g. '2 days' when the venue displays it
  status?: string; // e.g. 'Almost fully funded'
  minTicket: string;
  trending?: boolean;
  hue: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';
}

export const platforms: Platform[] = [
  { id: 'crowdcube', name: 'Crowdcube', type: 'crowdfunding', region: 'UK · EU' },
  { id: 'republic-eu', name: 'Republic Europe', type: 'crowdfunding', region: 'UK · EU' },
  { id: 'wefunder', name: 'Wefunder', type: 'crowdfunding', region: 'US' },
  { id: 'startengine', name: 'StartEngine', type: 'crowdfunding', region: 'US' },
  { id: 'seedblink', name: 'SeedBlink', type: 'crowdfunding', region: 'EU' },
  { id: 'equityzen', name: 'EquityZen', type: 'pre-ipo', region: 'US' },
  { id: 'forge', name: 'Forge Global', type: 'secondary', region: 'US' },
  { id: 'hiive', name: 'Hiive', type: 'secondary', region: 'US · CA' },
  { id: 'nasdaq-pm', name: 'Nasdaq Private Market', type: 'secondary', region: 'US' },
  { id: 'odin', name: 'Odin', type: 'spv', region: 'UK' },
];

export const platformName = (id: string): string =>
  platforms.find((p) => p.id === id)?.name ?? id;

export const deals: Deal[] = [
  /* ---- Pre-IPO & secondaries — Forge Global public marks, 19 Jul 2026 ---- */
  {
    id: 'openai', name: 'OpenAI', code: 'OAI', sector: 'AI',
    type: 'pre-ipo', platform: 'forge',
    url: 'https://forgeglobal.com/openai_stock/',
    currency: '$', price: 721.85, change: 0.02, valuation: '$894.3bn',
    minTicket: 'Accredited', trending: true, hue: 'c1',
  },
  {
    id: 'databricks', name: 'Databricks', code: 'DBRX', sector: 'Data & AI',
    type: 'pre-ipo', platform: 'forge',
    url: 'https://forgeglobal.com/databricks_stock/',
    currency: '$', price: 242.04, change: 7.57, valuation: '$170.7bn',
    minTicket: 'Accredited', trending: true, hue: 'c2',
  },
  {
    id: 'revolut', name: 'Revolut', code: 'REV', sector: 'Fintech',
    type: 'pre-ipo', platform: 'forge',
    url: 'https://forgeglobal.com/revolut_stock/',
    currency: '$', price: 1315.53, change: -4.74, valuation: '$71.4bn',
    minTicket: 'Accredited', trending: true, hue: 'c5',
  },
  {
    id: 'stripe', name: 'Stripe', code: 'STRP', sector: 'Fintech',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/stripe_stock/',
    currency: '$', price: 72.45, change: 0.61, valuation: '$180.0bn',
    minTicket: 'Accredited', hue: 'c4',
  },
  {
    id: 'anduril', name: 'Anduril', code: 'ANDL', sector: 'Defence',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/anduril_stock/',
    currency: '$', price: 116.68, change: -0.26, valuation: '$103.2bn',
    minTicket: 'Accredited', hue: 'c3',
  },
  {
    id: 'ramp', name: 'Ramp', code: 'RAMP', sector: 'Fintech',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/ramp_stock/',
    currency: '$', price: 125.55, change: 0.01, valuation: '$46.0bn',
    minTicket: 'Accredited', hue: 'c6',
  },
  {
    id: 'perplexity', name: 'Perplexity', code: 'PPLX', sector: 'AI',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/perplexity_stock/',
    currency: '$', price: 69.5, change: 6.92, valuation: '$20.4bn',
    minTicket: 'Accredited', trending: true, hue: 'c2',
  },
  {
    id: 'shield-ai', name: 'Shield AI', code: 'SHAI', sector: 'Defence',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/shield-ai_stock/',
    currency: '$', price: 163.79, change: 1.49, valuation: '$13.2bn',
    minTicket: 'Accredited', hue: 'c1',
  },

  /* ---- Live crowdfunding — Crowdcube public pages, 19 Jul 2026 ---- */
  {
    id: 'permia-sensing', name: 'Permia Sensing', code: 'PERM', sector: 'Agritech',
    type: 'crowdfunding', platform: 'crowdcube',
    url: 'https://www.crowdcube.com/companies/permia-sensing',
    currency: '£', valuation: 'Imperial spinout',
    raised: '£41.1k', investors: 111,
    minTicket: '£10+', hue: 'c4',
  },
  {
    id: 'greenback', name: 'Greenback Recycling', code: 'GRBK', sector: 'Climate',
    type: 'crowdfunding', platform: 'crowdcube',
    url: 'https://www.crowdcube.com/companies/greenback-recycling-technologies',
    currency: '£', valuation: 'Advanced recycling',
    raised: '£51.4k', investors: 110,
    minTicket: '£10+', hue: 'c3',
  },
  {
    id: 'collider', name: 'Collider', code: 'CLDR', sector: 'Consumer',
    type: 'crowdfunding', platform: 'crowdcube',
    url: 'https://www.crowdcube.com/companies/collider',
    currency: '£', valuation: 'Functional NA beer',
    raised: '£75.1k', investors: 106,
    minTicket: '£10+', hue: 'c6',
  },

  /* ---- Live crowdfunding — Wefunder explore listings, 19 Jul 2026 ---- */
  {
    id: 'bito', name: 'Bito', code: 'BITO', sector: 'AI',
    type: 'crowdfunding', platform: 'wefunder',
    url: 'https://wefunder.com/bito',
    currency: '$', valuation: '$72m cap',
    raised: '$2.63m', investors: 40, closes: '2 days',
    minTicket: '$100', trending: true, hue: 'c1',
  },
  {
    id: 'rise-robotics', name: 'RISE Robotics', code: 'RISE', sector: 'Robotics',
    type: 'crowdfunding', platform: 'wefunder',
    url: 'https://wefunder.com/riserobotics',
    currency: '$', valuation: '$62.1m',
    raised: '$18.4m', investors: 761, status: 'Almost fully funded',
    minTicket: '$100', trending: true, hue: 'c3',
  },
  {
    id: 'biostate-ai', name: 'Biostate AI', code: 'BIOS', sector: 'Biotech',
    type: 'crowdfunding', platform: 'wefunder',
    url: 'https://wefunder.com/biostateai',
    currency: '$', valuation: '$100m cap',
    raised: '$1.47m', investors: 354, status: 'Almost fully funded',
    minTicket: '$100', hue: 'c5',
  },
  {
    id: 'airthium', name: 'Airthium', code: 'AIRT', sector: 'Energy',
    type: 'crowdfunding', platform: 'wefunder',
    url: 'https://wefunder.com/airthium',
    currency: '$', valuation: '$21m cap',
    raised: '$258.6k', investors: 234, status: 'Almost fully funded',
    minTicket: '$100', hue: 'c2',
  },
];

export const marketStats = {
  liveDeals: deals.length,
  venues: platforms.length,
  markets: 3,
};

export const fmtPrice = (d: Deal): string =>
  d.price == null
    ? '—'
    : `${d.currency}${d.price.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

export const fmtChange = (d: Deal): string =>
  d.change == null || d.change === 0
    ? '—'
    : `${d.change > 0 ? '+' : ''}${d.change.toFixed(2)}%`;
