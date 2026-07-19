/**
 * Aggregated deal + venue data powering the market UI.
 * Illustrative demo data — not live quotes, not financial promotions.
 * Venue names identify where deals of this kind are listed; Bundle is
 * independent and unaffiliated unless stated.
 */

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
  code: string; // short ticker-style code
  sector: string;
  type: DealType;
  platform: string; // Platform.id
  currency: '£' | '$' | '€';
  price: number; // per-share, illustrative
  change: number; // % move over the window / vs last round
  valuation: string;
  progress?: number; // % of round funded (crowdfunding)
  raised?: string; // e.g. '£1.9m'
  target?: string; // e.g. '£2.2m'
  closes?: string; // e.g. '3 days'
  minTicket: string;
  trending?: boolean;
  hue: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';
}

export const platforms: Platform[] = [
  { id: 'crowdcube', name: 'Crowdcube', type: 'crowdfunding', region: 'UK' },
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
  /* ---- Pre-IPO & secondaries (well-known private names; figures illustrative) ---- */
  {
    id: 'spacex', name: 'SpaceX', code: 'SPX', sector: 'Aerospace',
    type: 'pre-ipo', platform: 'forge', currency: '$',
    price: 112.0, change: 4.2, valuation: '$350bn',
    minTicket: '$5,000', trending: true, hue: 'c3',
  },
  {
    id: 'openai', name: 'OpenAI', code: 'OAI', sector: 'AI',
    type: 'pre-ipo', platform: 'equityzen', currency: '$',
    price: 271.5, change: 6.8, valuation: '$300bn+',
    minTicket: '$10,000', trending: true, hue: 'c1',
  },
  {
    id: 'anthropic', name: 'Anthropic', code: 'ANTH', sector: 'AI',
    type: 'pre-ipo', platform: 'forge', currency: '$',
    price: 58.4, change: 5.1, valuation: '$180bn+',
    minTicket: '$10,000', trending: true, hue: 'c2',
  },
  {
    id: 'stripe', name: 'Stripe', code: 'STRP', sector: 'Fintech',
    type: 'secondary', platform: 'equityzen', currency: '$',
    price: 27.2, change: 1.9, valuation: '$91bn',
    minTicket: '$5,000', hue: 'c4',
  },
  {
    id: 'revolut', name: 'Revolut', code: 'REV', sector: 'Fintech',
    type: 'secondary', platform: 'hiive', currency: '$',
    price: 865.0, change: 3.4, valuation: '$75bn',
    minTicket: '$2,500', trending: true, hue: 'c5',
  },
  {
    id: 'monzo', name: 'Monzo', code: 'MNZO', sector: 'Fintech',
    type: 'secondary', platform: 'republic-eu', currency: '£',
    price: 0.92, change: -1.2, valuation: '£4.5bn',
    minTicket: '£1,000', hue: 'c6',
  },
  {
    id: 'starling', name: 'Starling Bank', code: 'STRL', sector: 'Fintech',
    type: 'secondary', platform: 'nasdaq-pm', currency: '£',
    price: 2.84, change: 0.8, valuation: '£2.5bn',
    minTicket: '£2,000', hue: 'c1',
  },
  {
    id: 'databricks', name: 'Databricks', code: 'DBRX', sector: 'Data & AI',
    type: 'pre-ipo', platform: 'forge', currency: '$',
    price: 92.6, change: 2.7, valuation: '$62bn',
    minTicket: '$5,000', hue: 'c2',
  },
  {
    id: 'canva', name: 'Canva', code: 'CNVA', sector: 'SaaS',
    type: 'secondary', platform: 'hiive', currency: '$',
    price: 21.4, change: -0.6, valuation: '$32bn',
    minTicket: '$2,500', hue: 'c3',
  },
  {
    id: 'ramp', name: 'Ramp', code: 'RAMP', sector: 'Fintech',
    type: 'secondary', platform: 'hiive', currency: '$',
    price: 41.8, change: 1.4, valuation: '$13bn',
    minTicket: '$2,500', hue: 'c4',
  },

  /* ---- Live crowdfunding rounds (illustrative companies) ---- */
  {
    id: 'aurora-fusion', name: 'Aurora Fusion', code: 'AURF', sector: 'Energy',
    type: 'crowdfunding', platform: 'crowdcube', currency: '£',
    price: 2.1, change: 0, valuation: '£38m',
    progress: 84, raised: '£1.85m', target: '£2.2m', closes: '3 days',
    minTicket: '£10', trending: true, hue: 'c4',
  },
  {
    id: 'loop-health', name: 'Loop Health', code: 'LOOP', sector: 'Healthtech',
    type: 'crowdfunding', platform: 'republic-eu', currency: '£',
    price: 0.64, change: 0, valuation: '£12m',
    progress: 112, raised: '£896k', target: '£800k', closes: '6 days',
    minTicket: '£10', trending: true, hue: 'c1',
  },
  {
    id: 'ferra-robotics', name: 'Ferra Robotics', code: 'FERA', sector: 'Robotics',
    type: 'crowdfunding', platform: 'crowdcube', currency: '£',
    price: 3.45, change: 0, valuation: '£29m',
    progress: 67, raised: '£1.0m', target: '£1.5m', closes: '11 days',
    minTicket: '£10', hue: 'c3',
  },
  {
    id: 'nimbuspay', name: 'NimbusPay', code: 'NMBP', sector: 'Fintech',
    type: 'crowdfunding', platform: 'republic-eu', currency: '£',
    price: 1.28, change: 0, valuation: '£18m',
    progress: 93, raised: '£1.4m', target: '£1.5m', closes: '2 days',
    minTicket: '£20', hue: 'c2',
  },
  {
    id: 'brightloop', name: 'Brightloop', code: 'BRLP', sector: 'Climate',
    type: 'crowdfunding', platform: 'crowdcube', currency: '£',
    price: 0.88, change: 0, valuation: '£9.5m',
    progress: 41, raised: '£410k', target: '£1.0m', closes: '19 days',
    minTicket: '£10', hue: 'c5',
  },
  {
    id: 'kestrel-aero', name: 'Kestrel Aero', code: 'KSTL', sector: 'Aerospace',
    type: 'crowdfunding', platform: 'wefunder', currency: '$',
    price: 5.6, change: 0, valuation: '$44m',
    progress: 58, raised: '$1.3m', target: '$2.2m', closes: '14 days',
    minTicket: '$100', hue: 'c6',
  },
  {
    id: 'verdant-foods', name: 'Verdant Foods', code: 'VRDT', sector: 'Foodtech',
    type: 'crowdfunding', platform: 'startengine', currency: '$',
    price: 1.15, change: 0, valuation: '$16m',
    progress: 76, raised: '$912k', target: '$1.2m', closes: '8 days',
    minTicket: '$100', hue: 'c1',
  },
  {
    id: 'solent-micro', name: 'Solent Micro', code: 'SLNT', sector: 'Semiconductors',
    type: 'crowdfunding', platform: 'seedblink', currency: '€',
    price: 4.02, change: 0, valuation: '€27m',
    progress: 88, raised: '€1.76m', target: '€2.0m', closes: '4 days',
    minTicket: '€50', trending: true, hue: 'c2',
  },
];

export const marketStats = {
  liveDeals: deals.length,
  venues: platforms.length,
  markets: 3,
};

export const fmtPrice = (d: Deal): string =>
  `${d.currency}${d.price.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const fmtChange = (d: Deal): string =>
  d.change === 0 ? '—' : `${d.change > 0 ? '+' : ''}${d.change.toFixed(1)}%`;
