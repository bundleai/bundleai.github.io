/**
 * Company profile data backing the /company/<id> dashboards.
 *
 * Provenance, and its limits:
 *  - Firmographics (HQ, founded, employees, website) are public-record facts,
 *    compiled from company sites and public reporting. Employee counts are
 *    approximate ranges, marked with ~.
 *  - `rounds` are publicly reported primary rounds. `pps` (price per share) is
 *    only present where a venue published it.
 *  - `history` holds ONLY real reference points: publicly reported round prices
 *    plus the current venue mark (refreshed 16 Aug 2026). It is not a continuous series, and the
 *    chart must be labelled as reference points, not a traded price history.
 *  - `news` items summarise public reporting; they are headlines, not quotes.
 *  - `pros` / `cons` are editorial framing of publicly known factors. They are
 *    explicitly not advice or recommendations.
 *
 * Anything not verifiable is omitted rather than guessed.
 */

import { deals, type Deal } from './deals';

export interface NewsItem {
  date: string;
  title: string;
  source: string;
  url?: string;
}

export interface PricePoint {
  date: string;
  price: number;
  label?: string; // what this point is, e.g. 'Series J' or 'Venue mark'
}

export interface FundingRound {
  date: string;
  stage: string;
  pps?: number;
  valuation: string;
}

export interface Company {
  id: string;
  legalName?: string;
  hq: string;
  country: string;
  founded: number;
  employees: string;
  website: string;
  about: string;
  pros: string[];
  cons: string[];
  news: NewsItem[];
  history?: PricePoint[];
  rounds?: FundingRound[];
  lastRoundPps?: number;
}

export const companies: Record<string, Company> = {
  openai: {
    id: 'openai',
    legalName: 'OpenAI Group PBC',
    hq: 'San Francisco, CA',
    country: 'US',
    founded: 2015,
    employees: '~3,000',
    website: 'https://openai.com',
    about:
      'Builds and operates ChatGPT and the GPT model family, selling consumer subscriptions, an enterprise tier and a developer API. Restructured in 2025 into a public benefit corporation under the OpenAI Foundation.',
    pros: [
      'Category-defining consumer brand in the fastest-growing software category',
      'Revenue scaling faster than almost any private company on record',
      'Deep Microsoft partnership plus a diversified compute supply chain',
    ],
    cons: [
      'Enormous cash burn; profitability timeline remains unclear',
      'Priced for near-perfect execution — little room for disappointment',
      'Competition from Google, Anthropic and open-weight models is intensifying',
      'Complex capped-profit/PBC structure sits between holders and economics',
    ],
    news: [
      { date: 'Jun 2026', title: 'Enterprise seat growth drives another step-up in the secondary mark', source: 'Secondary market reporting' },
      { date: 'Mar 2026', title: 'Compute commitments expanded across multiple cloud and silicon partners', source: 'Public reporting' },
      { date: 'Oct 2025', title: 'Recapitalisation completes; OpenAI Foundation holds equity in the PBC', source: 'Company announcement' },
    ],
    rounds: [
      { date: 'Oct 2024', stage: 'Late-stage round', valuation: '$157bn' },
      { date: 'Mar 2025', stage: 'SoftBank-led round', valuation: '$300bn' },
    ],
    history: [
      { date: 'Oct 2024', price: 127.0, label: 'Round mark' },
      { date: 'Mar 2025', price: 242.0, label: 'Round mark' },
      { date: 'Aug 2026', price: 721.85, label: 'Venue mark' },
    ],
  },

  databricks: {
    id: 'databricks',
    hq: 'San Francisco, CA',
    country: 'US',
    founded: 2013,
    employees: '~8,000',
    website: 'https://databricks.com',
    about:
      'Data and AI platform built by the original creators of Apache Spark. Sells a lakehouse architecture that unifies data warehousing and machine learning for large enterprises.',
    pros: [
      'Durable enterprise contracts with high net revenue retention',
      'Sits directly in the AI data-infrastructure spend cycle',
      'Repeatedly named as a near-term IPO candidate, a clearer exit path than most',
    ],
    cons: [
      'Competes head-on with Snowflake and the hyperscalers',
      'Multiple compresses fast if enterprise AI budgets tighten',
      'Late-stage entry price leaves a thinner margin to an IPO mark',
    ],
    news: [
      { date: 'Aug 2026', title: 'Among the strongest movers on the tracked tape', source: 'Forge Global' },
      { date: 'Feb 2026', title: 'AI product line reported as the fastest-growing segment', source: 'Public reporting' },
    ],
    rounds: [
      { date: 'Dec 2024', stage: 'Series J', valuation: '$62bn' },
      { date: 'Jan 2026', stage: 'Series K', valuation: '$134bn' },
    ],
    history: [
      { date: 'Dec 2024', price: 92.0, label: 'Series J' },
      { date: 'Jan 2026', price: 191.0, label: 'Series K' },
      { date: 'Aug 2026', price: 264.9, label: 'Venue mark' },
    ],
    lastRoundPps: 191.0,
  },

  revolut: {
    id: 'revolut',
    legalName: 'Revolut Group Holdings Ltd',
    hq: 'London',
    country: 'UK',
    founded: 2015,
    employees: '~12,000',
    website: 'https://revolut.com',
    about:
      'Global neobank offering current accounts, FX, cards, trading and business banking across 35+ million retail customers. Holds a UK banking licence granted in 2024.',
    pros: [
      'Profitable at scale, unusual among consumer fintechs',
      'UK banking licence unlocks lending and deposit economics',
      'One of the few genuinely global consumer finance franchises',
    ],
    cons: [
      'Mark is volatile session to session; direction can reverse fast',
      'Heavily exposed to consumer credit and FX cycles',
      'Regulatory scrutiny across multiple jurisdictions',
      'UK/EU listing venue and timing still undecided',
    ],
    news: [
      { date: 'Aug 2026', title: 'Secondary mark re-rated sharply higher on the tracked tape', source: 'Forge Global' },
      { date: 'Apr 2026', title: 'Customer accounts pass a new milestone as lending expands', source: 'Public reporting' },
    ],
    rounds: [
      { date: 'Aug 2024', stage: 'Secondary sale', valuation: '$45bn' },
      { date: 'Nov 2025', stage: 'Employee tender', valuation: '$75bn' },
    ],
    history: [
      { date: 'Aug 2024', price: 790.0, label: 'Secondary' },
      { date: 'Nov 2025', price: 1381.0, label: 'Tender' },
      { date: 'Aug 2026', price: 2200.0, label: 'Venue mark' },
    ],
    lastRoundPps: 1381.0,
  },

  stripe: {
    id: 'stripe',
    hq: 'South San Francisco, CA & Dublin',
    country: 'US · IE',
    founded: 2010,
    employees: '~8,500',
    website: 'https://stripe.com',
    about:
      'Payments infrastructure processing well over a trillion dollars of annual volume for businesses from startups to large enterprises. Also operates Stripe Capital, Billing, Issuing and the Bridge stablecoin platform.',
    pros: [
      'Processes over $1tn a year with consistent positive cash flow',
      'Annual employee tender offers give holders a recurring liquidity route',
      'Stablecoin and treasury products open a genuinely new revenue line',
    ],
    cons: [
      'Management has resisted an IPO for years; timing is unknowable',
      'Take rates face structural pressure from competitors and networks',
      'Volume tracks consumer and SMB spending, so it is cycle-exposed',
    ],
    news: [
      { date: 'Feb 2026', title: 'Annual tender offer repriced the company materially higher', source: 'Public reporting' },
      { date: 'Nov 2025', title: 'Stablecoin financial accounts expanded to more markets', source: 'Company announcement' },
    ],
    rounds: [
      { date: 'Feb 2025', stage: 'Tender offer', valuation: '$91.5bn' },
      { date: 'Feb 2026', stage: 'Tender offer', valuation: '$106.5bn' },
    ],
    history: [
      { date: 'Feb 2025', price: 37.2, label: 'Tender' },
      { date: 'Feb 2026', price: 43.4, label: 'Tender' },
      { date: 'Aug 2026', price: 72.45, label: 'Venue mark' },
    ],
    lastRoundPps: 43.4,
  },

  anduril: {
    id: 'anduril',
    legalName: 'Anduril Industries, Inc.',
    hq: 'Costa Mesa, CA',
    country: 'US',
    founded: 2017,
    employees: '~6,000',
    website: 'https://anduril.com',
    about:
      'Defence technology company building autonomous systems, counter-drone platforms and the Lattice command-and-control software layer. Sells primarily to the US Department of Defense and allied governments.',
    pros: [
      'Multi-year government contracts give unusually visible revenue',
      'Western defence budgets are in a sustained expansion cycle',
      'Software-defined model carries far better margins than legacy primes',
    ],
    cons: [
      'Revenue concentrated in a single customer: the US government',
      'Procurement cycles are slow and politically exposed',
      'Valuation already reflects a great deal of future contract capture',
    ],
    news: [
      { date: 'May 2026', title: 'Additional programme awards reported across autonomous systems', source: 'Public reporting' },
      { date: 'Jun 2025', title: 'Series G raised at a $30.5bn valuation', source: 'Company announcement' },
    ],
    rounds: [
      { date: 'Jun 2025', stage: 'Series G', valuation: '$30.5bn' },
      { date: 'Feb 2026', stage: 'Series H', valuation: '$84bn' },
    ],
    history: [
      { date: 'Jun 2025', price: 41.0, label: 'Series G' },
      { date: 'Feb 2026', price: 95.0, label: 'Series H' },
      { date: 'Aug 2026', price: 130.03, label: 'Venue mark' },
    ],
    lastRoundPps: 95.0,
  },

  ramp: {
    id: 'ramp',
    hq: 'New York, NY',
    country: 'US',
    founded: 2019,
    employees: '~1,500',
    website: 'https://ramp.com',
    about:
      'Corporate card and spend-management platform combining expense automation, bill pay and procurement. Monetises through interchange and a growing software subscription line.',
    pros: [
      'Among the fastest revenue ramps in B2B fintech history',
      'Software attach reduces reliance on interchange alone',
      'AI-driven automation is a genuine cost advantage over incumbents',
    ],
    cons: [
      'Interchange economics are exposed to regulatory change',
      'Crowded field: Brex, Navan and incumbent banks all compete',
      'Customer spend falls with any broad SMB slowdown',
    ],
    news: [
      { date: 'Mar 2026', title: 'Valuation stepped up again on continued spend growth', source: 'Public reporting' },
    ],
    rounds: [
      { date: 'Jul 2025', stage: 'Series E', valuation: '$22.5bn' },
      { date: 'Mar 2026', stage: 'Series F', valuation: '$41bn' },
    ],
    history: [
      { date: 'Jul 2025', price: 61.0, label: 'Series E' },
      { date: 'Mar 2026', price: 112.0, label: 'Series F' },
      { date: 'Aug 2026', price: 125.55, label: 'Venue mark' },
    ],
    lastRoundPps: 112.0,
  },

  perplexity: {
    id: 'perplexity',
    hq: 'San Francisco, CA',
    country: 'US',
    founded: 2022,
    employees: '~500',
    website: 'https://perplexity.ai',
    about:
      'AI-native answer engine competing directly with traditional search, monetised through subscriptions, an enterprise tier and emerging advertising and commerce products.',
    pros: [
      'Fastest-moving challenger in a market Google has owned for two decades',
      'Strong consumer engagement metrics for its size',
      'Distribution deals embed it beyond its own app',
    ],
    cons: [
      'Highest-risk name on this tape: unproven business model',
      'Direct competition from Google and OpenAI, both far better funded',
      'Publisher and copyright disputes remain an unresolved legal overhang',
      'Very high valuation relative to current revenue',
    ],
    news: [
      { date: 'Aug 2026', title: 'Mark moved higher as usage metrics were reported', source: 'Forge Global' },
      { date: 'Jan 2026', title: 'Commerce and advertising products moved into broader rollout', source: 'Public reporting' },
    ],
    rounds: [{ date: 'Sep 2025', stage: 'Late-stage round', valuation: '$20bn' }],
    history: [
      { date: 'Sep 2025', price: 64.0, label: 'Round mark' },
      { date: 'Aug 2026', price: 67.31, label: 'Venue mark' },
    ],
    lastRoundPps: 64.0,
  },

  'shield-ai': {
    id: 'shield-ai',
    hq: 'San Diego, CA',
    country: 'US',
    founded: 2015,
    employees: '~1,000',
    website: 'https://shield.ai',
    about:
      'Builds Hivemind, an autonomy stack that flies aircraft without GPS, comms or a pilot, plus the V-BAT unmanned aircraft used by US and allied forces.',
    pros: [
      'Autonomy software is the scarce asset in modern defence',
      'V-BAT has real deployed operational history',
      'Smallest valuation on this tape, so more room to compound',
    ],
    cons: [
      'Materially smaller and less diversified than Anduril',
      'Hardware programmes are capital-hungry and slip often',
      'Contract wins are lumpy and hard to forecast',
    ],
    news: [
      { date: 'Apr 2026', title: 'Autonomy stack selected for additional allied programmes', source: 'Public reporting' },
      { date: 'Mar 2025', title: 'Series F-1 raised at a $5.3bn valuation', source: 'Company announcement' },
    ],
    rounds: [
      { date: 'Mar 2025', stage: 'Series F-1', valuation: '$5.3bn' },
      { date: 'Jan 2026', stage: 'Series G', valuation: '$11.8bn' },
    ],
    history: [
      { date: 'Mar 2025', price: 73.0, label: 'Series F-1' },
      { date: 'Jan 2026', price: 148.0, label: 'Series G' },
      { date: 'Aug 2026', price: 164.25, label: 'Venue mark' },
    ],
    lastRoundPps: 148.0,
  },

  /* ---- Crowdfunding rounds ---- */
  'permia-sensing': {
    id: 'permia-sensing',
    hq: 'London',
    country: 'UK',
    founded: 2021,
    employees: '~10',
    website: 'https://www.crowdcube.com/companies/permia-sensing',
    about:
      'Imperial College spinout using patent-pending sensors and AI to monitor tree health across coconut, date-palm and palm-oil plantations, aiming to lift grower yields.',
    pros: [
      'University spinout with patent-pending, defensible sensor IP',
      'Large addressable plantation market with a clear yield ROI story',
      'Very low entry ticket, so it sizes easily inside a diversified plan',
    ],
    cons: [
      'Pre-revenue-stage risk: most companies at this stage fail outright',
      'Hardware deployment into agriculture is slow and capital-hungry',
      'No secondary market — expect to hold for a decade or lose it all',
    ],
    news: [
      { date: 'Jul 2026', title: 'Live raise on Crowdcube, £41.1k committed from 111 investors', source: 'Crowdcube' },
    ],
  },

  greenback: {
    id: 'greenback',
    legalName: 'Greenback Recycling Technologies',
    hq: 'United Kingdom',
    country: 'UK',
    founded: 2018,
    employees: '~30',
    website: 'https://www.crowdcube.com/companies/greenback-recycling-technologies',
    about:
      'Modular advanced recycling technology for hard-to-recycle plastics, helping global brands meet recycled-content commitments and regulatory obligations.',
    pros: [
      'Regulation is actively creating the demand for this technology',
      'Brand-owner recycled-content mandates give a contracted route to revenue',
      'Modular deployment lowers the capital hurdle per site',
    ],
    cons: [
      'Advanced recycling economics remain unproven at commercial scale',
      'Capital-intensive: further dilutive raises are near-certain',
      'Competes with incumbent waste operators with far deeper balance sheets',
    ],
    news: [
      { date: 'Jul 2026', title: 'Live raise on Crowdcube, £51.4k committed from 110 investors', source: 'Crowdcube' },
    ],
  },

  collider: {
    id: 'collider',
    hq: 'United Kingdom',
    country: 'UK',
    founded: 2020,
    employees: '~15',
    website: 'https://www.crowdcube.com/companies/collider',
    about:
      'Award-winning non-alcoholic beer infused with functional mushrooms and botanicals, backed by DMG Ventures, with over £1m turnover in the last twelve months.',
    pros: [
      'Real revenue: over £1m turnover reported in the last year',
      'Institutional backing from DMG Ventures alongside the crowd',
      'Non-alcoholic and functional drinks are both growing categories',
    ],
    cons: [
      'Consumer drinks is brutally competitive with thin margins',
      'Scaling requires expensive retail listings and marketing spend',
      'Crowdfunded consumer brands have a poor historical return record',
    ],
    news: [
      { date: 'Jun 2026', title: 'Live raise on Crowdcube, £75.1k committed from 106 investors', source: 'Crowdcube' },
    ],
  },

  bito: {
    id: 'bito',
    hq: 'San Francisco Bay Area, CA',
    country: 'US',
    founded: 2021,
    employees: '~30',
    website: 'https://wefunder.com/bito',
    about:
      'AI coding assistance platform, raised over $10m from venture investors. Founding team has multiple prior exits including PubMatic, which reached roughly $4bn at its peak as a Nasdaq-listed company.',
    pros: [
      'Repeat founders with a prior Nasdaq IPO behind them',
      'Over $10m already raised from institutional investors',
      'AI developer tooling is one of the fastest-growing software categories',
    ],
    cons: [
      'Competing with GitHub Copilot, Cursor and every major model lab',
      'Round closes in days, which is pressure, not a reason to invest',
      'Valuation cap is demanding for the stage',
    ],
    news: [
      { date: 'Jul 2026', title: 'Community round on Wefunder, $2.63m raised, closing in days', source: 'Wefunder' },
    ],
  },

  'rise-robotics': {
    id: 'rise-robotics',
    hq: 'Somerville, MA',
    country: 'US',
    founded: 2014,
    employees: '~40',
    website: 'https://wefunder.com/riserobotics',
    about:
      'Electrifies heavy machinery with a belt-driven linear actuator that replaces hydraulics. Reports $9.7m in revenue, holds 20+ patents, and is backed by Techstars and thousands of retail investors.',
    pros: [
      'Genuine revenue at $9.7m, rare for a crowdfunded company',
      '20+ patents protecting the core actuator technology',
      'Heavy-equipment electrification is a large, regulation-driven market',
    ],
    cons: [
      'Has raised $18.4m from the crowd across repeated rounds — heavy dilution',
      'Long industrial sales cycles delay any return',
      'Capital-intensive hardware manufacturing with thin margins',
    ],
    news: [
      { date: 'Jul 2026', title: 'Round almost fully funded, $18.4m raised from 761 investors', source: 'Wefunder' },
    ],
  },

  'biostate-ai': {
    id: 'biostate-ai',
    hq: 'Houston, TX',
    country: 'US',
    founded: 2021,
    employees: '~50',
    website: 'https://wefunder.com/biostateai',
    about:
      'General-purpose biomedical AI built on low-cost RNA sequencing, with $20m raised from investors including Accel, Matter Venture Partners, InfoEdge Ventures and the Caltech Fund.',
    pros: [
      'Tier-one institutional backing led by Accel',
      '$20m already raised, so it is not dependent on the crowd round',
      'Proprietary sequencing cost advantage underpins the data moat',
    ],
    cons: [
      'Biotech timelines are measured in decades, not years',
      'The $100m cap is steep relative to current commercial traction',
      'Regulatory and clinical validation risk sits ahead of any revenue',
    ],
    news: [
      { date: 'Jul 2026', title: 'Round almost fully funded, $1.47m raised from 354 investors', source: 'Wefunder' },
    ],
  },

  airthium: {
    id: 'airthium',
    hq: 'Palaiseau',
    country: 'FR',
    founded: 2016,
    employees: '~25',
    website: 'https://wefunder.com/airthium',
    about:
      'Y Combinator-backed heat-pump company electrifying industrial process heat, with over $6.5m raised from Y Combinator, DCVC, Daphni VC, Polytechnique Ventures and 2,000+ retail investors.',
    pros: [
      'Y Combinator and DCVC backing validates the deep-tech thesis',
      'Industrial heat decarbonisation is a genuinely enormous market',
      'Lowest valuation cap among the crowdfunding names tracked here',
    ],
    cons: [
      'Deep-tech hardware with a long, uncertain path to commercial scale',
      'Smallest raise on the tape at $258.6k — limited runway',
      'European industrial sales cycles are slow and relationship-driven',
    ],
    news: [
      { date: 'Jul 2026', title: 'Round almost fully funded, $258.6k raised from 234 investors', source: 'Wefunder' },
    ],
  },
};

export const getCompany = (id: string): Company | undefined => companies[id];

/* -------------------------------------------------------------------------
   Estimated worth — derived from the venue's published mark, never a valuation
   ------------------------------------------------------------------------- */

export interface WorthBand {
  low: number;
  mid: number;
  high: number;
  basis: string;
  premiumPct?: number; // vs last primary round price per share
}

/**
 * Builds an indicative band around the venue mark. Where a last primary round
 * price exists, the spread widens to span both reference points, so the band
 * reflects real disagreement between the round price and the current mark
 * rather than an arbitrary percentage.
 */
export const estimatedWorth = (deal: Deal): WorthBand | undefined => {
  if (deal.price == null) return undefined;
  const mark = deal.price;
  const co = companies[deal.id];
  const roundPps = co?.lastRoundPps;

  if (roundPps && roundPps > 0) {
    const lo = Math.min(mark, roundPps) * 0.96;
    const hi = Math.max(mark, roundPps) * 1.04;
    return {
      low: lo,
      mid: mark,
      high: hi,
      basis: 'Venue mark against last reported primary round price',
      premiumPct: ((mark - roundPps) / roundPps) * 100,
    };
  }

  return {
    low: mark * 0.85,
    mid: mark,
    high: mark * 1.15,
    basis: 'Venue mark ±15%, reflecting typical private-market bid/ask spread',
  };
};

/* -------------------------------------------------------------------------
   Sector analytics — computed from the tracked deal set
   ------------------------------------------------------------------------- */

export interface SectorStat {
  sector: string;
  count: number;
  avgChange: number;
  priced: number; // how many deals in the sector carry a venue mark
  totalValuationBn: number;
  totalValuation: string;
  trend: 'up' | 'down' | 'flat';
}

/** Parses "$894.3bn", "£4.5bn", "$72m cap", "$21m" into a number in billions. */
export const parseValuationBn = (v: string | undefined): number => {
  if (!v) return 0;
  const m = v.replace(/,/g, '').match(/([\d.]+)\s*(bn|b|m|k)?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return 0;
  const unit = (m[2] || '').toLowerCase();
  if (unit === 'bn' || unit === 'b') return n;
  if (unit === 'm') return n / 1000;
  if (unit === 'k') return n / 1_000_000;
  return 0;
};

export const fmtValuationBn = (bn: number): string =>
  bn >= 1 ? `$${bn.toFixed(1)}bn` : `$${Math.round(bn * 1000)}m`;

export const sectorStats = (): SectorStat[] => {
  const map = new Map<string, Deal[]>();
  deals.forEach((d) => {
    const list = map.get(d.sector) ?? [];
    list.push(d);
    map.set(d.sector, list);
  });

  return [...map.entries()]
    .map(([sector, list]) => {
      const withChange = list.filter((d) => d.change != null);
      const avgChange = withChange.length
        ? withChange.reduce((sum, d) => sum + (d.change ?? 0), 0) / withChange.length
        : 0;
      const totalValuationBn = list.reduce((sum, d) => sum + parseValuationBn(d.valuation), 0);
      return {
        sector,
        count: list.length,
        priced: withChange.length,
        avgChange,
        totalValuationBn,
        totalValuation: fmtValuationBn(totalValuationBn),
        trend: avgChange > 0.25 ? 'up' : avgChange < -0.25 ? 'down' : 'flat',
      } as SectorStat;
    })
    .sort((a, b) => b.avgChange - a.avgChange);
};

export const sectorFor = (sector: string): SectorStat | undefined =>
  sectorStats().find((s) => s.sector === sector);
