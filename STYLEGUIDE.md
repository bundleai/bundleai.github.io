# Bundle.ai design system — component styleguide

Everything themeable lives in `src/styles/global.css` as CSS custom properties.
A public visual summary lives at `/brand`.

## Tokens

| Group | Tokens |
|---|---|
| Surfaces | `--bg` #FBFCFC · `--surface` #FFF · `--tint` #E8F4F6 · `--tint-soft` #F2F8F9 |
| Ink & text | `--ink` #0B2E33 · `--text` #3A4A4D · `--text-2` #5C6F73 · `--faint` #8FA1A4 |
| Hairlines | `--line` #E3EAEB · `--line-2` #D2DEE0 |
| Brand | `--teal` #0D7E8A · `--teal-deep` #0A5E68 · `--teal-soft` #BFDFE4 |
| Status (reserved) | sage `--sage/-ink/-tint` · sand `--sand/-ink/-tint` · red `--red/-ink/-tint` |
| Charts (validated) | categorical `--c1..--c6` · ordinal ramp `--ramp1..--ramp4` · `--chart-track` · `--chart-deemph` |
| Shape | `--r-s` 10px · `--r-m` 16px · `--r-l` 22px · `--r-pill` |
| Depth | `--shadow-s/m/l` (layered, low-opacity) |
| Type | `--font-display` General Sans · `--font-body` Inter · `--font-mono` IBM Plex Mono · `--font-serif` Source Serif 4 (italic accents only) |

**Status colours are reserved** for meaning (good / caution / failure) and always
ship with a label or icon — never as chart series. Chart series use `--c1..c6`
in fixed order (validated for colour-blind adjacency and ≥3:1 contrast on
white); ordered scales (stage, tiers) use the teal ramp.

## Utility classes (global.css)

- Layout: `.container` (+`.narrow`), `.section` (+`.tight`, `.section-tint-full`,
  `.section-ink`), `.split` (+`.wide-left/right`), `.grid .cols-2/3/4`
- Type: `.display`, `.h2`, `.h3`, `.lead`, `.eyebrow` (+`.no-rule`),
  `.serif-aside`, `.muted`, `.small`, `.mono`, `.tabular`, `.center`
- Surfaces: `.card` (+`.card-hover`), `.panel-tint`, `.bg-grid`, `.bg-wash`
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
| `CTABand` | ink CTA panel | `title` (HTML ok — serif ems auto-tint light), `sub`, labels/hrefs, `note` |
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
