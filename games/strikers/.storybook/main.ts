import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

const config: StorybookConfig = {
  stories: ['../src/client/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials'],
  async viteFinal(config) {
    if (config.resolve?.alias) {
      config.resolve.alias = {
        ...config.resolve.alias,
        util: 'rollup-plugin-node-polyfills/polyfills/util',
      };
    }
    return mergeConfig(config, {
      plugins: [
        tsconfigPaths({
          projects: ['../../tsconfig.base.json'],
        }),
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    });
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
