/**
 * Cross-venue listings: the same company offered on more than one platform.
 *
 * This is the comparison layer. A single company can be bought as a direct
 * block on one venue, through an SPV on another and inside a fund on a third,
 * at different prices, minimums, fees and access requirements. Showing those
 * side by side is the core of what an aggregator is for.
 *
 * Every figure is scraped from the venue's own public page. Anything a venue
 * does not publish stays null and renders as "not published" rather than being
 * filled in with a guess.
 */

import { deals, type Deal } from './deals';

export type Structure = 'direct' | 'spv' | 'fund' | 'forward' | 'primary';

export interface VenueMeta {
  id: string;
  name: string;
  model: string;
  access: string;
  region: string;
}

export interface VenueListing {
  company: string; // Deal.id
  venue: string; // VenueMeta.id
  price?: number | null; // per-share
  bid?: number | null;
  ask?: number | null;
  valuation?: string | null;
  minInvestment?: string | null;
  fees?: string | null;
  structure?: Structure | null;
  access?: string | null;
  url: string;
  asOf?: string | null;
  /** Open orders the venue publishes: a liquidity signal, not a price. */
  liveOrders?: number | null;
  /** How the venue derives the number it publishes. */
  basis?: string | null;
}

export const venueMeta: Record<string, VenueMeta> = {
  forge: { id: 'forge', name: 'Forge Global', model: 'Marketplace', access: 'Accredited', region: 'US' },
  hiive: { id: 'hiive', name: 'Hiive', model: 'Order book', access: 'Accredited', region: 'US · CA' },
  equityzen: { id: 'equityzen', name: 'EquityZen', model: 'Pooled fund', access: 'Accredited', region: 'US' },
  linqto: { id: 'linqto', name: 'Linqto', model: 'Direct app', access: 'Accredited', region: 'Global' },
  'nasdaq-pm': { id: 'nasdaq-pm', name: 'Nasdaq Private Market', model: 'Tender programme', access: 'Varies', region: 'US' },
  caplight: { id: 'caplight', name: 'Caplight', model: 'Data + blocks', access: 'Institutional', region: 'US' },
  upmarket: { id: 'upmarket', name: 'UpMarket', model: 'SPV access', access: 'Accredited', region: 'US' },
  augment: { id: 'augment', name: 'Augment', model: 'Marketplace', access: 'Accredited', region: 'US' },
  notice: { id: 'notice', name: 'Notice', model: 'Marketplace', access: 'Accredited', region: 'US' },
  crowdcube: { id: 'crowdcube', name: 'Crowdcube', model: 'Primary raise', access: 'Retail', region: 'UK · EU' },
  wefunder: { id: 'wefunder', name: 'Wefunder', model: 'Primary raise', access: 'Retail', region: 'US' },
  'republic-eu': { id: 'republic-eu', name: 'Republic', model: 'Primary raise', access: 'Retail', region: 'UK · EU' },
  startengine: { id: 'startengine', name: 'StartEngine', model: 'Primary raise', access: 'Retail', region: 'US' },
};

export const venueLabel = (id: string): string => venueMeta[id]?.name ?? id;

/**
 * Scraped cross-venue listings. Populated from venue public pages; see
 * scripts/refresh-venues.md for the refresh procedure.
 */
export const extraListings: VenueListing[] = [
  { company: 'openai', venue: 'hiive', price: 739.96, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 0, structure: 'direct', url: "https://www.hiive.com/securities/openai-stock" },
  { company: 'databricks', venue: 'hiive', price: 254.6, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 61, structure: 'direct', url: "https://www.hiive.com/securities/databricks-stock" },
  { company: 'stripe', venue: 'hiive', price: 70.85, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 27, structure: 'direct', url: "https://www.hiive.com/securities/stripe-stock" },
  { company: 'anduril', venue: 'hiive', price: 60.0, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 0, structure: 'direct', url: "https://www.hiive.com/securities/anduril-stock" },
  { company: 'ramp', venue: 'hiive', price: 96.67, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 2, structure: 'direct', url: "https://www.hiive.com/securities/ramp-stock" },
  { company: 'perplexity', venue: 'hiive', price: 63.85, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 35, structure: 'direct', url: "https://www.hiive.com/securities/perplexity-ai-stock" },
  { company: 'shield-ai', venue: 'hiive', price: 157.1, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 25, structure: 'direct', url: "https://www.hiive.com/securities/shield-ai-stock" },
  { company: 'figure-ai', venue: 'hiive', price: 187.21, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 30, structure: 'direct', url: "https://www.hiive.com/securities/figure-ai-stock" },
  { company: 'rippling', venue: 'hiive', price: 49.49, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 1, structure: 'direct', url: "https://www.hiive.com/securities/rippling-stock" },
  { company: 'deel', venue: 'hiive', price: 33.33, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 23, structure: 'direct', url: "https://www.hiive.com/securities/deel-stock" },
  { company: 'discord', venue: 'hiive', price: 40.95, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 8, structure: 'direct', url: "https://www.hiive.com/securities/discord-stock" },
  { company: 'epic-games', venue: 'hiive', price: 205.26, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 14, structure: 'direct', url: "https://www.hiive.com/securities/epic-games-stock" },
  { company: 'kraken', venue: 'hiive', price: 28.29, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 77, structure: 'direct', url: "https://www.hiive.com/securities/kraken-stock" },
  { company: 'abridge', venue: 'hiive', price: 184.4, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 3, structure: 'direct', url: "https://www.hiive.com/securities/abridge-stock" },
  { company: 'airtable', venue: 'hiive', price: 35.79, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 3, structure: 'direct', url: "https://www.hiive.com/securities/airtable-stock" },
  { company: 'whoop', venue: 'hiive', price: 6.87, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 35, structure: 'direct', url: "https://www.hiive.com/securities/whoop-stock" },
  { company: 'fanatics', venue: 'hiive', price: 41.6, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 0, structure: 'direct', url: "https://www.hiive.com/securities/fanatics-stock" },
  { company: 'lambda', venue: 'hiive', price: 40.4, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 46, structure: 'direct', url: "https://www.hiive.com/securities/lambda-stock" },
  { company: 'chainalysis', venue: 'hiive', price: 6.56, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 11, structure: 'direct', url: "https://www.hiive.com/securities/chainalysis-stock" },
  { company: 'flexport', venue: 'hiive', price: 2.98, access: "Accredited", asOf: "08/17/2026", basis: "Hiive Price (model-derived indicative estimate)", liveOrders: 7, structure: 'direct', url: "https://www.hiive.com/securities/flexport-stock" },
  { company: 'openai', venue: 'forge', price: 721.85, valuation: "$894.33bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/openai_stock/" },
  { company: 'databricks', venue: 'forge', price: 264.9, valuation: "$191.88bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/databricks_stock/" },
  { company: 'stripe', venue: 'forge', price: 72.45, valuation: "$184.4bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/stripe_stock/" },
  { company: 'revolut', venue: 'forge', price: 2200.0, valuation: "$125.43bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/revolut_stock/" },
  { company: 'anduril', venue: 'forge', price: 130.03, valuation: "$115.04bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/anduril_stock/" },
  { company: 'ramp', venue: 'forge', price: 125.55, valuation: "$46.04bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/ramp_stock/" },
  { company: 'perplexity', venue: 'forge', price: 67.31, valuation: "$19.74bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/perplexity_stock/" },
  { company: 'shield-ai', venue: 'forge', price: 164.25, valuation: "$13.57bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/shield-ai_stock/" },
  { company: 'figure-ai', venue: 'forge', price: 174.0, valuation: "$34.22bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/figure-ai_stock/" },
  { company: 'rippling', venue: 'forge', price: 58.62, valuation: "$18.94bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/rippling_stock/" },
  { company: 'deel', venue: 'forge', price: 38.92, valuation: "$17.3bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/deel_stock/" },
  { company: 'discord', venue: 'forge', price: 40.75, valuation: "$11.1bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/discord_stock/" },
  { company: 'epic-games', venue: 'forge', price: 334.55, valuation: "$12.55bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/epic-games_stock/" },
  { company: 'kraken', venue: 'forge', price: 29.41, valuation: "$9.57bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/kraken_stock/" },
  { company: 'glean', venue: 'forge', price: 44.43, valuation: "$6.53bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/glean_stock/" },
  { company: 'abridge', venue: 'forge', price: 174.83, valuation: "$5.85bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/abridge_stock/" },
  { company: 'airtable', venue: 'forge', price: 42.37, valuation: "$2.65bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/airtable_stock/" },
  { company: 'whoop', venue: 'forge', price: 7.39, valuation: "$6.64bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/whoop_stock/" },
  { company: 'fanatics', venue: 'forge', price: 53.5, valuation: "$21.77bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/fanatics_stock/" },
  { company: 'skild-ai', venue: 'forge', price: 71.04, valuation: "$15.31bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/skild-ai_stock/" },
  { company: 'lambda', venue: 'forge', price: 39.32, valuation: "$7.19bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/lambda_stock/" },
  { company: 'chainalysis', venue: 'forge', price: 6.2, valuation: "$1.32bn", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/chainalysis_stock/" },
  { company: 'flexport', venue: 'forge', price: 2.95, valuation: "$828.91m", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/flexport_stock/" },
  { company: 'impossible-foods', venue: 'forge', price: 1.51, valuation: "$427.35m", access: "Accredited", asOf: "Aug 17, 2026", basis: "Forge Price (daily indicative mark) + Forge Price valuation", structure: 'direct', url: "https://forgeglobal.com/impossible-foods_stock/" },
  { company: 'openai', venue: 'nasdaq-pm', price: 703.42, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/open-ai/" },
  { company: 'databricks', venue: 'nasdaq-pm', price: 241.98, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/databricks/" },
  { company: 'kraken', venue: 'nasdaq-pm', price: 28.87, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/kraken/" },
  { company: 'anduril', venue: 'nasdaq-pm', price: 109.48, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/anduril/" },
  { company: 'discord', venue: 'nasdaq-pm', price: 33.96, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/discord/" },
  { company: 'skild-ai', venue: 'nasdaq-pm', price: 66.69, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/skild-ai/" },
  { company: 'perplexity', venue: 'nasdaq-pm', price: 59.07, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/perplexity/" },
  { company: 'rippling', venue: 'nasdaq-pm', price: 50.92, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/rippling/" },
  { company: 'revolut', venue: 'nasdaq-pm', price: 1786.35, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/revolut/" },
  { company: 'glean', venue: 'nasdaq-pm', price: 47.09, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/glean/" },
  { company: 'deel', venue: 'nasdaq-pm', price: 33.35, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/deel/" },
  { company: 'epic-games', venue: 'nasdaq-pm', price: 353.62, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/epic-games/" },
  { company: 'fanatics', venue: 'nasdaq-pm', price: 44.92, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/fanatics/" },
  { company: 'flexport', venue: 'nasdaq-pm', price: 3.55, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/flexport/" },
  { company: 'whoop', venue: 'nasdaq-pm', price: 7.9, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/whoop/" },
  { company: 'lambda', venue: 'nasdaq-pm', price: 41.0, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/lambda/" },
  { company: 'impossible-foods', venue: 'nasdaq-pm', price: 1.55, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/impossible-foods/" },
  { company: 'chainalysis', venue: 'nasdaq-pm', price: 7.57, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/chainalysis/" },
  { company: 'airtable', venue: 'nasdaq-pm', price: 47.45, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/airtable/" },
  { company: 'ramp', venue: 'nasdaq-pm', price: 128.57, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/ramp/" },
  { company: 'abridge', venue: 'nasdaq-pm', price: 178.46, access: "Accredited", asOf: "Jul 31, 2026", basis: "NPM Price Per Share estimate", structure: 'direct', url: "https://www.nasdaqprivatemarket.com/company/abridge/" },
];

/**
 * Every listing for a company: the deal we already track, plus any other
 * venues carrying the same name. Sorted cheapest-first on published price so
 * the comparison reads top-down, with unpriced listings last.
 */
export const listingsFor = (dealId: string): VenueListing[] => {
  const deal = deals.find((x) => x.id === dealId);
  const rows: VenueListing[] = [];

  if (deal) {
    rows.push({
      company: deal.id,
      venue: deal.platform,
      price: deal.price ?? null,
      valuation: deal.valuation,
      minInvestment: deal.minTicket,
      structure: deal.type === 'crowdfunding' ? 'primary' : 'direct',
      access: venueMeta[deal.platform]?.access ?? null,
      url: deal.url,
    });
  }

  extraListings
    .filter((l) => l.company === dealId)
    .forEach((l) => {
      if (!rows.some((r) => r.venue === l.venue)) rows.push(l);
    });

  return rows.sort((a, b) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });
};

/** True when there is a genuine comparison to draw, not a single row. */
export const hasComparison = (dealId: string): boolean => listingsFor(dealId).length > 1;

export interface Spread {
  low: number;
  high: number;
  spreadPct: number;
  cheapest: VenueListing;
  dearest: VenueListing;
  saving: number;
}

/** Price spread across venues, used for the "cheapest venue" callout. */
export const spreadFor = (dealId: string): Spread | undefined => {
  const priced = listingsFor(dealId).filter((l) => l.price != null);
  if (priced.length < 2) return undefined;
  const cheapest = priced[0];
  const dearest = priced[priced.length - 1];
  const low = cheapest.price as number;
  const high = dearest.price as number;
  if (!(low > 0)) return undefined;
  return {
    low,
    high,
    spreadPct: ((high - low) / low) * 100,
    cheapest,
    dearest,
    saving: high - low,
  };
};

/** Parses "$10,000" / "£10+" / "See venue" into a number for comparison. */
export const minAsNumber = (v: string | null | undefined): number | null => {
  if (!v) return null;
  const m = /([\d,]+(?:\.\d+)?)/.exec(v);
  return m ? parseFloat(m[1].replace(/,/g, '')) : null;
};

export const dealById = (id: string): Deal | undefined => deals.find((d) => d.id === id);
