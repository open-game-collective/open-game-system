import { Canvas } from '@react-three/fiber';
import { SplashScene } from './splash-scene';

export default {
  component: SplashScene,
};

export const Default = {
  render: () => {
    return (
      <Canvas>
        <SplashScene />
      </Canvas>
    );
  },
};
