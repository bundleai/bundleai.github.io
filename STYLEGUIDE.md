# Bundle design system — component styleguide

Dark trading-terminal theme (July 2026 pivot: Bundle is an aggregator of
crowdfunding, secondary and pre-IPO deals across third-party venues).
Everything themeable lives in `src/styles/global.css` as CSS custom properties.
A public visual summary lives at `/brand`. Deal/venue demo data lives in
`src/data/deals.ts` (illustrative only — never present as live quotes).

## Tokens

| Group | Tokens |
|---|---|
| Surfaces | `--bg` #070B12 · `--surface` #0D131D · `--tint` #121A28 · `--tint-soft` #0B111A |
| Ink & text | `--ink` #EEF4F8 (near-white) · `--text` #A9B6C2 · `--text-2` #7D8B99 · `--faint` #55636F |
| Hairlines | `--line` #1A2432 · `--line-2` #273549 |
| Brand | `--teal` #1FD2C0 · `--teal-deep` #6CE8DA (hover = brighter) · `--teal-soft` #0F3F42 |
| Market direction | `--up` #16C784 / `--up-tint` · `--down` #F6465D / `--down-tint` — price movement only, never decor |
| Status (reserved) | sage `--sage/-ink/-tint` · sand `--sand/-ink/-tint` · red `--red/-ink/-tint` (tints are translucent) |
| Charts | categorical `--c1..--c6` (brightened for dark) · ordinal ramp `--ramp1..--ramp4` · `--chart-track` · `--chart-deemph` |
| Shape | `--r-s` 8px · `--r-m` 12px · `--r-l` 16px · `--r-pill` (buttons are 10px, not pill) |
| Depth | `--shadow-s/m/l` (layered, low-opacity) |
| Type | `--font-display` General Sans · `--font-body` Inter · `--font-mono` IBM Plex Mono · `--font-serif` Source Serif 4 (italic accents only) |

**Status colours are reserved** for meaning (good / caution / failure) and always
ship with a label or icon — never as chart series. Chart series use `--c1..c6`
in fixed order (same hue order as the old light palette, brightened for
dark surfaces); ordered scales (stage, tiers) use the teal ramp. `--up`/`--down`
belong to prices and deltas exclusively.

## Utility classes (global.css)

- Layout: `.container` (+`.narrow`), `.section` (+`.tight`, `.section-tint-full`,
  `.section-ink`), `.split` (+`.wide-left/right`), `.grid .cols-2/3/4`
- Type: `.display`, `.h2`, `.h3`, `.lead`, `.eyebrow` (+`.no-rule`),
  `.serif-aside`, `.muted`, `.small`, `.mono`, `.tabular`, `.center`
- Surfaces: `.card` (+`.card-hover`), `.panel`, `.panel-tint`, `.bg-grid`, `.bg-wash`
- Market: `.up`/`.down` (price colour), `.px` (mono tabular price), `.live-dot`
  (pulsing green), `.src-chip` (venue chip), `.prog > span` (funding bar),
  `.badge-up`/`.badge-down`
- Buttons: `.btn` + `.btn-primary` / `.btn-ghost` / `.btn-ink`, sizes
  `.btn-lg` / `.btn-sm`, `.text-link` (arrow span: `<span class="arrow">→</span>`)
- Bits: `.badge` (+ `-teal/-sage/-sand/-red/-ink/-line`), `.icon-chip`
  (+ tone classes), `.check-list`, `.step-num`, `.table-wrap > table.table`,
  `.faq`, `.field`, `.prose` (+ `.callout`, `.callout.warn`)
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
| `CTABand` | dark glow CTA panel | `title` (HTML ok — serif ems auto-tint light), `sub`, labels/hrefs, `note` |
| `LogoCloud` | ecosystem names row | `caption/names/note` (honesty note built in) |
| `WaitlistForm` | email capture | `compact` — stores locally, shows success state |

`ArticleLayout` (in `layouts/`) templates lessons/articles:
`kind/title/description/category/meta/takeaways[]/nextLabel/nextHref` + prose slot.

## Chart rules (short version)

1. Form first: single value → stat tile; ratio vs limit → meter; part-to-whole
   ≤6 → donut; magnitude → bars (one hue); ordered categories → teal ramp.
2. Colour by job, palette validated — don't invent hues; 9th category folds
   into "Other".
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
