/**
 * Academy lessons, as short scripted explainers.
 *
 * Each lesson is a sequence of scenes. A scene is one visual plus one line of
 * narration, held for `t` seconds; the player (public/lesson-player.js) walks
 * them on a timeline you can pause, scrub and step through, which is what makes
 * these play like a two-minute video rather than read like a slide deck.
 *
 * Numbers here are illustrative teaching figures drawn from published
 * industry ranges, never live data and never a forecast. Every lesson carries a
 * `note` saying so.
 */

export type VisualKind =
  | 'stat'
  | 'bars'
  | 'dots'
  | 'donut'
  | 'timeline'
  | 'stack'
  | 'curve';

export interface Scene {
  /** Seconds this scene holds before the player advances. */
  t: number;
  title: string;
  caption: string;
  visual: VisualKind;
  data: Record<string, any>;
  /** Optional drag control that re-computes the visual live. */
  knob?: { field: string; label: string; min: number; max: number; step?: number; unit?: string };
}

export interface Lesson {
  slug: string;
  title: string;
  icon: string;
  category: string;
  level: 1 | 2 | 3;
  minutes: number;
  blurb: string;
  note: string;
  scenes: Scene[];
  /** The same argument in prose, under the player. */
  text: string[];
  takeaways: string[];
}

export const lessons: Lesson[] = [
  {
    slug: 'why-diversification-matters',
    title: 'Why diversification matters',
    icon: 'pie',
    category: 'Core path',
    level: 1,
    minutes: 3,
    blurb:
      'Power laws, failure rates, and why professionals build portfolios instead of picking winners.',
    note: 'Illustrative model based on published early-stage outcome ranges. Not a forecast.',
    scenes: [
      {
        t: 7,
        title: 'Most of them return nothing',
        caption:
          'Out of 100 early-stage companies, roughly 60 return less than the money put in. That is the base rate, not bad luck.',
        visual: 'dots',
        data: { total: 100, groups: [
          { n: 60, label: 'Lose money', tone: 'down' },
          { n: 35, label: 'Return 1x to 5x', tone: 'mid' },
          { n: 5, label: 'Return the fund', tone: 'up' },
        ] },
      },
      {
        t: 7,
        title: 'A handful carry everything',
        caption:
          'The top 5 companies produce most of the return of the whole set. Miss them and the arithmetic never recovers.',
        visual: 'bars',
        data: {
          unit: 'x money back',
          max: 30,
          items: [
            { label: 'Bottom 60', value: 0.3 },
            { label: 'Middle 35', value: 2.2 },
            { label: 'Top 5', value: 27 },
          ],
        },
      },
      {
        t: 9,
        title: 'So how many do you need?',
        caption:
          'Drag it. With a 5% chance any one company is a big winner, holding more positions is the only lever you actually control.',
        visual: 'dots',
        data: { total: 100, held: 20, winRate: 0.05, mode: 'coverage' },
        knob: { field: 'held', label: 'Positions held', min: 1, max: 50, step: 1 },
      },
      {
        t: 7,
        title: 'Breadth is a decision, not a hope',
        caption:
          'Spread across sectors and stages too. Correlated bets fail together, which quietly undoes the spread you thought you had.',
        visual: 'donut',
        data: {
          items: [
            { label: 'Fintech', value: 20 },
            { label: 'AI & deep tech', value: 20 },
            { label: 'Health', value: 20 },
            { label: 'Climate', value: 20 },
            { label: 'Consumer', value: 20 },
          ],
        },
      },
      {
        t: 6,
        title: 'What this buys you',
        caption:
          'Not safety. Survival: enough positions that one failure is an event, not the end of your private-markets portfolio.',
        visual: 'stat',
        data: { value: 20, suffix: '+', label: 'positions', sub: 'the point where no single loss decides your outcome' },
      },
    ],
    text: [
      'Early-stage investing has an ugly, well-documented shape: most companies return nothing, a middle band returns something modest, and a tiny top slice returns almost all of the money. Published venture datasets differ on the exact split, but every one of them has the same tail.',
      'That shape breaks the instinct most people bring from public markets, which is to pick carefully and hold a few names you believe in. Picking carefully is fine. Picking few is what kills you, because the winners are not identifiable in advance and the losses arrive first.',
      'Professionals answer this with breadth. A seed fund is not making twenty bets because it likes twenty companies equally; it is making twenty bets because the return maths only works if it is holding the outlier when the outlier appears.',
      'Breadth has a second requirement people skip: the positions have to be genuinely different. Twenty fintech companies in the same funding vintage are closer to one bet than twenty. Spread across sector, stage and route in, and the correlation between your failures drops.',
    ],
    takeaways: [
      'Roughly 6 in 10 early-stage companies return less than you put in.',
      'A handful of winners produce most of the return of any given set.',
      'You cannot pick the winners reliably, so hold enough positions to own one.',
      'Diversify across sector and stage, not just company count.',
    ],
  },

  {
    slug: 'why-startups-fail',
    title: 'Why startups fail',
    icon: 'pulse',
    category: 'Core path',
    level: 1,
    minutes: 3,
    blurb:
      'The honest base rates, and what "most startups fail" should change about your behaviour.',
    note: 'Illustrative teaching figures drawn from published post-mortem and survival studies.',
    scenes: [
      {
        t: 7,
        title: 'The survival curve',
        caption:
          'About 90% of startups fail eventually. Most of the dying happens between years two and five, once the first cheque runs out.',
        visual: 'curve',
        data: {
          xLabels: ['Yr 1', 'Yr 2', 'Yr 3', 'Yr 5', 'Yr 10'],
          points: [100, 82, 60, 38, 18],
          yLabel: 'still trading',
          unit: '%',
        },
      },
      {
        t: 8,
        title: 'What actually kills them',
        caption:
          'Rarely a bad idea. Usually no market need, then running out of cash, then the founding team coming apart.',
        visual: 'bars',
        data: {
          unit: '% of post-mortems citing it',
          max: 45,
          items: [
            { label: 'No market need', value: 42 },
            { label: 'Ran out of cash', value: 29 },
            { label: 'Team problems', value: 23 },
            { label: 'Out-competed', value: 19 },
            { label: 'Pricing / model', value: 18 },
          ],
        },
      },
      {
        t: 7,
        title: 'Failure is slow and quiet',
        caption:
          'Companies rarely announce it. They stop updating investors, miss a raise, and drift. Assume silence is information.',
        visual: 'timeline',
        data: {
          items: [
            { at: 'Month 0', label: 'Round closes, updates are monthly' },
            { at: 'Month 9', label: 'Updates go quarterly, metrics get vaguer' },
            { at: 'Month 15', label: 'Bridge round, existing investors only' },
            { at: 'Month 22', label: 'Silence, then a wind-down email' },
          ],
        },
      },
      {
        t: 6,
        title: 'What to do about it',
        caption:
          'Behave as if every single holding will go to zero, and size each one so that outcome is survivable.',
        visual: 'stat',
        data: { value: 90, suffix: '%', label: 'eventual failure rate', sub: 'the number your position sizing has to respect' },
      },
    ],
    text: [
      'The headline is familiar: most startups fail. The useful version is more specific. Survival studies consistently show a steep drop between years two and five, once the money from the first serious round is spent and the company has to prove demand rather than promise it.',
      'Post-mortems point at the same causes over and over. The largest single category is building something nobody urgently needed. Cash exhaustion is second, and it is usually a symptom of the first. Team breakdown is third and badly under-discussed.',
      'For an investor, the practical consequence is not pessimism, it is process. You will not get a clean notification when a holding dies. You will notice the updates thinning out, then a flat or down round offered only to insiders, then nothing.',
      'So size every position as if it is going to zero, keep enough positions that any one of them can, and treat a quiet founder as a data point rather than a scheduling problem.',
    ],
    takeaways: [
      'Roughly 9 in 10 eventually fail, mostly between years two and five.',
      'No market need and cash exhaustion dominate the post-mortems.',
      'Failure arrives quietly: thinning updates, insider bridges, silence.',
      'Size each position so a total loss is survivable.',
    ],
  },

  {
    slug: 'what-dilution-means-for-you',
    title: 'What dilution means for you',
    icon: 'split',
    category: 'Core path',
    level: 2,
    minutes: 3,
    blurb:
      "Your 0.5% won't stay 0.5%. How later rounds shrink your slice, and when that's good news.",
    note: 'Illustrative cap-table arithmetic. Real rounds vary widely in size and structure.',
    scenes: [
      {
        t: 7,
        title: 'You buy a percentage, not a promise',
        caption:
          'A £5,000 cheque into a £5m round buys 0.1% of the company. That number starts shrinking at the very next raise.',
        visual: 'stat',
        data: { value: 0.1, suffix: '%', label: 'of the company, today', sub: '£5,000 into a £5m valuation' },
      },
      {
        t: 9,
        title: 'Each round takes a slice',
        caption:
          'New investors buy newly issued shares. Everyone already on the cap table owns the same shares, but a smaller share of the whole.',
        visual: 'stack',
        data: {
          rounds: [
            { name: 'Seed', you: 0.1, newMoney: 0 },
            { name: 'Series A', you: 0.078, newMoney: 22 },
            { name: 'Series B', you: 0.063, newMoney: 20 },
            { name: 'Series C', you: 0.053, newMoney: 16 },
          ],
        },
      },
      {
        t: 8,
        title: 'Smaller slice, bigger pie',
        caption:
          'Dilution is only bad if the valuation is not rising with it. Half of £200m beats all of £2m, every time.',
        visual: 'bars',
        data: {
          unit: '£ value of your stake',
          max: 110000,
          money: true,
          items: [
            { label: 'Seed, 0.10% of £5m', value: 5000 },
            { label: 'Series A, 0.078% of £25m', value: 19500 },
            { label: 'Series B, 0.063% of £80m', value: 50400 },
            { label: 'Series C, 0.053% of £200m', value: 106000 },
          ],
        },
      },
      {
        t: 7,
        title: 'The dilution that does hurt',
        caption:
          'Down rounds, big option-pool top-ups and liquidation preferences stacking ahead of you. Those shrink the slice without growing the pie.',
        visual: 'bars',
        data: {
          unit: '£ value of your stake',
          max: 110000,
          money: true,
          items: [
            { label: 'Flat round', value: 42000 },
            { label: 'Down round at half', value: 19000 },
            { label: '2x preference ahead of you', value: 7000 },
          ],
        },
      },
      {
        t: 6,
        title: 'What to check before you invest',
        caption:
          'Ask for the share class, the preference stack and the option pool. Those three decide what your percentage is actually worth.',
        visual: 'stat',
        data: { value: 3, label: 'questions', sub: 'share class · preference stack · option pool' },
      },
    ],
    text: [
      'Buying into a private company buys you a percentage of it at a moment in time. That percentage is not fixed. Every subsequent round issues new shares, and unless you buy more, your slice of the whole gets smaller.',
      'That is normal and usually fine. If the company is worth ten times more when your stake is diluted by a quarter, you are comfortably ahead. Dilution alongside a rising valuation is the ordinary price of the company having enough money to grow.',
      'The dilution that genuinely hurts comes in three shapes. A down round issues shares at a lower price, so more shares are created for the same money. A large option-pool refresh dilutes existing holders to fund future hires. And liquidation preferences pay later investors out ahead of you, which can leave a "successful" exit paying ordinary shareholders very little.',
      'None of this is hidden. It is in the share class, the preference stack and the option pool. Crowdfunding rounds in particular often sell ordinary shares sitting behind everything else, which is worth knowing before rather than after.',
    ],
    takeaways: [
      'Your percentage shrinks at every round: that alone is not bad news.',
      'Dilution with a rising valuation still grows the value of your stake.',
      'Down rounds, pool refreshes and preferences shrink value, not just percentage.',
      'Always check share class, preference stack and option pool.',
    ],
  },

  {
    slug: 'illiquidity-the-decade-long-deal',
    title: 'Illiquidity: the decade-long deal',
    icon: 'timer',
    category: 'Core path',
    level: 1,
    minutes: 3,
    blurb:
      "Why you can't sell startup shares like stocks, what PISCES windows change, and what they don't.",
    note: 'Illustrative timings. Secondary access varies by company, venue and share class.',
    scenes: [
      {
        t: 7,
        title: 'There is no sell button',
        caption:
          'Private shares have no continuous market. A buyer, a price and the company\'s permission all have to line up at once.',
        visual: 'stat',
        data: { value: 0, label: 'buyers waiting', sub: 'unless a specific liquidity event creates them' },
      },
      {
        t: 8,
        title: 'How long money is actually tied up',
        caption:
          'From first cheque to cash back, seven to ten years is normal. Plan around that, not around the optimistic case.',
        visual: 'curve',
        data: {
          xLabels: ['Yr 1', 'Yr 3', 'Yr 5', 'Yr 7', 'Yr 10'],
          points: [0, 4, 15, 45, 78],
          yLabel: 'chance of any liquidity',
          unit: '%',
        },
      },
      {
        t: 8,
        title: 'The ways out, ranked by likelihood',
        caption:
          'Acquisition is the common one. Secondaries are growing. IPOs are rare, and "zombie" companies that neither die nor exit are more common than either.',
        visual: 'bars',
        data: {
          unit: '% of outcomes',
          max: 50,
          items: [
            { label: 'Failure / wind-down', value: 48 },
            { label: 'Acquisition', value: 26 },
            { label: 'Zombie, no exit', value: 18 },
            { label: 'Secondary sale', value: 6 },
            { label: 'IPO', value: 2 },
          ],
        },
      },
      {
        t: 8,
        title: 'What PISCES changes',
        caption:
          'The UK\'s new private-share venue creates scheduled trading windows. Real liquidity, but periodic, permissioned, and only for participating companies.',
        visual: 'timeline',
        data: {
          items: [
            { at: 'Window opens', label: 'Company chooses to run a trading event' },
            { at: 'Disclosure', label: 'Set information goes to eligible buyers' },
            { at: 'Trade', label: 'Matched at an agreed price, within the window' },
            { at: 'Closed', label: 'No trading again until the next window' },
          ],
        },
      },
      {
        t: 6,
        title: 'The rule that follows',
        caption:
          'Only commit money you will not need for a decade. Illiquidity is the risk you feel last and regret most.',
        visual: 'stat',
        data: { value: 10, suffix: ' yrs', label: 'planning horizon', sub: 'money you can genuinely leave alone' },
      },
    ],
    text: [
      'Public shares trade continuously because an exchange guarantees a counterparty. Private shares have nothing like that. To sell, you need someone who wants to buy that specific company at a price you both accept, and usually the company\'s consent to transfer the shares at all.',
      'The practical result is a holding period measured in years. Seven to ten from first investment to any cash back is a reasonable planning assumption, and plenty of companies take longer or never get there.',
      'Exits are not evenly distributed either. Wind-downs are the single most common outcome, acquisitions are the realistic good case, and IPOs are rare enough that planning around one is not planning. The under-discussed category is the zombie: a company that survives without ever producing an exit.',
      'PISCES, the UK\'s intermittent trading venue for private shares, genuinely improves this. It creates scheduled, disclosed, permissioned windows in which existing shareholders can sell. It does not turn private equity into a liquid asset, and it only helps for companies that choose to run a window.',
    ],
    takeaways: [
      'There is no continuous market: selling needs a buyer, a price and consent.',
      'Seven to ten years is the honest planning horizon.',
      'Wind-downs and acquisitions dominate; IPOs are rare.',
      'PISCES windows add periodic liquidity, not on-demand liquidity.',
    ],
  },

  {
    slug: 'seis-and-eis-without-the-mythology',
    title: 'SEIS & EIS, without the mythology',
    icon: 'award',
    category: 'Tax & structure',
    level: 2,
    minutes: 3,
    blurb:
      'What the reliefs actually do, what they never protect you from, and the paperwork that matters.',
    note: 'Illustrative, at rates current for 2026. Tax treatment depends on your circumstances and can change. Not tax advice.',
    scenes: [
      {
        t: 7,
        title: 'What the relief is worth',
        caption:
          'SEIS gives 50% income-tax relief, EIS 30%, on qualifying investments. That is a discount on entry, not a floor under the value.',
        visual: 'bars',
        data: {
          unit: '% of your investment back as relief',
          max: 60,
          items: [
            { label: 'SEIS income-tax relief', value: 50 },
            { label: 'EIS income-tax relief', value: 30 },
          ],
        },
      },
      {
        t: 9,
        title: 'The downside case, with and without',
        caption:
          'On a £10,000 SEIS investment that goes to zero, relief plus loss relief can leave a higher-rate taxpayer roughly £2,750 out of pocket instead of £10,000.',
        visual: 'bars',
        data: {
          unit: 'net loss on £10,000',
          max: 10000,
          money: true,
          items: [
            { label: 'No relief', value: 10000 },
            { label: 'EIS, after relief', value: 4200 },
            { label: 'SEIS, after relief', value: 2750 },
          ],
        },
      },
      {
        t: 7,
        title: 'What it never does',
        caption:
          'It does not make a bad company good, does not create liquidity, and does not survive you breaking the holding rules.',
        visual: 'stat',
        data: { value: 3, label: 'years minimum hold', sub: 'sell earlier and the relief is clawed back' },
      },
      {
        t: 8,
        title: 'The paperwork that decides it',
        caption:
          'No certificate, no relief. The company applies, HMRC issues the form, you claim. Advance assurance is a signal, not a guarantee.',
        visual: 'timeline',
        data: {
          items: [
            { at: 'Before the raise', label: 'Company gets advance assurance from HMRC' },
            { at: 'You invest', label: 'Shares must be new ordinary shares, paid in full' },
            { at: '4+ months later', label: 'Company issues you an SEIS3 / EIS3 certificate' },
            { at: 'Your tax return', label: 'You claim, and hold for at least three years' },
          ],
        },
      },
      {
        t: 6,
        title: 'How to use it',
        caption:
          'Let it improve the risk of a deal you already wanted. Never let it be the reason you wanted the deal.',
        visual: 'stat',
        data: { value: 1, label: 'rule', sub: 'relief improves a good decision, it cannot rescue a bad one' },
      },
    ],
    text: [
      'SEIS and EIS are the UK\'s schemes for pushing private capital into young companies, and they do it by rebating part of your investment against income tax: 50% for SEIS, 30% for EIS, within annual limits.',
      'The more important feature is loss relief. If the company fails, you can usually set the net loss against income or capital gains, which is why the worst case on an SEIS investment for a higher-rate taxpayer is a fraction of the cheque rather than the whole thing.',
      'What the schemes never do is change the company\'s prospects, shorten the holding period, or create a buyer. They also come with conditions: minimum three-year holds, restrictions on connection to the company, and the requirement that the shares are newly issued ordinary shares paid in full.',
      'The paperwork is the part that trips people up. Relief is claimed against a certificate the company issues after trading for four months, not against your bank transfer. Advance assurance tells you HMRC expects the company to qualify; it is not the certificate and it is not a promise.',
    ],
    takeaways: [
      'SEIS 50% and EIS 30% income-tax relief, plus loss relief on failure.',
      'Relief cuts the downside; it does not remove risk or add liquidity.',
      'Hold at least three years or the relief is clawed back.',
      'You claim against an SEIS3 / EIS3 certificate, not against advance assurance.',
    ],
  },

  {
    slug: 'realistic-exit-timelines',
    title: 'Realistic exit timelines',
    icon: 'clock',
    category: 'Core path',
    level: 2,
    minutes: 3,
    blurb:
      'Acquisitions, IPOs, failures and zombies: when private investments actually return money.',
    note: 'Illustrative distributions based on published exit data. Individual outcomes vary enormously.',
    scenes: [
      {
        t: 7,
        title: 'The J-curve is real',
        caption:
          'Paper value usually falls before it rises. Early write-offs land years before the winners are marked up.',
        visual: 'curve',
        data: {
          xLabels: ['Yr 1', 'Yr 3', 'Yr 5', 'Yr 7', 'Yr 10'],
          points: [100, 78, 92, 145, 230],
          yLabel: 'portfolio value',
          unit: '',
        },
      },
      {
        t: 8,
        title: 'When money actually comes back',
        caption:
          'Acquisitions cluster around years five to eight. Anything returning capital inside three years is the exception, not the plan.',
        visual: 'bars',
        data: {
          unit: '% of exits in this window',
          max: 40,
          items: [
            { label: 'Years 1 to 3', value: 8 },
            { label: 'Years 4 to 6', value: 34 },
            { label: 'Years 7 to 9', value: 38 },
            { label: 'Year 10+', value: 20 },
          ],
        },
      },
      {
        t: 8,
        title: 'What the exit looks like',
        caption:
          'Most acquisitions are modest. Life-changing outcomes exist but they are the thin end of a very long tail.',
        visual: 'bars',
        data: {
          unit: '% of acquisitions',
          max: 50,
          items: [
            { label: 'Under £25m', value: 46 },
            { label: '£25m to £100m', value: 32 },
            { label: '£100m to £500m', value: 16 },
            { label: 'Over £500m', value: 6 },
          ],
        },
      },
      {
        t: 7,
        title: 'Plan the pacing, not the payday',
        caption:
          'Investing steadily across years spreads you over vintages, so your outcomes are not decided by one market cycle.',
        visual: 'timeline',
        data: {
          items: [
            { at: 'Yr 1', label: '4 positions, one vintage' },
            { at: 'Yr 3', label: '12 positions, three vintages' },
            { at: 'Yr 5', label: '20 positions, first exits appear' },
            { at: 'Yr 8', label: 'Recycling proceeds into new vintages' },
          ],
        },
      },
      {
        t: 6,
        title: 'The number to hold on to',
        caption:
          'Roughly seven years from cheque to cash, on the deals that work at all.',
        visual: 'stat',
        data: { value: 7, suffix: ' yrs', label: 'median time to a successful exit', sub: 'on the minority that reach one' },
      },
    ],
    text: [
      'Private portfolios follow a J-curve. Early on, the failures are recognised long before the winners are re-marked, so the paper value of a young portfolio typically dips before it climbs.',
      'Exits cluster later than most people expect. The bulk of acquisitions land somewhere between years four and nine from investment. Returns inside three years happen, but building a plan around them is building a plan around the exception.',
      'The size distribution matters as much as the timing. Most acquisitions are modest, which is fine if your position sizing assumed it. The enormous outcomes are real but rare, and they are exactly why breadth matters.',
      'The practical answer is pacing. Investing a steady amount each year, rather than deploying everything into one vintage, spreads you across market cycles and means your first exits start recycling into later positions.',
    ],
    takeaways: [
      'Expect paper value to dip before it rises: the J-curve.',
      'Most exits land between years four and nine.',
      'Most acquisitions are modest; the giant ones are rare.',
      'Pace your investing across years to spread vintage risk.',
    ],
  },

  {
    slug: 'how-to-build-a-startup-portfolio',
    title: 'How to build a startup portfolio',
    icon: 'sliders',
    category: 'Portfolio craft',
    level: 3,
    minutes: 4,
    blurb:
      'Position sizing, sector spread, stage balance and pacing: the craft, end to end.',
    note: 'Illustrative framework, not a recommendation. Your own limits depend on your circumstances.',
    scenes: [
      {
        t: 8,
        title: 'Start with the cap, not the deal',
        caption:
          'Decide what share of your investable wealth belongs in private markets before you look at anything. For most people it is single digits.',
        visual: 'donut',
        data: {
          items: [
            { label: 'Everything else', value: 90 },
            { label: 'Private markets', value: 10 },
          ],
        },
      },
      {
        t: 9,
        title: 'Then divide, do not multiply',
        caption:
          'Your cheque size is the cap divided by your target position count. Drag it: bigger portfolios mean smaller cheques, and that is the point.',
        visual: 'dots',
        data: { total: 100, held: 20, winRate: 0.05, mode: 'coverage' },
        knob: { field: 'held', label: 'Target positions', min: 5, max: 50, step: 1 },
      },
      {
        t: 8,
        title: 'Spread the risk you can see',
        caption:
          'Sector, stage and route in. Four sectors and two stages beats twenty companies doing the same thing at the same moment.',
        visual: 'donut',
        data: {
          items: [
            { label: 'Fintech', value: 25 },
            { label: 'AI & deep tech', value: 25 },
            { label: 'Health', value: 20 },
            { label: 'Climate', value: 15 },
            { label: 'Consumer', value: 15 },
          ],
        },
      },
      {
        t: 8,
        title: 'Pace it over years',
        caption:
          'Deploy a fixed amount a year rather than all at once. Vintage diversification is the one nobody talks about.',
        visual: 'timeline',
        data: {
          items: [
            { at: 'Yr 1', label: '£6,000 across 4 deals' },
            { at: 'Yr 2', label: '£6,000 across 4 deals' },
            { at: 'Yr 3', label: '£6,000, first follow-on reserved' },
            { at: 'Yr 5', label: '20 positions, 5 vintages, still investing' },
          ],
        },
      },
      {
        t: 7,
        title: 'Reserve for the winners',
        caption:
          'Hold back part of each year for follow-ons. Doubling down on the ones that are working is where portfolios are made.',
        visual: 'bars',
        data: {
          unit: '% of annual budget',
          max: 100,
          items: [
            { label: 'New positions', value: 70 },
            { label: 'Follow-on reserve', value: 30 },
          ],
        },
      },
      {
        t: 6,
        title: 'Write it down',
        caption:
          'A plan you can read back is a plan you can stick to when a hyped round is in front of you.',
        visual: 'stat',
        data: { value: 1, label: 'written plan', sub: 'cap · position count · cheque size · pacing · reserve' },
      },
    ],
    text: [
      'Portfolio construction runs in one direction: from your total wealth down to a single cheque, never from an exciting deal upwards. Set the share of investable assets that belongs in private markets first. For most people that is a single-digit percentage, and the restricted-investor category in the UK formalises it at 10%.',
      'Divide that cap by the number of positions you intend to hold, and you have your cheque size. If the answer is uncomfortably small, the honest fix is fewer pounds per deal or more years of investing, not fewer positions.',
      'Diversify along the dimensions you can actually observe: sector, stage and route in. Companies in one sector and one vintage fail together, which is precisely the correlation that undoes a nominally broad portfolio.',
      'Then pace it. Investing a fixed amount each year buys you vintage diversification, keeps dry powder for follow-ons into the positions that are working, and stops a single hot market from defining your whole portfolio.',
    ],
    takeaways: [
      'Set the allocation cap before you look at a single deal.',
      'Cheque size = cap ÷ target position count.',
      'Spread across sector, stage and route in, not just company count.',
      'Pace across years and reserve part of the budget for follow-ons.',
    ],
  },

  {
    slug: 'reading-a-pitch-like-a-sceptic',
    title: 'Reading a pitch like a sceptic',
    icon: 'search',
    category: 'Portfolio craft',
    level: 3,
    minutes: 3,
    blurb:
      'Traction theatre, TAM fiction and valuation tells: the questions that cut through.',
    note: 'Illustrative examples. Nothing here is a comment on any specific company or raise.',
    scenes: [
      {
        t: 8,
        title: 'Traction theatre',
        caption:
          'Cumulative charts only go up. Ask for monthly revenue, monthly active users and retention, and watch the shape change.',
        visual: 'bars',
        data: {
          unit: 'what the number actually tells you',
          max: 100,
          items: [
            { label: 'Cumulative sign-ups', value: 15 },
            { label: 'Monthly active users', value: 65 },
            { label: 'Monthly recurring revenue', value: 85 },
            { label: 'Cohort retention at 6 months', value: 95 },
          ],
        },
      },
      {
        t: 8,
        title: 'TAM fiction',
        caption:
          'A £40bn market is not addressable. Work down to the customers this company can actually reach in five years, then look at the valuation again.',
        visual: 'bars',
        data: {
          unit: '£m, market claimed vs reachable',
          max: 40000,
          money: true,
          items: [
            { label: 'Total market claimed', value: 40000 },
            { label: 'Segment they can serve', value: 2200 },
            { label: 'Reachable in 5 years', value: 180 },
          ],
        },
      },
      {
        t: 8,
        title: 'Valuation tells',
        caption:
          'Compare the raise to revenue, not to ambition. A pre-revenue company priced at £15m needs an extraordinary story to justify it.',
        visual: 'bars',
        data: {
          unit: 'revenue multiple at the asking price',
          max: 60,
          items: [
            { label: 'Mature SaaS comparable', value: 6 },
            { label: 'High-growth SaaS', value: 14 },
            { label: 'This round', value: 52 },
          ],
        },
      },
      {
        t: 8,
        title: 'The five questions',
        caption:
          'Who is already paying? What happens if the top customer leaves? How long does the cash last? What did the last round price at? What do I own?',
        visual: 'timeline',
        data: {
          items: [
            { at: '1', label: 'Who pays today, and how much?' },
            { at: '2', label: 'What is the concentration risk?' },
            { at: '3', label: 'What is the runway, in months?' },
            { at: '4', label: 'What was the last round priced at?' },
            { at: '5', label: 'Which share class am I buying?' },
          ],
        },
      },
      {
        t: 6,
        title: 'Scepticism is not cynicism',
        caption:
          'The aim is not to talk yourself out of everything. It is to know exactly what you are betting on.',
        visual: 'stat',
        data: { value: 5, label: 'questions before any cheque', sub: 'if the answers are not available, that is the answer' },
      },
    ],
    text: [
      'Pitch materials are marketing, and good marketing selects its numbers. That is not dishonesty, it is the format. Your job is to convert the selected numbers back into the underlying ones.',
      'Traction is where this shows up first. Cumulative totals only ever rise, so they carry almost no information. Monthly figures and cohort retention do, because they reveal whether people stay after the launch push ends.',
      'Market sizing is the second. A total addressable market of tens of billions describes an industry, not an opportunity. Work down to the customers this specific company can reach with this specific product within five years, and the valuation has to be defended against that number instead.',
      'Then check what you are actually buying. The last round\'s price, the current runway, the customer concentration and the share class you are being offered tell you more about your likely outcome than any slide in the deck. If a founder cannot answer those quickly, the difficulty of getting the answer is itself the answer.',
    ],
    takeaways: [
      'Cumulative charts hide the truth; ask for monthly and cohort data.',
      'Discount claimed TAM down to what is reachable in five years.',
      'Price the round against revenue and the last round, not the story.',
      'Know the runway, the concentration and your share class before investing.',
    ],
  },
];

export const corePath = lessons.filter((l) => l.category === 'Core path');

export const lessonBySlug = (slug: string) => lessons.find((l) => l.slug === slug);

export const lessonMeta = (l: Lesson) => `${l.minutes} min · Level ${l.level}`;
