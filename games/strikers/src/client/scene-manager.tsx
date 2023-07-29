import type {
  SnowflakeId,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@explorers-club/schema';
import { SunsetSky } from '@3d/sky';
import { useFrame } from '@react-three/fiber';
import { assertEntitySchema } from '@explorers-club/utils';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useStore } from '@nanostores/react';
import { MapControls, OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import {
  FC,
  createContext,
  useEffect,
  useContext,
  useState,
  useLayoutEffect,
} from 'react';
import { SplashScene } from './scenes/splash-scene';
import { FieldCell } from './components/field-cell';
import { Field } from './components/field';
import { FieldCamera } from './components/field-camera';
import {
  CameraRigContext,
  CameraRigProvider,
} from './components/camera-rig.context';
import { useEntitySelector } from '@hooks/useEntitySelector';

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
      <GameScene />
    </StrikersContext.Provider>
  );
};

const Tile = defineHex({ dimensions: 30 });

const GameScene = () => {
  const [grid] = useState(new Grid(Tile, rectangle({ width: 25, height: 15 })));
  const cells = Array.from(grid).map((cell) => {
    return cell;
  });
  const { gameEntity } = useContext(StrikersContext);
  console.log({ gameEntity });
  const players = useEntitySelector(
    gameEntity,
    (entity) => entity.gameState.players
  );

  return (
    <CameraRigProvider grid={grid}>
      <OpeningSequence />
      {/* <MapControls screenSpacePanning={true} /> */}
      <axesHelper />
      <SunsetSky />
      <Field grid={grid}>
        {players.map((player) => (
          <FieldCell tilePosition={player.tilePosition}>
            <mesh>
              <boxBufferGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={0xcccccc} />
            </mesh>
          </FieldCell>
        ))}
        {/* {cells.map((cell) => (
          <FieldCell key={cell.toString()} tilePosition={[cell.q, cell.r]} />
        ))} */}
      </Field>
    </CameraRigProvider>
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
