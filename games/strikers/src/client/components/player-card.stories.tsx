import { Canvas } from '@react-three/fiber';
import { PlayerCard } from './player-card';

export default {
  component: PlayerCard,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <PlayerCard />
      </Canvas>
    );
  },
};
