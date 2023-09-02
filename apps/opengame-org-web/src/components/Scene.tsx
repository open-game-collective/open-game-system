import { SunsetSky } from '@3d/sky';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { OGSModel } from './OGSModel';

export const Scene = () => {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: 'black' }}
      camera={{ position: [0, 0, 1] }}
    >
      <OrbitControls />
      <SunsetSky />
      <OGSModel />
    </Canvas>
  );
};
