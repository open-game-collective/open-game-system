import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const ChatContainer: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
