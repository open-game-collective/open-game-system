import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  outDir: '../../dist/apps/opengame-org-web',
  integrations: [react()],
  experimental: {
    assets: true,
  },
});
