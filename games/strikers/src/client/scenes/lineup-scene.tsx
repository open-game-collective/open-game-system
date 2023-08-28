import { SunsetSky } from '@3d/sky';
import { StrikersPlayerEntity } from '@explorers-club/schema';
import * as cameraUtils from '../camera.utils';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { FC, useContext, useLayoutEffect } from 'react';
import { Vector3 } from 'three';
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
        <Goal side="away" />
        <Goal side="home" />
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
  const playerCardIds = useEntitySelectorDeepEqual(gameEntity, (gameEntity) =>
    gameEntity.config.homeTeamCardIds.includes(playerId)
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
            <mesh>
              // todo use a an extrudeGeometry over the hex points instead?
              <cylinderBufferGeometry
                attach="geometry"
                args={[1, 1, 1, 6, 1]}
              />
              <meshBasicMaterial color={0x0000ff} />
            </mesh>
          </FieldCell>
        );
      })}
    </>
  );
};
