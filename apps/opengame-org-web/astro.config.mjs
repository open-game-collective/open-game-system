import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: '../../dist/apps/opengames-org-web',
  experimental: {
    assets: true,
  },
});
