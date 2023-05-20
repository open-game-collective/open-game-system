import { Flex } from '@atoms/Flex';
import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const MainSceneContainer: FC<Props> = ({ children }) => {
  return (
    <Flex
      justify="center"
      align="center"
      css={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {children}
    </Flex>
  );
  return <div>{children}</div>;
};
