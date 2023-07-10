import { Canvas } from '@react-three/fiber';
import { Dice } from './dice';
import { OrbitControls } from '@react-three/drei';

export default {
  component: Dice,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <OrbitControls />
        <Dice />
      </Canvas>
    );
  },
};
