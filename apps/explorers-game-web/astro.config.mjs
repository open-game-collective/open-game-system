import { defineConfig } from 'astro/config';
import nodeAdapter from '@astrojs/adapter-node';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server',
  integrations: [react()],
  adapter: nodeAdapter(),
});
