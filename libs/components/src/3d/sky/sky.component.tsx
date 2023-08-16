import { Sky } from '@react-three/drei';

export const SunsetSky = () => {
  return (
    <Sky
      distance={8000}
      turbidity={24}
      rayleigh={1}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      inclination={0.49}
      azimuth={0.25}
    />
  );
};
