import { Flex } from '@atoms/Flex';
import { Unarray } from '@explorers-club/utils';
import { Decorator, StoryObj } from '@storybook/react';

export const chatDecorator: Decorator<StoryObj<any>> = (StoryComponent) => {
  return (
    <Flex>
      <StoryComponent />;
    </Flex>
  );
};
