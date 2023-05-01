import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';
import react from '@astrojs/react';

export default defineConfig({
  outDir: '../../dist/apps/explorers-game-web',
  output: 'server',
  integrations: [react()],
  adapter: netlify(),
});
