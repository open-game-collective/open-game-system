import { SunsetSky } from '@3d/sky';
import { Canvas } from '@react-three/fiber';
import { Meta, StoryObj } from '@storybook/react';
import { Goal } from "./goal";
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { useControls } from 'leva';
import { atom } from 'nanostores';
import { useContext, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { CameraRigContext, CameraRigProvider } from './camera-rig.context';
import { Field } from './field';
import { cameraStore } from './field-camera';
import { FieldCell } from './field-cell';

const gridStore = atom(
  new Grid(defineHex(), rectangle({ width: 26, height: 20 }))
);

type Story = StoryObj<typeof Field>;

export default {
  component: Field,
};

const HexTile = defineHex();

export const Default: Story = {
  decorators: [
    (StoryComponent) => {
      return (
        <Canvas
          shadows
          style={{ background: '#eee', aspectRatio: '1' }}
          camera={{ position: new Vector3(0, 1000, 1000) }}
        >
          <CameraRigProvider grid={gridStore.get()}>
            <StoryComponent />
          </CameraRigProvider>
        </Canvas>
      );
    },
  ],
  render: () => {
    const { cameraControls } = useContext(CameraRigContext);

    useEffect(() => {
      cameraControls.setLookAt(0, 10, 50, 0, 0, -20, true);
    }, [cameraControls]);

    return (
      <>
        <gridHelper />
        <ambientLight />
        <pointLight />
        <Field grid={gridStore.get()}>
          <FieldCell tilePosition={[15, 15]}>
            <mesh>
              <boxBufferGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={0xff0000} />
            </mesh>
          </FieldCell>
          <FieldCell tilePosition={[0, 0]}>
            <mesh>
              <boxBufferGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={0xf0ff00} />
            </mesh>
          </FieldCell>
          <FieldCell tilePosition={[5, 5]}>
            <mesh>
              <boxBufferGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={0xf0ff00} />
            </mesh>
          </FieldCell>
          <Goal side="home" />
          <Goal side="away" />
        </Field>
        <SunsetSky />
      </>
    );
  },
};
