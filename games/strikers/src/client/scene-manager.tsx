import { SunsetSky } from '@3d/sky';
import { PWAContext } from '@context/PWAContext';
import type {
  SnowflakeId,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { useStore } from '@nanostores/react';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import {
  FC,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { selectCurrentScene } from '../selectors';
import {
  CameraRigContext,
  CameraRigProvider,
} from './components/camera-rig.context';
import { Field } from './components/field';
import { GridContext } from './context/grid.context';
import { Vector3 } from 'three';
import { useMyUserId } from '@hooks/userCurrentUserId';
import { FieldCell } from './components/field-cell';
import { Goal } from './components/goal';
import { Box, Environment } from '@react-three/drei';

const StrikersContext = createContext({
  gameEntity: {} as StrikersGameEntity,
  playerEntity: {} as StrikersPlayerEntity | null,
});

const HexTile = defineHex();

export const StrikersSceneManager: FC<{
  gameInstanceId: SnowflakeId;
}> = ({ gameInstanceId }) => {
  const pwaStore = useContext(PWAContext);
  // pwaStore.

  useEffect(() => {
    pwaStore.setKey('forceInstall', true);
  }, [pwaStore]);

  const currentUserId = useMyUserId();
  const gameEntityStore = useCreateEntityStore<StrikersGameEntity>(
    (entity) => {
      return entity.id === gameInstanceId;
    },
    [gameInstanceId]
  );
  const playerEntityStore = useCreateEntityStore<StrikersPlayerEntity>(
    (entity) => {
      return (
        entity.schema === 'strikers_player' && entity.userId === currentUserId
      );
    },
    [currentUserId]
  );

  const gameEntity = useStore(gameEntityStore);
  const playerEntity = useStore(playerEntityStore);
  if (!gameEntity) {
    return <></>;
  }

  assertEntitySchema(gameEntity, 'strikers_game');
  const [grid] = useState(
    new Grid(HexTile, rectangle({ width: 36, height: 26 }))
  );

  return (
    <StrikersContext.Provider value={{ gameEntity, playerEntity }}>
      <GridContext.Provider value={grid}>
        <CameraRigProvider>
          <GameScenes />
        </CameraRigProvider>
      </GridContext.Provider>
    </StrikersContext.Provider>
  );
};

const Tile = defineHex({ dimensions: 30 });

const GameScenes = () => {
  const { gameEntity } = useContext(StrikersContext);

  const currentScene = useEntitySelector(gameEntity, selectCurrentScene);

  return (
    <>
      {currentScene === 'lineup' && <LineupScene />}
      {currentScene === 'game' && <GameScene />}
    </>
  );
};

const LineupScene = () => {
  const { playerEntity } = useContext(StrikersContext);
  const grid = useContext(GridContext);

  return (
    <>
      <SunsetSky />
      <LineupSceneCamera initialCameraPosition={new Vector3(0, 10, 120)} />
      <Field>
        <Goal side="away" />
        <Goal side="home" />
        {Array.from(grid).map((hex) => {
          return (
            <FieldCell key={hex.toString()} tilePosition={[hex.q, hex.r]}>
              <mesh>
                // todo use a an extrudeGeometry over the hex points instead?
                <cylinderBufferGeometry
                  attach="geometry"
                  args={[1, 1, 0.1, 6, 1]}
                />
                <meshBasicMaterial color={0xffffff} />
              </mesh>
            </FieldCell>
          );
        })}
        {playerEntity && <MyCardsInFormation playerEntity={playerEntity} />}
      </Field>
    </>
  );
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

const LineupSceneCamera: FC<{
  initialCameraPosition: Vector3;
}> = ({ initialCameraPosition }) => {
  const { gameEntity } = useContext(StrikersContext);

  const { cameraControls } = useContext(CameraRigContext);

  useLayoutEffect(() => {
    const { x, y, z } = initialCameraPosition;
    cameraControls.setPosition(x, y, z, false);
    cameraControls.setLookAt(0, 30, 0, 0, 0, 0, true);
  }, [cameraControls]);

  return null;
};

const GameScene = () => {
  const { gameEntity } = useContext(StrikersContext);
  const tilePositionsByCardId = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.tilePositionsByCardId
  );
  const homeSideCardIds = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.sideACardIds
  );
  const awaySideCardIds = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.sideBCardIds
  );

  return (
    <>
      <SunsetSky />
      <OpeningSequence />
      <Field>
        <Goal side="away" />
        <Goal side="home" />
        {homeSideCardIds.map((cardId) => (
          <FieldCell key={cardId} tilePosition={tilePositionsByCardId[cardId]}>
            <mesh>
              <boxBufferGeometry />
              <meshBasicMaterial color="blue" />
            </mesh>
          </FieldCell>
        ))}
        {awaySideCardIds.map((cardId) => (
          <FieldCell key={cardId} tilePosition={tilePositionsByCardId[cardId]}>
            <mesh>
              <boxBufferGeometry />
              <meshBasicMaterial color="red" />
            </mesh>
          </FieldCell>
        ))}
      </Field>
    </>
  );
};

const OpeningSequence = () => {
  const { cameraControls } = useContext(CameraRigContext);
  useLayoutEffect(() => {
    cameraControls.setPosition(0, 100, 0, false);
    cameraControls.setLookAt(0, 10, 120, 0, 0, -20, true);
  }, [cameraControls]);

  return null;
};
