import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// import { envSchema } from '../src/env.schema';

// import { z } from 'zod';

// export const envSchema = z.object({
//   PUBLIC_API_HTTP_SERVER_URL: z.string(),
//   PUBLIC_API_WS_SERVER_URL: z.string(),
//   PUBLIC_STRIKERS_GAME_WEB_URL: z.string(),
// });

// const env = envSchema.parse(process.env);

const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: [{ from: '../src/assets', to: '/assets' }],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      define: {
        'process.env': {
          // ...env,
        },
      },
      plugins: [
        tsconfigPaths({
          projects: ['../../tsconfig.base.json'],
        }),
      ],
    });
  },
};

export default config;
