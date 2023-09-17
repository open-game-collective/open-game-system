import { StrikersFieldSide } from '@schema/types';
import { FC } from 'react';
interface Props {
  // cardId: string;
  team: StrikersFieldSide;
}

export const PlayerMeeple: FC<Props> = ({ team }) => {
  const color = team === 'A' ? 0xff0000 : 0x0000ff;
  return (
    <mesh position={[team === 'A' ? 0.5 : -0.5, 0, 0]}>
      <boxBufferGeometry attach="geometry" args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial attach="material" color={color} />
    </mesh>
  );
};
