import { Canvas } from '@react-three/fiber';
import { PlayerMeeple } from './player-meeple';
import { OrbitControls } from '@react-three/drei';

export default {
  component: PlayerMeeple,
};

export const HomeMeeple = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <OrbitControls />
        <ambientLight />
        <PlayerMeeple team={'A'} />
      </Canvas>
    );
  },
};

export const AwayMeeple = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <OrbitControls />
        <ambientLight />
        <PlayerMeeple team={'B'} />
      </Canvas>
    );
  },
};
