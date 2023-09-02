import { StrikersTeamSide } from '@explorers-club/schema';
import { Text } from '@react-three/drei';
import { FC, ReactNode, useContext } from 'react';
import { StrikersContext } from '../context/strikers.context';

export const CardMeeple: FC<{ cardId: string; team: StrikersTeamSide }> = ({
  cardId,
  team,
}) => {
  const { gameEntity } = useContext(StrikersContext);
  const card = gameEntity.config.cardsById[cardId];

  const nameplateText = `${card.abbreviation} #${card.jerseyNum}`;
  // todo visualize the nameplateText "above" the mesh in this component

  return (
    <group>
      <CardMeepleModel team={team} />
      <CardMeepleNameplate>{nameplateText}</CardMeepleNameplate>
    </group>
  );
};

export const CardMeepleModel: FC<{ team: StrikersTeamSide }> = ({ team }) => {
  return (
    <mesh>
      <cylinderBufferGeometry attach="geometry" args={[1, 1, 1, 6, 1]} />
      <meshBasicMaterial color={team === 'home' ? 'blue' : 'red'} />
    </mesh>
  );
};

export const CardMeepleNameplate: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <group position={[0, 1, -1]}>
      <Text
        color="black"
        fontSize={1}
        anchorX="center"
        anchorY="bottom"
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
      >
        {children}
      </Text>
    </group>
  );
};
