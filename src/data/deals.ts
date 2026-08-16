/**
 * Aggregated deal + venue data powering the market UI.
 *
 * Sourced from venue public pages; Forge marks carry their own
 * "Updated Aug 16, 2026" stamp, crowdfunding rows re-checked 17 Aug 2026:
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

export const dataAsOf = '16 August 2026';

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
  /* ---- Pre-IPO & secondaries, Forge Global public marks, 19 Jul 2026 ---- */
  {
    id: 'openai', name: 'OpenAI', code: 'OAI', sector: 'AI',
    type: 'pre-ipo', platform: 'forge',
    url: 'https://forgeglobal.com/openai_stock/',
    currency: '$', price: 721.85, change: 0.02, valuation: '$894.33bn',
    minTicket: 'Accredited', trending: true, hue: 'c1',
  },
  {
    id: 'databricks', name: 'Databricks', code: 'DBRX', sector: 'Data & AI',
    type: 'pre-ipo', platform: 'forge',
    url: 'https://forgeglobal.com/databricks_stock/',
    currency: '$', price: 264.9, change: 9.44, valuation: '$191.88bn',
    minTicket: 'Accredited', trending: true, hue: 'c2',
  },
  {
    id: 'revolut', name: 'Revolut', code: 'REV', sector: 'Fintech',
    type: 'pre-ipo', platform: 'forge',
    url: 'https://forgeglobal.com/revolut_stock/',
    currency: '$', price: 2200.0, change: 9.07, valuation: '$125.43bn',
    minTicket: 'Accredited', trending: true, hue: 'c5',
  },
  {
    id: 'stripe', name: 'Stripe', code: 'STRP', sector: 'Fintech',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/stripe_stock/',
    currency: '$', price: 72.45, change: 0.61, valuation: '$184.40bn',
    minTicket: 'Accredited', hue: 'c4',
  },
  {
    id: 'anduril', name: 'Anduril', code: 'ANDL', sector: 'Defence',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/anduril_stock/',
    currency: '$', price: 130.03, change: -1.48, valuation: '$115.04bn',
    minTicket: 'Accredited', hue: 'c3',
  },
  {
    id: 'ramp', name: 'Ramp', code: 'RAMP', sector: 'Fintech',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/ramp_stock/',
    currency: '$', price: 125.55, change: 0.01, valuation: '$46.04bn',
    minTicket: 'Accredited', hue: 'c6',
  },
  {
    id: 'perplexity', name: 'Perplexity', code: 'PPLX', sector: 'AI',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/perplexity_stock/',
    currency: '$', price: 67.31, change: 2.86, valuation: '$19.74bn',
    minTicket: 'Accredited', trending: true, hue: 'c2',
  },
  {
    id: 'shield-ai', name: 'Shield AI', code: 'SHAI', sector: 'Defence',
    type: 'secondary', platform: 'forge',
    url: 'https://forgeglobal.com/shield-ai_stock/',
    currency: '$', price: 164.25, change: 0.35, valuation: '$13.57bn',
    minTicket: 'Accredited', hue: 'c1',
  },

  /* ---- Live crowdfunding, Crowdcube public pages, 19 Jul 2026 ---- */
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

  /* ---- Live crowdfunding, Wefunder explore listings, 19 Jul 2026 ---- */
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
  /* ---- Added 16-17 Aug 2026 refresh, same venue-public-page sourcing ---- */
  {
    id: 'figure-ai', name: "Figure AI", code: 'FA', sector: 'Robotics',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/figure-ai_stock/",
    currency: '$', price: 174.0, change: -10.31,
    valuation: "$34.22bn",
    minTicket: 'Accredited', hue: 'c1',
  },
  {
    id: 'fanatics', name: "Fanatics", code: 'FANA', sector: 'Consumer',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/fanatics_stock/",
    currency: '$', price: 53.5, change: 13.83,
    valuation: "$21.77bn",
    minTicket: 'Accredited', hue: 'c2',
  },
  {
    id: 'rippling', name: "Rippling", code: 'RIPP', sector: 'HR tech',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/rippling_stock/",
    currency: '$', price: 58.62, change: 1.95,
    valuation: "$18.94bn",
    minTicket: 'Accredited', hue: 'c3',
  },
  {
    id: 'deel', name: "Deel", code: 'DEEL', sector: 'HR tech',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/deel_stock/",
    currency: '$', price: 38.92, change: 8.99,
    valuation: "$17.30bn",
    minTicket: 'Accredited', hue: 'c4',
  },
  {
    id: 'skild-ai', name: "Skild AI", code: 'SA', sector: 'Robotics',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/skild-ai_stock/",
    currency: '$', price: 71.04, change: 2.6,
    valuation: "$15.31bn",
    minTicket: 'Accredited', hue: 'c5',
  },
  {
    id: 'epic-games', name: "Epic Games", code: 'EG', sector: 'Gaming',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/epic-games_stock/",
    currency: '$', price: 334.55, change: 6.05,
    valuation: "$12.55bn",
    minTicket: 'Accredited', hue: 'c6',
  },
  {
    id: 'discord', name: "Discord", code: 'DISC', sector: 'Consumer',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/discord_stock/",
    currency: '$', price: 40.75, change: 23.48,
    valuation: "$11.10bn",
    minTicket: 'Accredited', hue: 'c1',
  },
  {
    id: 'kraken', name: "Kraken", code: 'KRAK', sector: 'Crypto',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/kraken_stock/",
    currency: '$', price: 29.41, change: -25.54,
    valuation: "$9.57bn",
    minTicket: 'Accredited', hue: 'c2',
  },
  {
    id: 'lambda', name: "Lambda", code: 'LAMB', sector: 'AI infra',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/lambda_stock/",
    currency: '$', price: 39.32, change: -6.51,
    valuation: "$7.19bn",
    minTicket: 'Accredited', hue: 'c3',
  },
  {
    id: 'whoop', name: "Whoop", code: 'WHOO', sector: 'Consumer health',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/whoop_stock/",
    currency: '$', price: 7.39, change: 0.41,
    valuation: "$6.64bn",
    minTicket: 'Accredited', hue: 'c4',
  },
  {
    id: 'glean', name: "Glean", code: 'GLEA', sector: 'AI',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/glean_stock/",
    currency: '$', price: 44.43, change: -0.8,
    valuation: "$6.53bn",
    minTicket: 'Accredited', hue: 'c5',
  },
  {
    id: 'abridge', name: "Abridge", code: 'ABRI', sector: 'Health AI',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/abridge_stock/",
    currency: '$', price: 174.83, change: 2.63,
    valuation: "$5.85bn",
    minTicket: 'Accredited', hue: 'c6',
  },
  {
    id: 'airtable', name: "Airtable", code: 'AIRT', sector: 'SaaS',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/airtable_stock/",
    currency: '$', price: 42.37, change: -1.99,
    valuation: "$2.65bn",
    minTicket: 'Accredited', hue: 'c1',
  },
  {
    id: 'chainalysis', name: "Chainalysis", code: 'CHAI', sector: 'Crypto',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/chainalysis_stock/",
    currency: '$', price: 6.2, change: -14.48,
    valuation: "$1.32bn",
    minTicket: 'Accredited', hue: 'c2',
  },
  {
    id: 'flexport', name: "Flexport", code: 'FLEX', sector: 'Logistics',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/flexport_stock/",
    currency: '$', price: 2.95, change: -9.23,
    valuation: "$828.91m",
    minTicket: 'Accredited', hue: 'c3',
  },
  {
    id: 'impossible-foods', name: "Impossible Foods", code: 'IF', sector: 'Foodtech',
    type: 'secondary', platform: 'forge',
    url: "https://forgeglobal.com/impossible-foods_stock/",
    currency: '$', price: 1.51, change: -5.63,
    valuation: "$427.35m",
    minTicket: 'Accredited', hue: 'c4',
  },
  {
    id: 'rentberry', name: "Rentberry", code: 'RENT', sector: "Finance / Real Estate",
    type: 'crowdfunding', platform: 'republic-eu',
    url: "https://republic.com/rentberry",
    currency: '$', valuation: "Not published",
    raised: "$4.98m", closes: "2026-09-01",
    minTicket: "$500", hue: 'c5',
  },
  {
    id: 'yakuru-inc', name: "Yakuru Inc.", code: 'YI', sector: "Healthcare",
    type: 'crowdfunding', platform: 'republic-eu',
    url: "https://republic.com/yakuru",
    currency: '$', valuation: "$15m cap (20% discount)",
    raised: "$60.7k", closes: "2026-10-31",
    minTicket: "$150", hue: 'c6',
  },
  {
    id: 'cognivix', name: "Cognivix", code: 'COGN', sector: "Manufacturing / Technology",
    type: 'crowdfunding', platform: 'republic-eu',
    url: "https://republic.com/cognivix",
    currency: '$', valuation: "Not published",
    raised: "$53.1k", closes: "2026-10-01",
    minTicket: "$100", hue: 'c1',
  },
  {
    id: 'mintworks', name: "Mintworks", code: 'MINT', sector: "Finance / Real Estate",
    type: 'crowdfunding', platform: 'republic-eu',
    url: "https://republic.com/mintworks",
    currency: '$', valuation: "$50m cap",
    raised: "$33.8k", closes: "2026-12-02",
    minTicket: "$100", hue: 'c2',
  },
  {
    id: 'code-blue', name: "Code Blue", code: 'CB', sector: "Healthcare",
    type: 'crowdfunding', platform: 'republic-eu',
    url: "https://republic.com/code-blue",
    currency: '$', valuation: "$12m cap",
    raised: "$23.1k", closes: "2026-12-02",
    minTicket: "$150", hue: 'c3',
  },
  {
    id: 'hope-neuron-therapeutx', name: "HOPE-Neuron Therapeutx", code: 'HT', sector: "Healthcare",
    type: 'crowdfunding', platform: 'republic-eu',
    url: "https://republic.com/hope-neuron",
    currency: '$', valuation: "Not published",
    raised: "$15.0k", closes: "2026-11-28",
    minTicket: "$500", hue: 'c4',
  },
  {
    id: 'atombeam', name: "Atombeam", code: 'ATOM', sector: "Technology / Data",
    type: 'crowdfunding', platform: 'startengine',
    url: "https://www.startengine.com/offering/atombeam-rega",
    currency: '$', valuation: "Not published",
    raised: "$13.40m",
    minTicket: "$645", hue: 'c5',
  },
  {
    id: 'artly', name: "Artly", code: 'ARTL', sector: "AI / Robotics",
    type: 'crowdfunding', platform: 'startengine',
    url: "https://www.startengine.com/offering/artly-cf2",
    currency: '$', valuation: "Not published",
    raised: "$2.41m",
    minTicket: "$493", hue: 'c6',
  },
  {
    id: 'rhealth', name: "rHEALTH", code: 'RHEA', sector: "Healthcare / Diagnostics",
    type: 'crowdfunding', platform: 'startengine',
    url: "https://www.startengine.com/offering/rhealth",
    currency: '$', valuation: "Not published",
    raised: "$521k", closes: "13 days",
    minTicket: "$499", hue: 'c1',
  },
  {
    id: 'repurpose-energy', name: "RePurpose Energy", code: 'RE', sector: "Energy / Cleantech",
    type: 'crowdfunding', platform: 'startengine',
    url: "https://www.startengine.com/offering/repurpose-energy",
    currency: '$', valuation: "Not published",
    raised: "$315k", closes: "13 days",
    minTicket: "$200", hue: 'c2',
  },
  {
    id: 'rejuvenate-bio', name: "Rejuvenate Bio", code: 'RB', sector: "Biotech / Longevity",
    type: 'crowdfunding', platform: 'wefunder',
    url: "https://wefunder.com/rejuvenatebio",
    currency: '$', valuation: "$59.4m",
    raised: "$9.08m", investors: 936,
    minTicket: "See venue", hue: 'c3',
  },
  {
    id: 'oshi-inc', name: "Oshi Inc", code: 'OI', sector: "Food Tech",
    type: 'crowdfunding', platform: 'wefunder',
    url: "https://wefunder.com/oshi",
    currency: '$', valuation: "$18m",
    raised: "$3.71m", investors: 268,
    minTicket: "See venue", hue: 'c4',
  },
  {
    id: 'blushift-aerospace', name: "bluShift Aerospace", code: 'BA', sector: "Aerospace / Defence",
    type: 'crowdfunding', platform: 'wefunder',
    url: "https://wefunder.com/blushiftaerospace",
    currency: '$', valuation: "$25m cap (down from $30m)",
    raised: "$2.16m", investors: 211,
    minTicket: "See venue", hue: 'c5',
  },
  {
    id: 'groma-real-estate-trust', name: "Groma Real Estate Trust", code: 'GRET', sector: "Real Estate",
    type: 'crowdfunding', platform: 'wefunder',
    url: "https://wefunder.com/groma",
    currency: '$', valuation: "$65.2m",
    raised: "$1.73m", investors: 647,
    minTicket: "See venue", hue: 'c6',
  },
  {
    id: 'hevo', name: "HEVO", code: 'HEVO', sector: "EV / Energy",
    type: 'crowdfunding', platform: 'wefunder',
    url: "https://wefunder.com/hevo",
    currency: '$', valuation: "$60m",
    raised: "$973k", investors: 680,
    minTicket: "See venue", hue: 'c1',
  },
  {
    id: 'endosound', name: "EndoSound", code: 'ENDO', sector: "Medtech",
    type: 'crowdfunding', platform: 'wefunder',
    url: "https://wefunder.com/endosound",
    currency: '$', valuation: "$30m",
    raised: "$633k", investors: 124,
    minTicket: "See venue", hue: 'c2',
  },
  {
    id: 'cru-world-wine', name: "Cru World Wine", code: 'CWW', sector: "Marketplace / Consumer",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/cru-world-wine",
    currency: '£', valuation: "Not published",
    raised: "\u00a31.06m", investors: 226,
    minTicket: "See venue", hue: 'c3',
  },
  {
    id: 'deadly-dozen', name: "Deadly Dozen", code: 'DD', sector: "Fitness / Events",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/deadly-dozen",
    currency: '£', valuation: "Not published",
    raised: "\u00a3315.1k", investors: 382,
    minTicket: "See venue", hue: 'c4',
  },
  {
    id: 'presto-coffee', name: "Presto Coffee", code: 'PC', sector: "Food & Drink",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/presto-coffee",
    currency: '£', valuation: "Not published",
    raised: "\u00a3134.8k", investors: 98,
    minTicket: "See venue", hue: 'c5',
  },
  {
    id: 'nanoloom', name: "Nanoloom", code: 'NANO', sector: "Advanced Materials",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/nanoloom",
    currency: '£', valuation: "Not published",
    raised: "\u00a3124.6k", investors: 236,
    minTicket: "See venue", hue: 'c6',
  },
  {
    id: 'equisera', name: "Equisera", code: 'EQUI', sector: "Cleantech / Energy",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/equisera",
    currency: '£', valuation: "Not published",
    raised: "\u00a3108.5k", investors: 190,
    minTicket: "See venue", hue: 'c1',
  },
  {
    id: 'on-beer', name: "ON Beer", code: 'OB', sector: "Food & Drink",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/on-beer",
    currency: '£', valuation: "Not published",
    raised: "\u00a360.3k", investors: 88,
    minTicket: "See venue", hue: 'c2',
  },
  {
    id: 'lireka', name: "Lireka", code: 'LIRE', sector: "E-commerce",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/lireka",
    currency: '€', valuation: "Not published",
    raised: "\u20ac44.5k", investors: 141,
    minTicket: "See venue", hue: 'c3',
  },
  {
    id: 'alpha-311', name: "Alpha 311", code: 'A3', sector: "Cleantech / Energy",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/alpha-311",
    currency: '£', valuation: "Not published",
    raised: "\u00a328.4k", investors: 110,
    minTicket: "See venue", hue: 'c4',
  },
  {
    id: 'parc', name: "PARC", code: 'PARC', sector: "Mobility / AI",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/parc-ai",
    currency: '£', valuation: "Not published",
    raised: "\u00a327.8k", investors: 64,
    minTicket: "See venue", hue: 'c5',
  },
  {
    id: 'spice-dept', name: "Spice Dept.", code: 'SD', sector: "Food & Drink",
    type: 'crowdfunding', platform: 'crowdcube',
    url: "https://www.crowdcube.com/companies/spice-dept",
    currency: '£', valuation: "Not published",
    raised: "\u00a319.1k", investors: 52,
    minTicket: "See venue", hue: 'c6',
  },
];

export const marketStats = {
  liveDeals: deals.length,
  venues: platforms.length,
  markets: 3,
};

export const fmtPrice = (d: Deal): string =>
  d.price == null
    ? '-'
    : `${d.currency}${d.price.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

export const fmtChange = (d: Deal): string =>
  d.change == null || d.change === 0
    ? '-'
    : `${d.change > 0 ? '+' : ''}${d.change.toFixed(2)}%`;
