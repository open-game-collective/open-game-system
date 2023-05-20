import { useStore } from '@nanostores/react';
import type { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const ModalContainer: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
