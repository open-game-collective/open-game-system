import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';
import react from '@astrojs/react';

const dist = new URL('../../dist/apps/explorers-club-game', import.meta.url);

export default defineConfig({
  output: 'server',
  integrations: [react()],
  adapter: netlify({
    dist
  }),
});
