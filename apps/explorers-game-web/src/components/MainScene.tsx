// import { isMainSceneFocusedStore } from '../global/layout';
import { Box } from '@atoms/Box';
import { OrbitControls, useContextBridge } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { GoogleMaps } from './GoogleMaps';
import { WorldContext } from '@context/WorldProvider';
import { ConnectionContext } from './ApplicationProvider';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';

export const MainScene = () => {
  // const isMainSceneFocused = useStore(isMainSceneFocusedStore);
  const ContextBridge = useContextBridge(WorldContext, ConnectionContext);

  return (
    <Box
      css={{
        // backgroundImage: "url('/loading.jpg')",
        backgroundSize: 'contain',
        // backgroundPositionX: "center",
        // backgroundPositionY: "center",
        // background: 'yellow',
        // background: "url('/assets/loading.jpg')",
        // flexGrow: isMainSceneFocused ? 0 : 1,
        flexGrow: 1,
        position: 'relative',
        transition: 'flex-grow 150ms',

        '@bp2': {
          flexGrow: 1,
          flexBasis: '70%',
        },
      }}
    >
      <TopNav />
      <BottomNav />
      <div id="map" style={{ height: '100%' }} />
      <Canvas camera={{ far: 2000000000 }}>
        <ContextBridge>
          <GoogleMaps />
          {/* <CafeModel /> */}
          {/* <OrbitControls />
        <CafeModel /> */}
          {/* <Environment preset="sunset" /> */}
        </ContextBridge>
      </Canvas>
    </Box>
  );
};
