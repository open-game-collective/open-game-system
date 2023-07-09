import { Canvas } from '@react-three/fiber';
import { Net } from './net';

export default {
  component: Net,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <Net />
      </Canvas>
    );
  },
};
