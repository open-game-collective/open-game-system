import { Canvas } from '@react-three/fiber';
import { Ball } from './ball';
import { OrbitControls } from '@react-three/drei';

export default {
  component: Ball,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <OrbitControls />
        <Ball />
      </Canvas>
    );
  },
};
