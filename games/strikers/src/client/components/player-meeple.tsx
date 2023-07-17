import { StrikersTeam } from '@schema/types';
import { FC } from 'react';
interface Props {
  cardId: string;
  team: StrikersTeam;
}

export const PlayerMeeple: FC<Props> = ({ cardId, team }) => {
  const color = team === 'away' ? 0xff0000 : 0x0000ff;
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material" color={color} />
    </mesh>
  );
};
