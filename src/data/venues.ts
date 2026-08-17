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
}

export const venueMeta: Record<string, VenueMeta> = {
  forge: { id: 'forge', name: 'Forge Global', model: 'Marketplace', access: 'Accredited', region: 'US' },
  hiive: { id: 'hiive', name: 'Hiive', model: 'Order book', access: 'Accredited', region: 'US · CA' },
  equityzen: { id: 'equityzen', name: 'EquityZen', model: 'Pooled fund', access: 'Accredited', region: 'US' },
  linqto: { id: 'linqto', name: 'Linqto', model: 'Direct app', access: 'Accredited', region: 'Global' },
  'nasdaq-pm': { id: 'nasdaq-pm', name: 'Nasdaq Private Market', model: 'Tender programme', access: 'Varies', region: 'US' },
  caplight: { id: 'caplight', name: 'Caplight', model: 'Data + blocks', access: 'Institutional', region: 'US' },
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
export const extraListings: VenueListing[] = [];

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
