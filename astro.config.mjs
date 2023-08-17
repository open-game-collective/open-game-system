import { defineConfig } from 'astro/config';
import node from "@astrojs/node";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  integrations: [partytown()]
});