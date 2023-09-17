import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  outDir: '../../dist/apps/chromecast-receiver-web',
  integrations: [preact()],
});
