import { Decorator, StoryObj } from '@storybook/react';
import { BottomBarNavigation } from './bottom-bar-navigation.component'; // Adjust the path to where your BottomBarNavigation component is located
import { chatDecorator } from '../__stories';

type Story = StoryObj<typeof BottomBarNavigation>;

export default {
  component: BottomBarNavigation,
};

export const Default = {
  decorators: [chatDecorator],
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    return <BottomBarNavigation />;
  },
} satisfies StoryObj<typeof BottomBarNavigation>;

export const WithDifferentContent = {
  decorators: [chatDecorator],
  render: () => {
    return <BottomBarNavigation></BottomBarNavigation>;
  },
};
