import { SunsetSky } from '@3d/sky';
import type {
  SnowflakeId,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { useStore } from '@nanostores/react';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import {
  FC,
  createContext,
  useContext,
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

const StrikersContext = createContext({
  gameEntity: {} as StrikersGameEntity,
  playerEntity: {} as StrikersPlayerEntity | undefined,
});

const HexTile = defineHex();

export const StrikersSceneManager: FC<{
  gameInstanceId: SnowflakeId;
}> = ({ gameInstanceId }) => {
  const gameEntityStore = useCreateEntityStore<StrikersGameEntity>(
    (entity) => {
      return entity.id === gameInstanceId;
    },
    [gameInstanceId]
  );

  const gameEntity = useStore(gameEntityStore);
  if (!gameEntity) {
    return <></>;
  }

  assertEntitySchema(gameEntity, 'strikers_game');
  const [grid] = useState(
    new Grid(HexTile, rectangle({ width: 26, height: 20 }))
  );

  return (
    <StrikersContext.Provider value={{ gameEntity, playerEntity: undefined }}>
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
  // const cells = Array.from(grid).map((cell) => {
  //   return cell;
  // });
  const { gameEntity } = useContext(StrikersContext);
  // console.log({ gameEntity });
  // const players = useEntitySelector(
  //   gameEntity,
  //   (entity) => entity.states.PlayStatus
  // );

  const currentScene = useEntitySelector(gameEntity, selectCurrentScene);
  console.log({ currentScene });

  return (
    <>
      {currentScene === 'lineup' && <LineupScene />}
      {currentScene === 'game' && <GameScene />}
    </>
  );
};

const LineupScene = () => {
  return (
    <>
      <Field></Field>
    </>
  );
};

const GameScene = () => {
  return (
    <>
      <SunsetSky />
      <OpeningSequence />
      <Field></Field>
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
