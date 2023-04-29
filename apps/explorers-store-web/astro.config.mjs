import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  outDir: '../../dist/apps/explorers-store-web',
  integrations: [react()],
});
