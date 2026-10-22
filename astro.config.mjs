import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rootulp.github.io',
  base: process.env.BASE_PATH || '/',
  // Preserve word boundaries around inline emphasis and links in multiline prose.
  compressHTML: false,
});
