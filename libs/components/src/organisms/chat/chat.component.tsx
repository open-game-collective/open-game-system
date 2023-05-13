import { FC } from 'react';

export const Chat: FC<{ slug: string }> = ({ slug }) => {
  return <div>Chat - {slug}</div>;
};
