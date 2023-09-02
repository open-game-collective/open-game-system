import { SunsetSky } from '@3d/sky';
import { Canvas } from '@react-three/fiber';
import { Meta, StoryObj } from '@storybook/react';
import { Goal } from './goal';
import { Direction, Grid, defineHex, rectangle } from 'honeycomb-grid';
import { useControls } from 'leva';
import { atom } from 'nanostores';
import { useContext, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { CameraRigContext, CameraRigProvider } from './camera-rig.context';
import { Field, FieldControls } from './field';
import { cameraStore } from './field-camera';
import { FieldCell } from './field-cell';
import { useStore } from '@nanostores/react';
import { GridContext } from '../context/grid.context';
import { FieldHex } from '@strikers/lib/field-hex';
import { sheetStore } from '../context/theatre.context';
import { SheetProvider } from '@theatre/r3f';
import { CameraRigControls } from './camera-rig-controls';
import { alphaNumToOffsetCoordiantes } from '@strikers/lib/utils';
import { PlayerMeeple } from './player-meeple';
import { CardMeeple, CardMeepleModel } from './card-meeple';
import { Ball } from './ball';

const gridStore = atom(
  new Grid(
    FieldHex,
    rectangle({ width: 36, height: 26, direction: Direction.E })
  )
);

type Story = StoryObj<typeof Field>;

export default {
  component: Field,
};

export const Default: Story = {
  decorators: [
    (StoryComponent) => {
      return (
        <Canvas
          shadows
          style={{ background: '#eee', aspectRatio: '1' }}
          camera={{ position: new Vector3(0, 1000, 1000) }}
        >
          <SheetProvider sheet={sheetStore.get()}>
            <GridContext.Provider value={gridStore.get()}>
              <CameraRigProvider>
                <FieldControls />
                <CameraRigControls />
                <StoryComponent />
              </CameraRigProvider>
            </GridContext.Provider>
          </SheetProvider>
        </Canvas>
      );
    },
  ],
  render: () => {
    const { cameraControls } = useContext(CameraRigContext);

    useEffect(() => {
      cameraControls.setLookAt(0, 10, 50, 0, 0, -20, true);
    }, [cameraControls]);
    const grid = useStore(gridStore);

    for (const hex of grid) {
      console.log([hex.row, hex.col, hex.q, hex.r]);
    }

    return (
      <>
        <gridHelper />
        <ambientLight />
        <pointLight />
        <Field>
          <FieldCell tilePosition={alphaNumToOffsetCoordiantes('A1')}>
            <CardMeepleModel fieldSide="A" teamSide="home" />
          </FieldCell>
          <FieldCell tilePosition={alphaNumToOffsetCoordiantes('Z36')}>
            <CardMeepleModel fieldSide="B" teamSide="away" />
          </FieldCell>
          <FieldCell tilePosition={alphaNumToOffsetCoordiantes('M18')}>
            <CardMeepleModel fieldSide="A" teamSide="home" />
          </FieldCell>
          <FieldCell tilePosition={alphaNumToOffsetCoordiantes('M18')}>
            <CardMeepleModel fieldSide="B" teamSide="away" />
          </FieldCell>
          <FieldCell tilePosition={alphaNumToOffsetCoordiantes('M18')}>
            <Ball />
          </FieldCell>
          <Goal side="A" />
          <Goal side="B" />
        </Field>
        <SunsetSky />
      </>
    );
  },
};
