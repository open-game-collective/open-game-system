import { SunsetSky } from '@3d/sky';
import { AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { Canvas, Color } from '@react-three/fiber';
import { Grid, defineHex, rectangle, spiral } from 'honeycomb-grid';

import { StoryObj } from '@storybook/react';
import { button, buttonGroup, folder, useControls } from 'leva';
import { atom } from 'nanostores';
import { memo, useContext, useEffect } from 'react';
import { MathUtils, Vector3 } from 'three';
import { CameraRigControls } from './camera-rig-controls';
import { GridContext } from '../context/grid.context';
import { Grid as GridHelper } from '@react-three/drei';
import { CameraRigContext, CameraRigProvider } from './camera-rig.context';
import { Field } from './field';
import { FieldCell } from './field-cell';
import { Goal } from './goal';
import { SheetProvider } from '@theatre/r3f';
import { getProject } from '@theatre/core';
import { useSelector } from '@xstate/react';
import { DEG2RAD } from 'three/src/math/MathUtils';
// import { StrikersTileCoordinate } from '@schema/games/strikers';
import { getSphereForHexes } from './camera-rig.utils';
import {
  convertStrikersTileCoordinateToRowCol,
  gridHexToWorldPosition,
  gridPointToWorldPosition,
} from '@strikers/lib/utils';
import { StrikersTileCoordinate } from '@schema/games/strikers';
import { Unarray } from '@explorers-club/utils';
import { FieldHex } from '@strikers/lib/field-hex';

export default {
  component: CameraRigProvider,
};
type Story = StoryObj<typeof CameraRigProvider>;
type DecoratorFn<T> = Unarray<StoryObj<T>['decorators']>;
type Dectorator = DecoratorFn<typeof CameraRigProvider>;

const gridStore = atom(
  new Grid(FieldHex, rectangle({ width: 36, height: 26 }))
);

// const res = Array.from(gridStore.get()).map((hex) => {
//   return [hex.row, hex.col, hex.x, hex.y, hex.center.x, hex.center.y] as const;
// });
// console.log({ res });

const sheetStore = atom(getProject('Demo Project').sheet('Demo Sheet'));

const decorator: Dectorator = (StoryComponent) => {
  return (
    <Canvas
      shadows
      style={{ background: '#eee', aspectRatio: '1' }}
      camera={{ position: new Vector3(0, 1000, 1000) }}
    >
      <axesHelper scale={20} />
      <GridHelper
        infiniteGrid
        matrixWorldAutoUpdate={undefined}
        getObjectsByProperty={undefined}
        getVertexPosition={undefined}
      />
      <SheetProvider sheet={sheetStore.get()}>
        <GridContext.Provider value={gridStore.get()}>
          <CameraRigProvider>
            <TargetSphere />
            <StoryComponent />
            <CameraRigControls />
            <DummyBox coordinate="A1" color="blue" />
            <DummyBox coordinate="Z26" color="red" />
            <DummyBox coordinate="Z36" color="orange" />
          </CameraRigProvider>
        </GridContext.Provider>
      </SheetProvider>
    </Canvas>
  );
};

export const Default: Story = {
  decorators: [decorator],
  render: () => {
    const { cameraControls } = useContext(CameraRigContext);

    useEffect(() => {
      cameraControls.setLookAt(0, 10, 120, 0, 0, -20, true);
    }, [cameraControls]);

    return (
      <>
        <Shadows />
        <ambientLight />
        <axesHelper />
        <SunsetSky />
        <GridContext.Provider value={gridStore.get()}>
          <Field>
            <Goal side="away" />
            <Goal side="home" />
          </Field>
        </GridContext.Provider>
      </>
    );
  },
};

// export const FocusTile: Story = {
//   decorators: [decorator],
//   render: () => {
//     const { service } = useContext(CameraRigContext);

//     // useEffect(() => {
//     //   service.send({
//     //     type: 'FOCUS_TILE',
//     //     tileCoordinate: [5, 5],
//     //   });
//     // }, [service]);

//     return (
//       <>
//         <Shadows />
//         <ambientLight />
//         <SunsetSky />
//         <GridContext.Provider value={gridStore.get()}>
//           <Field />
//         </GridContext.Provider>
//       </>
//     );
//   },
// };

// export const FocusTiles: Story = {
//   decorators: [decorator],
//   render: () => {
//     return (
//       <>
//         <Shadows />
//         <ambientLight />
//         <gridHelper />
//         <SunsetSky />
//         <GridContext.Provider value={gridStore.get()}>
//           <Field>
//             <Goal side="away" />
//             <Goal side="home" />
//             <FieldCell tilePosition={[5, 5]}>
//               <PlayerBox />
//             </FieldCell>
//             <FieldCell tilePosition={[6, 6]}>
//               <PlayerBox />
//             </FieldCell>
//             <FieldCell tilePosition={[8, 8]}>
//               <PlayerBox />
//             </FieldCell>
//           </Field>
//         </GridContext.Provider>
//       </>
//     );
//   },
// };

function PlayerBox() {
  return (
    <mesh>
      <boxGeometry />
      <meshBasicMaterial color={0xf0f0f0} />
    </mesh>
  );
}

function ClearanceControl() {
  const { service } = useContext(CameraRigContext);

  useControls('clearance', {
    NONE: button(() => {
      service.send({
        type: 'POSITION',
        clearance: 'NONE',
      });
    }),
    AMOUNT: buttonGroup({
      MINIMAL: () => {
        service.send({
          type: 'POSITION',
          clearance: 'MINIMAL',
        });
      },
      MODERATE: () => {
        service.send({
          type: 'POSITION',
          clearance: 'MODERATE',
        });
      },
      AMPLE: () => {
        service.send({
          type: 'POSITION',
          clearance: 'AMPLE',
        });
      },
    }),
  });
  return null;
}

function TargetSphere() {
  const { service } = useContext(CameraRigContext);

  const sphere = useSelector(service, (state) => state.context.targetSphere);
  const { showTarget } = useControls('grid', {
    showTarget: true,
  });

  if (!showTarget) {
    return null;
  }

  return (
    <mesh position={sphere.center}>
      <sphereGeometry args={[sphere.radius, 32, 32]} />
      <meshStandardMaterial wireframe color="royalblue" />
    </mesh>
  );
}

const Shadows = memo(() => (
  <AccumulativeShadows
    temporal
    frames={100}
    color="#9d4b4b"
    colorBlend={0.5}
    alphaTest={0.9}
    scale={20}
    matrixWorldAutoUpdate={undefined}
    getObjectsByProperty={undefined}
  >
    <RandomizedLight
      amount={8}
      radius={4}
      position={[5, 5, -10]}
      matrixWorldAutoUpdate={undefined}
      getObjectsByProperty={undefined}
    />
  </AccumulativeShadows>
));

function DummyBox({
  coordinate,
  color,
}: {
  coordinate: StrikersTileCoordinate;
  color?: Color;
}) {
  const gridCoordinate = convertStrikersTileCoordinateToRowCol(coordinate);
  const worldPosition = gridHexToWorldPosition(gridCoordinate, gridStore.get());

  return (
    <mesh position={worldPosition}>
      <boxBufferGeometry />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
