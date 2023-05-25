import { Flex } from '@atoms/Flex';
import { isMainSceneFocusedStore } from '../state/layout';
import { computed } from 'nanostores';
import { useStore } from '@nanostores/react';
import { Box } from '@atoms/Box';
import { Canvas } from '@react-three/fiber';
import { CafeModel } from './Cafe';
import { Environment, OrbitControls } from '@react-three/drei';

export const MainScene = () => {
  const isMainSceneFocused = useStore(isMainSceneFocusedStore);

  return (
    <Box
      css={{
        background: 'yellow',
        flexGrow: isMainSceneFocused ? 0 : 1,
        position: 'relative',
        transition: 'flex-grow 150ms',

        '@bp2': {
          flexGrow: 1,
          flexBasis: '70%',
        },
      }}
    >
      <Canvas camera={{ position: [0, 5, 20] }}>
        <OrbitControls />
        <CafeModel />
        <Environment preset="sunset" />
      </Canvas>
    </Box>
  );
};
