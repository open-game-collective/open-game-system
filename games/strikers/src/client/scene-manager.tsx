import { PWAContext } from '@context/PWAContext';
import type {
  SnowflakeId,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { useMyUserId } from '@hooks/useMyUserId';
import { useStore } from '@nanostores/react';
import { FieldHex } from '@strikers/lib/field-hex';
import { Grid, rectangle } from 'honeycomb-grid';
import { FC, useContext, useEffect, useState } from 'react';
import { selectCurrentScene } from '../selectors';
import { CameraRigProvider } from './components/camera-rig.context';
import { GridContext } from './context/grid.context';
import { StrikersContext, StrikersProvider } from './context/strikers.context';
import { LineupScene } from './scenes/lineup-scene';
import { TurnScene } from './scenes/turn-scene';
import { ClientEventProvider } from './context/client-event.context';

export const StrikersSceneManager: FC<{
  gameInstanceId: SnowflakeId;
}> = ({ gameInstanceId }) => {
  const pwaStore = useContext(PWAContext);

  useEffect(() => {
    pwaStore.setKey('forceInstall', true);
  }, [pwaStore]);

  const [grid] = useState(
    new Grid(FieldHex, rectangle({ width: 36, height: 26 }))
  );

  return (
    <GridContext.Provider value={grid}>
      <CameraRigProvider>
        <GameScenes />
      </CameraRigProvider>
    </GridContext.Provider>
  );
};

const GameScenes = () => {
  const { gameEntity } = useContext(StrikersContext);

  const currentScene = useEntitySelector(gameEntity, selectCurrentScene);

  return (
    <ClientEventProvider>
      {currentScene === 'lineup' && <LineupScene />}
      {currentScene === 'turn' && <TurnScene />}
    </ClientEventProvider>
  );
};
