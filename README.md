# Bundle.ai — marketing & product website

Production-quality marketing site for **Bundle.ai**, the UK's portfolio-first,
FCA-conscious startup investing platform. Built with [Astro](https://astro.build)
as a fully static, component-driven site — light mode, calm, institutional-modern.

**Live:** https://bundleai.github.io — deployed automatically from `main` by
`.github/workflows/deploy.yml` (GitHub Pages, Actions build).

## Run it

```bash
npm install
npm run dev        # http://localhost:4321 with hot reload
npm run build      # static output → dist/
npm run preview    # serve the built site
```

## Structure

```
src/
  styles/global.css        Design tokens + base + utility classes (the system)
  layouts/
    BaseLayout.astro       Head/SEO, fonts, risk ribbon, nav, footer, JS (reveal,
                           counters, tabs)
    ArticleLayout.astro    Reusable template for Academy lessons & Insights posts
  components/              The component system (see STYLEGUIDE.md)
  pages/                   One file per route (21 routes)
public/
  brand/                   Logo mark, mono mark, lockup, app icon (SVG)
  favicon.svg
scripts/
  shoot.mjs                QA screenshots via system Chrome (playwright-core)
  interact.mjs             Interaction QA (menus, meter, quiz, forms)
```

## Pages

Home · For Investors · For Founders · How it works · Secondary Market ·
SPVs & Pre-IPO Funds · The AI Engine · Portfolio Intelligence · Academy
(+ lesson template) · Insights (+ article template) · Pricing · Trust & Safety ·
About · Waitlist · Login · Contact · Careers · Brand · Risk warnings · Privacy ·
Terms · 404

## Conventions

- **Tokens first.** Colours, radii, shadows, type all come from CSS custom
  properties in `global.css`. New components use tokens, never raw hex
  (chart hexes are the validated exception, documented in the styleguide).
- **Copy voice.** Calm, plain-English, UK spelling. Never promissory language;
  opportunity is always paired with risk/illiquidity context. Forward-looking
  features use "designed to / where permitted / subject to FCA permissions."
- **Charts** follow the dataviz rules in `STYLEGUIDE.md` — the categorical and
  ordinal palettes are CVD-validated; don't improvise chart colours.
- **Every page** carries the risk ribbon (BaseLayout) and the footer risk band.

## QA screenshots

```bash
npm run preview &
node scripts/shoot.mjs /pricing pricing --full          # full-page desktop
node scripts/shoot.mjs / hero --mobile                  # mobile viewport
node scripts/shoot.mjs /founders cta --sel=".cta-band"  # scroll to element
node scripts/interact.mjs                               # interactive states
```

Screenshots land in `/tmp/bundle-shots/`. Requires Google Chrome installed
(no browser download — playwright-core drives the system Chrome).
