// Takeovers.tsx
import React from 'react';
import { useCurrentTakeover } from '@hooks/useCurrentTakeover';
import { Box } from '@atoms/Box';
import { Flex } from '@atoms/Flex';

interface TakeoversProps {
  children: React.ReactElement[];
}

export const Takeovers: React.FC<TakeoversProps> = ({ children }) => {
  const currentTakeover = useCurrentTakeover();

  const childToRender = React.Children.toArray(children).find((child) => {
    return React.isValidElement(child) && child.props.id === currentTakeover;
  }) as React.ReactElement | undefined;

  if (currentTakeover && !childToRender) {
    console.warn(`trying to render '${currentTakeover}' but child not found`);
  }
  console.log({ currentTakeover });

  return currentTakeover ? (
    <Flex
      css={{
        position: 'absolute',
        inset: 0,
        zIndex: '$takeover',
        background: 'rgba(0,0,0,.8)',
      }}
    >
      {childToRender}
    </Flex>
  ) : null;
};
