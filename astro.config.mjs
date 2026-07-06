import { defineConfig } from 'astro/config';

// Served at the domain root via GitHub Pages (bundleai.github.io) —
// see .github/workflows/deploy.yml. Swap `site` when a custom domain lands.
export default defineConfig({
  site: 'https://bundleai.github.io',
  trailingSlash: 'never',
});
