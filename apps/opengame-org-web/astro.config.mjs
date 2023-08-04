import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: '../../dist/apps/opengame-org-web',
  experimental: {
    assets: true,
  },
});
