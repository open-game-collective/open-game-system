import { StrikersFieldSide, StrikersTeamSide } from '@explorers-club/schema';
import { Text } from '@react-three/drei';
import { FC, ReactNode, useContext } from 'react';
import { StrikersContext } from '../context/strikers.context';
import { useEntitySelector } from '@hooks/useEntitySelector';

export const CardMeeple: FC<{ cardId: string; team: StrikersTeamSide }> = ({
  cardId,
  team,
}) => {
  const { gameEntity } = useContext(StrikersContext);
  const card = gameEntity.config.cardsById[cardId];

  const nameplateText = `${card.abbreviation} #${card.jerseyNum}`;

  const fieldSide = useEntitySelector(
    gameEntity,
    (entity) => (entity.gameState.sideACardIds.includes(cardId) ? 'A' : 'B'),
    [cardId]
  );

  // todo visualize the nameplateText "above" the mesh in this component

  return (
    <group>
      <CardMeepleModel teamSide={team} fieldSide={fieldSide} />
      <CardMeepleNameplate>{nameplateText}</CardMeepleNameplate>
    </group>
  );
};

export const CardMeepleModel: FC<{
  teamSide: StrikersTeamSide;
  fieldSide: StrikersFieldSide;
}> = ({ teamSide, fieldSide }) => {
  return (
    <mesh position={[fieldSide === 'B' ? 0.5 : -0.5, 0, 0]}>
      <cylinderBufferGeometry attach="geometry" args={[0.5, 0.5, 0.5, 6, 1]} />
      <meshBasicMaterial color={teamSide === 'home' ? 'blue' : 'red'} />
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
