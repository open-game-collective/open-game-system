import { FC } from 'react';

export const GamePanel: FC<{ slug: string }> = ({ slug }) => {
  return <div>Panel - {slug}</div>;
};
