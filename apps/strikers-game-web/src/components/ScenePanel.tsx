// import { isMainSceneFocusedStore } from '../global/layout';

import { Box } from '@atoms/Box';
import { Flex } from '@atoms/Flex';
import { SheetProvider } from '@theatre/r3f';

import { OrbitControls, useContextBridge } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
// import { GoogleMaps } from './GoogleMaps';
import { LayoutContext } from '@context/LayoutContext';
import { WorldContext } from '@context/WorldProvider';
import { ConnectionContext } from '@context/ApplicationProvider';
import { useCurrentGameInstanceId } from '@hooks/useCurrentGameInstanceId';
import { useStore } from '@nanostores/react';
import {
  ChannelContext,
  ChannelProvider,
} from '@organisms/channel/channel.context';
import { useContext } from 'react';
import { StrikersSceneManager } from '../../../../games/strikers/src/client/scene-manager';
import { BottomBarNavigation } from '../../../../games/strikers/src/client/components/ui/bottom-bar-navigation.component';
import { TopBarNavigation } from '../../../../games/strikers/src/client/components/ui/top-bar-navigation.component';
// import { BottomNav } from './BottomNav';
// import { TopNav } from './TopNav';
import { getProject } from '@theatre/core';
import { DotFilledIcon, DotIcon } from '@radix-ui/react-icons';
import { SunsetSky } from '@3d/sky';
import { useCurrentChannelEntityStore } from '@hooks/useCurrentChannelEntityStore';
import { StrikersProvider } from '@strikers/client/context/strikers.context';

const state = {
  sheetsById: {},
  definitionVersion: '0.4.0',
  revisionHistory: ['Tiv5mLLJzgHUMkcw'],
};

const sheet = getProject('Demo Project', { state }).sheet('Demo Sheet');

export const ScenePanel = () => {
  const { isMainPanelFocusedStore } = useContext(LayoutContext);
  const isMainPanelFocused = useStore(isMainPanelFocusedStore);
  // const isMainSceneFocused = useStore(isMainSceneFocusedStore);
  const ContextBridge = useContextBridge(WorldContext, ConnectionContext);

  return (
    <ChannelProvider>
      <Box
        css={{
          backgroundSize: 'contain',
          height: isMainPanelFocused ? '20%' : '50%',
          position: 'relative',
          transition: 'flex-grow 150ms',
        }}
      >
        <TopBarNavigation />
        <BottomBarNavigation />
        <div id="map" style={{ height: '100%' }} />
        <Canvas style={{ position: 'absolute', left: 0, top: 0 }}>
          <SheetProvider sheet={sheet}>
            <ContextBridge>
              <ChannelScene />
            </ContextBridge>
          </SheetProvider>
        </Canvas>
      </Box>
    </ChannelProvider>
  );
};

const Scoreboard = () => {
  return (
    <Flex
      direction="row"
      css={{
        background: 'white',
        borderRadius: '$3',
        flex: 1,
        justifyContent: 'space-evenly',
      }}
    >
      <Flex direction="column" align="center">
        <Box>Jon</Box>
        <Box>1</Box>
      </Flex>
      <Flex direction="column" align="center">
        <Box>First Half</Box>
        <Box>26'</Box>
      </Flex>
      <Flex direction="column" align="center">
        <Box>James</Box>
        <Box>0</Box>
      </Flex>
    </Flex>
  );
};

// const SceneManager = () => {
//   // here we'll manage transitions between games...
//   // for now assuem each scene knows if it should
//   // render itself or not based off global routeProps

//   // right now this is happening in room scene but might need
//   // to do it at a channel level
//   return (
//     </ChannelProvider>
//   );
// };

const ChannelScene = () => {
  const currentGameInstanceId = useCurrentGameInstanceId();

  return currentGameInstanceId ? (
    <StrikersProvider gameInstanceId={currentGameInstanceId}>
      <StrikersSceneManager gameInstanceId={currentGameInstanceId} />
    </StrikersProvider>
  ) : (
    <>
      <SunsetSky />
      <OrbitControls />
    </>
  );
};
