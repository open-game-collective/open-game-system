import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

export default defineConfig({
  outDir: '../../dist/apps/strikers-game-web',
  output: 'server',
  integrations: [react()],
  adapter: node({
    mode: 'standalone',
  }),
});
