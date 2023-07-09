import { BoardCoordinatesSchema } from '@schema/games/strikers';
import { FC, ReactNode } from 'react';
import { z } from 'zod';

interface Props {
  tilePosition: z.infer<typeof BoardCoordinatesSchema>;
  children: ReactNode;
}

export const FieldCell: FC<Props> = ({ children }) => {
  // todo calc position...
  return <group>{children}</group>;
};
