import { SunsetSky } from '@3d/sky';
import { Text } from '@react-three/drei';
import { StrikersPlayerEntity, StrikersTeamSide } from '@explorers-club/schema';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { FC, useContext, useLayoutEffect } from 'react';
import { Vector3 } from 'three';
import * as cameraUtils from '../camera.utils';
import { CameraRigContext } from '../components/camera-rig.context';
import { Field } from '../components/field';
import { FieldCell } from '../components/field-cell';
import { Goal } from '../components/goal';
import { GridContext } from '../context/grid.context';
import { StrikersContext } from '../context/strikers.context';

export const LineupScene = () => {
  const { playerEntity } = useContext(StrikersContext);
  const grid = useContext(GridContext);

  return (
    <>
      <SunsetSky />
      <LineupSceneCamera initialCameraPosition={new Vector3(0, 10, 120)} />
      <Field>
        <Goal side="A" />
        <Goal side="B" />
        {playerEntity && <MyCardsInFormation playerEntity={playerEntity} />}
      </Field>
    </>
  );
};

const LineupSceneCamera: FC<{
  initialCameraPosition: Vector3;
}> = ({ initialCameraPosition }) => {
  const { cameraControls } = useContext(CameraRigContext);

  useLayoutEffect(() => {
    const { x, y, z } = initialCameraPosition;
    cameraControls.setPosition(x, y, z, false);
    cameraUtils.lookBirdsEye(cameraControls);
  }, [cameraControls]);

  return null;
};

const MyCardsInFormation: FC<{ playerEntity: StrikersPlayerEntity }> = ({
  playerEntity,
}) => {
  const { gameEntity } = useContext(StrikersContext);

  const playerId = useEntitySelector(playerEntity, (entity) => entity.id);
  const userId = useEntitySelector(playerEntity, (entity) => entity.userId);
  const isHomeTeam = useEntitySelector(
    gameEntity,
    (entity) => entity.config.lobbyConfig.p1UserId === userId,
    [userId]
  );
  const playerCardIds = useEntitySelectorDeepEqual(gameEntity, (gameEntity) =>
    gameEntity.config.homeTeamPlayerIds.includes(playerId)
      ? gameEntity.gameState.sideACardIds
      : gameEntity.gameState.sideBCardIds
  );

  const tilePositions = useEntitySelectorDeepEqual(
    gameEntity,
    (gameEntity) => gameEntity.gameState.tilePositionsByCardId
  );

  return (
    <>
      {playerCardIds.map((cardId) => {
        return (
          <FieldCell key={cardId} tilePosition={tilePositions[cardId]}>
            <axesHelper />
            <CardMeeple team={isHomeTeam ? 'home' : 'away'} cardId={cardId} />
          </FieldCell>
        );
      })}
    </>
  );
};

const CardMeeple: FC<{ cardId: string; team: StrikersTeamSide }> = ({
  cardId,
  team,
}) => {
  const { gameEntity } = useContext(StrikersContext);
  const card = gameEntity.config.cardsById[cardId];

  const nameplateText = `${card.abbreviation} #${card.jerseyNum}`;
  // todo visualize the nameplateText "above" the mesh in this component

  return (
    <group>
      <mesh>
        <cylinderBufferGeometry attach="geometry" args={[1, 1, 1, 6, 1]} />
        <meshBasicMaterial color={team === 'home' ? 'blue' : 'red'} />
      </mesh>
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
          {nameplateText}
        </Text>
      </group>
    </group>
  );
};
