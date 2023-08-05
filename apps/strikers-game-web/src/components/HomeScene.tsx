import { SunsetSky } from '@3d/sky';
import { useStore } from '@nanostores/react';
import { Canvas } from '@react-three/fiber';
import {
  CameraRigContext,
  CameraRigProvider,
} from '@strikers/client/components/camera-rig.context';
import { Field } from '@strikers/client/components/field';
import { Goal } from '@strikers/client/components/goal';
import { getProject } from '@theatre/core';
import { SheetProvider } from '@theatre/r3f';
import extension from '@theatre/r3f/dist/extension';
import studio from '@theatre/studio';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { atom } from 'nanostores';
import { useContext, useEffect } from 'react';
import { Vector3 } from 'three';

studio.initialize();
studio.extend(extension);

const demoSheet = getProject('Demo Project').sheet('Demo Sheet');

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
      <SheetProvider sheet={demoSheet}>
        <CameraRigProvider grid={grid}>
          {/* <PerspectiveCamera
          attachArray={undefined}
          attachObject={undefined}
          attachFns={undefined}
          theatreKey={'Camera'}
        /> */}
          <AnimationSequence />
          <SunsetSky />
          <Field grid={grid}>
            <Goal side="home" />
            <Goal side="away" />
          </Field>
        </CameraRigProvider>
      </SheetProvider>
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
