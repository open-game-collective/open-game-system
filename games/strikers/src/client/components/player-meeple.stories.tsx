import { Canvas } from '@react-three/fiber';
import { PlayerMeeple } from './player-meeple';

export default {
  component: PlayerMeeple,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <PlayerMeeple />
      </Canvas>
    );
  },
};
