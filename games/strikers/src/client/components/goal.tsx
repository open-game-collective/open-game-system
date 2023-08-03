import { FC, useContext } from 'react';

import { defaultHexSettings, HexSettings } from 'honeycomb-grid';
import { FieldContext } from './field.context';

export const Goal: FC<{ side: 'home' | 'away' }> = ({ side }) => {
  const { grid } = useContext(FieldContext);
  const xPos = (grid.pixelWidth / 2) * (side === 'home' ? 1 : -1);

  return (
    <mesh position={[xPos, 0, 0]}>
      <boxBufferGeometry args={[1, 3, 5]} />
      <meshBasicMaterial color={0xffffff} />
    </mesh>
  );
};
