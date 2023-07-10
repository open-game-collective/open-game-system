import { StrikersTeam } from '@schema/types';
import { FC } from 'react';
interface Props {
  cardId: string;
  team: StrikersTeam;
}

export const PlayerMeeple: FC<Props> = () => {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material" color={0xcc0000} />
    </mesh>
  );
};
