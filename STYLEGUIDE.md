# Bundle design system — component styleguide

Premium fintech theme: calm, light, serif-headed — the Mercury / Stripe / Ramp
register rather than a trading terminal (Bundle is an aggregator of crowdfunding,
secondary and pre-IPO deals across third-party venues).
Everything themeable lives in `src/styles/global.css` as CSS custom properties.
A public visual summary lives at `/brand`. Deal/venue demo data lives in
`src/data/deals.ts` (illustrative only — never present as live quotes).

## Tokens

| Group | Tokens |
|---|---|
| Surfaces | `--bg` #F7F8F4 (page) · `--surface` #FFFFFF (cards) · `--tint` #EDF2EC (primary light) · `--cream` #EFE9DC (heroes/alt) · `--tint-soft` #F1F4EE |
| Ink & text | `--ink` #14281E (headings, dark sections) · `--text` #34473A · `--text-2` #5F705F (secondary/meta) · `--faint` #7E8D7E |
| Hairlines | `--line` #D9E2DB · `--line-2` #C4D2C6 |
| Brand | `--green` #21402E · `--green-deep` #14281E (hover = darker) · `--green-soft` #EDF2EC · `--gold` #C9A227 · `--gold-deep` #AD8A1D · `--gold-soft` #F6EFDB |
| Market direction | `--up` #2E7D32 / `--up-ink` / `--up-tint` · `--down` #D32F2F / `--down-ink` / `--down-tint` — price movement only, never decor |
| Status (reserved) | sage `--sage/-ink/-tint` · sand `--sand/-ink/-tint` · red `--red/-ink/-tint` · info `--info/-ink/-tint` |
| Charts | categorical `--c1..--c6` · ordinal green ramp `--ramp1..--ramp4` · `--chart-track` · `--chart-deemph` |
| Shape | `--r-s` 8px · `--r-m` 12px (buttons, inputs) · `--r-l` 16px (cards, charts) · `--r-pill` |
| Depth | `--shadow-s/m/l` — one soft elevation, `0 6px 24px rgba(20,40,30,.08)` at `-m`. No heavy shadows. |
| Type | `--font-display` / `--font-serif` Instrument Serif · `--font-body` Inter · `--font-mono` IBM Plex Mono |

**Colour ratio: 65% `--bg` · 20% white cards · 10% greens · 5% gold.** Gold never
dominates — **one gold CTA per page, maximum** (`.btn-gold`, usually the CTABand).

**`--faint` is for placeholders and non-text marks only.** Any text a user reads
uses `--text-2` or darker; `--faint` is 3.5:1 on white and fails AA for text.

**Status colours are reserved** for meaning (good / caution / failure) and always
ship with a label or icon — never as chart series. Chart series use `--c1..c6`
in fixed order; ordered scales (stage, tiers) use the green ramp. `--up`/`--down`
belong to prices and deltas exclusively; use the `-ink` steps when the colour is
text sitting on its own tint.

### Two accessibility deviations from the source spec

1. **Premium CTA label.** The spec asks for white on `--gold`; that is 2.42:1 and
   fails WCAG. `.btn-gold` uses `--ink` on gold instead (6.42:1) — same gold,
   readable label.
2. **Chart gold.** Brand `--gold` is 2.42:1 on white, below the 3:1 mark floor, so
   chart slot `--c2` uses a darker step (#A8871F).

## Typography rule

Serif is reserved for **large** headings — `h1`, `h2`, `.display`, `.h2`, and
`.serif-aside` (italic pull-quotes / emphasised phrases). `h3` and below, plus all
UI chrome (nav, buttons, labels, table headers), stay in Inter. Prices and
tabular data stay in IBM Plex Mono via `.px` / `.mono` / `.tabular`.

**Instrument Serif ships weight 400 only** — never pair `--font-display` with a
`font-weight` above 400 or the browser synthesises a faux-bold.

## Utility classes (global.css)

- Layout: `.container` (+`.narrow`), `.section` (+`.tight`, `.section-tint-full`,
  `.section-cream`, `.section-ink`), `.split` (+`.wide-left/right`), `.grid .cols-2/3/4`
- Type: `.display`, `.h2`, `.h3`, `.lead`, `.eyebrow` (+`.no-rule`),
  `.serif-aside`, `.text-grad` (solid gold display accent), `.muted`, `.small`,
  `.mono`, `.tabular`, `.center`
- Surfaces: `.card` (+`.card-hover`), `.panel`, `.panel-tint`, `.glow-card`
  (gold hairline), `.bg-grid`, `.bg-wash`, `.aurora` (very soft tint)
- Market: `.up`/`.down` (price colour), `.px` (mono tabular price), `.live-dot`
  (pulsing green), `.src-chip` (venue chip), `.prog > span` (funding bar),
  `.badge-up`/`.badge-down`
- Buttons: `.btn` + `.btn-primary` (solid green) / `.btn-ghost` (white, hairline)
  / `.btn-gold` (premium CTA, one per page) / `.btn-ink` (white, for dark panels),
  sizes `.btn-lg` / `.btn-sm`, `.text-link` (arrow span: `<span class="arrow">→</span>`)
- Bits: `.badge` (+ `-green/-gold/-sage/-sand/-red/-ink/-line`), `.icon-chip`
  (+ tone classes incl. `.gold`), `.check-list`, `.step-num`,
  `.table-wrap > table.table`, `.faq`, `.field`, `.prose` (+ `.callout`, `.callout.warn`)

`.section-ink` is the dark-green inverse surface: it re-tints headings to white,
body to #C9D6C9, eyebrows/links/icon-chips to gold. The site footer and the risk
ribbon use the same surface.
- Motion: add `.reveal` (+ optional `style="--d:.08s"` stagger) — BaseLayout's
  IntersectionObserver adds `.in`. Respects `prefers-reduced-motion`.

## Components (`src/components/`)

| Component | Use | Key props |
|---|---|---|
| `Logo` | brand lockup | `size`, `tone: default\|white`, `markOnly` |
| `Icon` | 24px line icons | `name`, `size`, `stroke` — names listed in the file |
| `Nav` / `Footer` | in BaseLayout | — |
| `PageHero` | interior hero | `eyebrow`, `title` (HTML ok), `lead`, `center`; slots `actions`, `visual` |
| `ConcentrationMeter` | signature gauge | `score` 0–100 + `sub`, or `interactive positions={n}` |
| `Donut` | allocation ring ≤6 segments | `segments [{label,value}]`, `centerTitle/Sub`, `legend` |
| `Bars` | exposure bars | `items`, `mode: single\|ramp` (ramp = ordered categories) |
| `Stat` | animated counter tile | `value/decimals/prefix/suffix/label/note` (`data-plain` span for ungrouped numbers) |
| `DashboardMockup` | product mockup, container-query scaled | `variant: full\|hero` |
| `ComparisonTable` | them-vs-Bundle | `rows [{left,right}]`, titles |
| `AgentCard` | AI agent card | `icon/name/tagline/does/outputs[]` |
| `FAQ` | accordion | `items [{q, a-as-HTML}]` |
| `CTABand` | dark-green CTA panel, carries the page's one gold CTA | `title` (HTML ok — serif `em`s auto-tint gold), `sub`, labels/hrefs, `note` |
| `LogoCloud` | ecosystem names row | `caption/names/note` (honesty note built in) |
| `WaitlistForm` | email capture | `compact` — stores locally, shows success state |

`ArticleLayout` (in `layouts/`) templates lessons/articles:
`kind/title/description/category/meta/takeaways[]/nextLabel/nextHref` + prose slot.

## Chart rules (short version)

1. Form first: single value → stat tile; ratio vs limit → meter; part-to-whole
   ≤6 → donut; magnitude → bars (one hue); ordered categories → green ramp.
2. Colour by job, palette validated — don't invent hues; 9th category folds
   into "Other". Both palettes below were validated with the dataviz skill's
   `validate_palette.js` against a #FFFFFF surface and pass every check:
   - categorical `#1F7A54 #A8871F #2A6FB0 #C2643C #0E9384 #7A5AA6`
     (worst adjacent CVD ΔE 10.8 protan, normal-vision ΔE 17.8, all ≥ 3:1)
   - ordinal `#95BBA2 #679C7A #3C7455 #21402E` (monotone L, light end 2.12:1)

   Re-run the validator if you change either.
3. Thin marks, 4px rounded data-ends, 2px surface gaps between touching fills,
   hairline solid grid, text in text tokens (never series colours).
4. Legend for ≥2 series; label selectively, never every point.
5. Numbers: proportional figures at display sizes; `tabular-nums` only in
   columns/rows that align.

## Voice checklist for new pages

- Calm, plain-English, UK spelling; quietly confident; zero urgency mechanics.
- Pair every opportunity with risk/illiquidity context.
- AI is assistive/explainable/supervised — never "you should invest".
- Pre-permissions features: "designed to", "where permitted", "subject to FCA
  permissions".
- Keep the risk ribbon + footer band; investment-adjacent pages get an inline
  risk note too.

## Aggregator components

| Component | Use | Key props |
|---|---|---|
| `Ticker` | scrolling market tape (top of market pages) | — reads `src/data/deals.ts` |
| `DealCard` | deal card with price/progress + venue chip | `deal` (Deal), `class`, `style` |

`/deals` is the client-side filterable screener (search + type/venue/sector
filters; seeds from `?q=` and `?type=`; rows anchor by deal id for `#deep-links`).
