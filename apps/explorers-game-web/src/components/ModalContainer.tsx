import { useStore } from '@nanostores/react';
import type { FC, ReactNode } from 'react';
import { modalIsOpenStore } from '../state/layout';

interface Props {
  children: ReactNode;
}

export const ModalContainer: FC<Props> = ({ children }) => {
  const modalIsOpen = useStore(modalIsOpenStore);
  return <div>{children}</div>;
};
