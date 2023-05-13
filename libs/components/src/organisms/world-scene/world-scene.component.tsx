import { FC } from 'react';

export const WorldScene: FC<{ slug: string }> = ({ slug }) => {
  return <div>World - {slug}</div>;
};
