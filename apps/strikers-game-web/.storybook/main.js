import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { envSchema } from '../src/env.schema';

const env = envSchema.parse(process.env);

const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials'],
  staticDirs: [{ from: '../public', to: '/' }],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      define: {
        'process.env': {
          ...env,
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

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
