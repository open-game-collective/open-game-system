import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: '../../dist/apps/ogc-lol-web',
  experimental: {
    assets: true,
  },
});
