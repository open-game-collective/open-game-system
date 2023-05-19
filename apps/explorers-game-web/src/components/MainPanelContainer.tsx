import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const MainPanelContainer: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
