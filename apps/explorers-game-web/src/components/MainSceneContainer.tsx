import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const MainSceneContainer: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
