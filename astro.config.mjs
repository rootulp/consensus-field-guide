import { defineConfig } from 'astro/config';

export default defineConfig({
  // Preserve word boundaries around inline emphasis and links in multiline prose.
  compressHTML: false,
});
