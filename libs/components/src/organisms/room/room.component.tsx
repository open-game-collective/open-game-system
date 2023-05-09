import { enablePatches } from 'immer';
import { FC } from 'react';
enablePatches();

export const Room: FC<{ slug: string }> = ({ slug }) => {
  const handlePressButton = () => {
    console.log('ress');
  };

  return <button onClick={handlePressButton}>{slug}</button>;
};
