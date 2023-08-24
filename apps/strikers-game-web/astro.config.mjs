import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  outDir: '../../dist/apps/strikers-game-web',
  output: 'server',
  integrations: [
    react(),
    AstroPWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  adapter: node({
    mode: 'standalone',
  }),
});
