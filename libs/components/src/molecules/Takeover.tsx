import { Box } from '@atoms/Box';
import { FC, ReactNode } from 'react';
import type { CSS } from '../stitches.config';

export const TakeoverFooter: FC<{ children: ReactNode; css?: CSS }> = ({
  children,
  css,
}) => {
  return (
    <Box
      css={{
        ...css,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        zIndex: '200',
      }}
    >
      {children}
    </Box>
  );
};

export const TakeoverContents: FC<{ children: ReactNode; css?: CSS }> = ({
  children,
  css,
}) => {
  return (
    <Box
      css={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        ...css,
      }}
    >
      {children}
    </Box>
  );
};
