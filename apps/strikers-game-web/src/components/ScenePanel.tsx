// import { isMainSceneFocusedStore } from '../global/layout';
import { Box } from '@atoms/Box';
import { OrbitControls, useContextBridge } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
// import { GoogleMaps } from './GoogleMaps';
import { LayoutContext } from '@context/LayoutContext';
import { WorldContext } from '@context/WorldProvider';
import { ConnectionContext } from '@context/ApplicationProvider';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { useStore } from '@nanostores/react';
import {
  ChannelContext,
  ChannelProvider,
} from '@organisms/channel/channel.context';
import { useContext } from 'react';
import { StrikersSceneManager } from '../../../../games/strikers/src/client/scene-manager';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';

export const ScenePanel = () => {
  const { isMainPanelFocusedStore } = useContext(LayoutContext);
  const isMainPanelFocused = useStore(isMainPanelFocusedStore);
  // const isMainSceneFocused = useStore(isMainSceneFocusedStore);
  const ContextBridge = useContextBridge(WorldContext, ConnectionContext);

  return (
    <Box
      css={{
        // backgroundImage: "url('/loading.jpg')",
        backgroundSize: 'contain',
        height: isMainPanelFocused ? '20%' : '50%',
        // backgroundPositionX: "center",
        // backgroundPositionY: "center",
        // background: 'yellow',
        // background: "url('/assets/loading.jpg')",
        // flexGrow: isMainSceneFocused ? 0 : 1,
        // flexGrow: 1,
        position: 'relative',
        transition: 'flex-grow 150ms',

        // '@bp2': {
        //   flexGrow: 1,
        //   flexBasis: '70%',
        // },
      }}
    >
      <TopNav />
      <BottomNav />
      <div id="map" style={{ height: '100%' }} />
      <Canvas style={{ position: 'absolute', left: 0, top: 0 }}>
        <ContextBridge>
          <SceneManager />
        </ContextBridge>
      </Canvas>
    </Box>
  );
};

const SceneManager = () => {
  // here we'll manage transitions between games...
  // for now assuem each scene knows if it should
  // render itself or not based off global routeProps

  // right now this is happening in room scene but might need
  // to do it at a channel level
  return (
    <ChannelProvider>
      <ChannelScene />
    </ChannelProvider>
  );
};

const ChannelScene = () => {
  // render a box if there is a game...
  const { roomEntity } = useContext(ChannelContext);
  const currentGameInstanceId = useEntitySelector(
    roomEntity,
    (entity) => entity.currentGameInstanceId
  );

  return currentGameInstanceId ? (
    <StrikersSceneManager gameInstanceId={currentGameInstanceId} />
  ) : (
    <>
      <OrbitControls />
      <mesh position={[0, 0, 0]}>
        <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
        <meshStandardMaterial attach="material" color={0xccffff} />
      </mesh>
    </>
  );
};
