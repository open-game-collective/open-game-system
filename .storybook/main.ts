import type { StorybookConfig } from '@storybook/core-common';
export const rootMain: StorybookConfig = {
  addons: ['@storybook/addon-storysource', '@storybook/addon-interactions'],
  features: {
    interactionsDebugger: true // 👈 Enable playback controls
  }
  // webpackFinal: async (config, { configType }) => {
  //   // Make whatever fine-grained changes you need that should apply to all storybook configs

  //   // Return the altered config
  //   return config;
  // },
};

export const framework = {
  name: '@storybook/react-webpack5',
  options: {}
};
export const docs = {
  autodocs: true
};