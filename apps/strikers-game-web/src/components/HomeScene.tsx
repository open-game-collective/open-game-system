import { SunsetSky } from '@3d/sky';
import { useStore } from '@nanostores/react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  CameraRigContext,
  CameraRigProvider,
} from '@strikers/client/components/camera-rig.context';
import { Field } from '@strikers/client/components/field';
import { Goal } from '@strikers/client/components/goal';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { atom } from 'nanostores';
import { useContext, useEffect } from 'react';
import { Vector3 } from 'three';

const gridStore = atom(
  new Grid(defineHex(), rectangle({ width: 26, height: 20 }))
);

export const HomeScene = () => {
  const grid = useStore(gridStore);

  return (
    <Canvas
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
      }}
      camera={{ position: new Vector3(0, 1000, 1000) }}
    >
      <CameraRigProvider grid={grid}>
        <AnimationSequence />
        <SunsetSky />
        <Field grid={grid}>
          <Goal side="home" />
          <Goal side="away" />
        </Field>
      </CameraRigProvider>
    </Canvas>
  );
};

const AnimationSequence = () => {
  const { cameraControls } = useContext(CameraRigContext);

  useEffect(() => {
    cameraControls.setPosition(0, 100, 0, false);
    cameraControls.setLookAt(0, 10, 120, 0, 0, -20, true);
  }, [cameraControls]);

  return null;
};
