import { SunsetSky } from '@3d/sky';
import { CameraShake, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { OGSModel } from './OGSModel';

export const Scene = () => {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: 'black' }}
      camera={{ position: [0, 0.1, 0.5] }}
    >
      <CameraShake />
      <ambientLight color="orange" intensity={0.2} />
      <pointLight position={[0, 1, 1]} color="aqua" intensity={0.3} />
      <pointLight position={[0, -1, -1]} color="orange" />
      <SunsetSky />
      <OGSModel />
    </Canvas>
  );
};
