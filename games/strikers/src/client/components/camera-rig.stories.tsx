import { SunsetSky } from '@3d/sky';
import { AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { Canvas, Color } from '@react-three/fiber';
import { Grid, defineHex, rectangle, spiral } from 'honeycomb-grid';

import { DecoratorFn } from '@explorers-club/utils';
import { StoryObj } from '@storybook/react';
import { button, buttonGroup, folder, useControls } from 'leva';
import { atom } from 'nanostores';
import { memo, useContext, useEffect } from 'react';
import { MathUtils, Vector3 } from 'three';
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

export default {
  component: CameraRigProvider,
};
type Story = StoryObj<typeof CameraRigProvider>;
type Dectorator = DecoratorFn<typeof CameraRigProvider>;

const gridStore = atom(
  new Grid(defineHex(), rectangle({ width: 36, height: 26 }))
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
            <Controls />
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

export const FocusTile: Story = {
  decorators: [decorator],
  render: () => {
    const { service } = useContext(CameraRigContext);

    // useEffect(() => {
    //   service.send({
    //     type: 'FOCUS_TILE',
    //     tileCoordinate: [5, 5],
    //   });
    // }, [service]);

    return (
      <>
        <Shadows />
        <ambientLight />
        <SunsetSky />
        <GridContext.Provider value={gridStore.get()}>
          <Field />
        </GridContext.Provider>
      </>
    );
  },
};

export const FocusTiles: Story = {
  decorators: [decorator],
  render: () => {
    return (
      <>
        <Shadows />
        <ambientLight />
        <gridHelper />
        <SunsetSky />
        <GridContext.Provider value={gridStore.get()}>
          <Field>
            <Goal side="away" />
            <Goal side="home" />
            <FieldCell tilePosition={[5, 5]}>
              <PlayerBox />
            </FieldCell>
            <FieldCell tilePosition={[6, 6]}>
              <PlayerBox />
            </FieldCell>
            <FieldCell tilePosition={[8, 8]}>
              <PlayerBox />
            </FieldCell>
          </Field>
        </GridContext.Provider>
      </>
    );
  },
};

function PlayerBox() {
  return (
    <mesh>
      <boxGeometry />
      <meshBasicMaterial color={0xf0f0f0} />
    </mesh>
  );
}

function Controls() {
  const { cameraControls, service } = useContext(CameraRigContext);
  const camera = cameraControls.camera;
  const grid = useContext(GridContext);

  useControls({
    headingGrp: buttonGroup({
      label: 'heading',
      opts: {
        '-45º': () => {
          cameraControls.rotate(-45 * DEG2RAD, 0, true);
        },
        '-15º': () => {
          cameraControls.rotate(-15 * DEG2RAD, 0, true);
        },
        '+15º': () => {
          cameraControls.rotate(15 * DEG2RAD, 0, true);
        },
        '+45º': () => {
          cameraControls.rotate(45 * DEG2RAD, 0, true);
        },
      },
    }),
    tiltGrp: buttonGroup({
      label: 'tilt',
      opts: {
        '-20º': () => {
          cameraControls.rotate(0, -20 * DEG2RAD, true);
        },
        '-5º': () => {
          cameraControls.rotate(0, -5 * DEG2RAD, true);
        },
        '+5º': () => {
          cameraControls.rotate(0, 5 * DEG2RAD, true);
        },
        '+20º': () => {
          cameraControls.rotate(0, 20 * DEG2RAD, true);
        },
      },
    }),
    truckGrp: buttonGroup({
      label: 'truck',
      opts: {
        left: () => cameraControls.truck(-1, 0, true),
        right: () => cameraControls.truck(1, 0, true),
        down: () => cameraControls.truck(0, 1, true),
        up: () => cameraControls.truck(0, -1, true),
      },
    }),
    dollyGrp: buttonGroup({
      label: 'dolly',
      opts: {
        forward: () => cameraControls.dolly(1, true),
        back: () => cameraControls.dolly(-1, true),
      },
    }),
    zoomGrp: buttonGroup({
      label: 'zoom',
      opts: {
        '/2': () => cameraControls.zoomTo(camera.zoom / 2, true),
        '+1': () => cameraControls.zoomTo(camera.zoom + 1, true),
        '1.0': () => cameraControls.zoomTo(1, true),
        // '/2': () => cameraControls.zoom(camera.zoom / 2, true),
        // '/-2': () => cameraControls.zoom(-camera.zoom / 2, true),
      },
    }),
    // moveTo: folder(
    //   {
    //     vec1: { value: [3, 5, 2], label: 'vec' },
    //     'moveTo(…vec)': button((get) =>
    //       cameraControls.moveTo(
    //         ...(get('moveTo.vec1') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    // 'fitToBox(mesh)': button(() =>
    //   cameraControls.fitToBox(meshRef.current, true)
    // ),
    grid: folder(
      {
        centerCoord: {
          value: 'A1',
          label: 'center',
          hint: 'Format: [ROW][COL], ROW=A-Z, COL=1-36',
        },
        radius: {
          value: 1,
          label: 'radius',
          hint: 'sets radius of spiral out of center coordinate',
        },
        'focusSphere(coord, radius)': button((get) => {
          const val = get('grid.centerCoord');

          service.send({
            type: 'POSITION',
            target: grid.traverse(
              spiral({
                start: convertStrikersTileCoordinateToRowCol(val),
                radius: get('grid.radius'),
              })
            ),
          });

          // cameraControls.setTarget(
          //   x - grid.pixelWidth / 2,
          //   y,
          //   z - grid.pixelHeight / 2,
          //   false
          // );

          // cameraControls.setLookAt(

          // )

          // console.log(
          //   { sphere, val },
          //   cameraControls.azimuthAngle,
          //   cameraControls.polarAngle
          // );

          // cameraControls.set
          // console.log({ val });
        }),
        'focusGrid()': button((get) => {
          service.send({
            type: 'POSITION',
            target: grid,
          });

          // cameraControls.setTarget(
          //   x - grid.pixelWidth / 2,
          //   y,
          //   z - grid.pixelHeight / 2,
          //   false
          // );

          // cameraControls.setLookAt(

          // )

          // console.log(
          //   { sphere, val },
          //   cameraControls.azimuthAngle,
          //   cameraControls.polarAngle
          // );

          // cameraControls.set
          // console.log({ val });
        }),
      },
      { collapsed: true }
    ),
    // setPosition: folder(
    //   {
    //     vec2: { value: [-5, 2, 1], label: 'vec' },
    //     'setPosition(…vec)': button((get) =>
    //       cameraControls.setPosition(
    //         ...(get('setPosition.vec2') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    // setTarget: folder(
    //   {
    //     vec3: { value: [3, 0, -3], label: 'vec' },
    //     'setTarget(…vec)': button((get) =>
    //       cameraControls.setTarget(
    //         ...(get('setTarget.vec3') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    // setLookAt: folder(
    //   {
    //     vec4: { value: [1, 2, 3], label: 'position' },
    //     vec5: { value: [1, 1, 0], label: 'target' },
    //     'setLookAt(…position, …target)': button((get) =>
    //       cameraControls.setLookAt(
    //         ...(get('setLookAt.vec4') as [number, number, number]),
    //         ...(get('setLookAt.vec5') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    lerpLookAt: folder(
      {
        vec6: { value: [-2, 0, 0], label: 'posA' },
        vec7: { value: [1, 1, 0], label: 'tgtA' },
        vec8: { value: [0, 2, 5], label: 'posB' },
        vec9: { value: [-1, 0, 0], label: 'tgtB' },
        t: { value: Math.random(), label: 't', min: 0, max: 1 },
        'f(…posA,…tgtA,…posB,…tgtB,t)': button((get) => {
          return cameraControls.lerpLookAt(
            ...(get('lerpLookAt.vec6') as [number, number, number]),
            ...(get('lerpLookAt.vec7') as [number, number, number]),
            ...(get('lerpLookAt.vec8') as [number, number, number]),
            ...(get('lerpLookAt.vec9') as [number, number, number]),
            get('lerpLookAt.t'),
            true
          );
        }),
      },
      { collapsed: true }
    ),
    saveState: button(() => cameraControls.saveState()),
    reset: button(() => cameraControls.reset(true)),
    // enabled: { value: true, label: 'controls on' },
    // verticalDragToForward: {
    //   value: false,
    //   label: 'vert. drag to move forward',
    // },
    // dollyToCursor: { value: false, label: 'dolly to cursor' },
    // infinityDolly: { value: false, label: 'infinity dolly' },
  });

  return null;
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

function FitTargetControl() {
  const { service } = useContext(CameraRigContext);

  useControls('targets', {
    FULL_GRID: button(() =>
      service.send({ type: 'POSITION', target: gridStore.get() })
    ),
    A: buttonGroup({
      1: () => service.send({ type: 'POSITION', target: [{ col: 0, row: 0 }] }),
      5: () => service.send({ type: 'POSITION', target: [{ col: 0, row: 5 }] }),
      10: () =>
        service.send({ type: 'POSITION', target: [{ col: 0, row: 10 }] }),
      15: () =>
        service.send({ type: 'POSITION', target: [{ col: 0, row: 15 }] }),
      20: () =>
        service.send({ type: 'POSITION', target: [{ col: 0, row: 19 }] }),
    }),
    M: buttonGroup({
      1: () =>
        service.send({ type: 'POSITION', target: [{ col: 13, row: 0 }] }),
      5: () =>
        service.send({ type: 'POSITION', target: [{ col: 13, row: 5 }] }),
      10: () =>
        service.send({ type: 'POSITION', target: [{ col: 13, row: 10 }] }),
      15: () =>
        service.send({ type: 'POSITION', target: [{ col: 13, row: 15 }] }),
      20: () =>
        service.send({ type: 'POSITION', target: [{ col: 13, row: 19 }] }),
    }),
    Z: buttonGroup({
      1: () =>
        service.send({ type: 'POSITION', target: [{ col: 25, row: 0 }] }),
      5: () =>
        service.send({ type: 'POSITION', target: [{ col: 25, row: 5 }] }),
      10: () =>
        service.send({ type: 'POSITION', target: [{ col: 25, row: 10 }] }),
      15: () =>
        service.send({ type: 'POSITION', target: [{ col: 25, row: 15 }] }),
      20: () =>
        service.send({ type: 'POSITION', target: [{ col: 25, row: 19 }] }),
    }),
  });

  return null;
}

function AnchorControl() {
  const { service } = useContext(CameraRigContext);

  useControls('Anchor', {
    BOT: buttonGroup({
      LEFT: () => service.send({ type: 'POSITION', anchor: 'BOTTOM_LEFT' }),
      CENTER: () => service.send({ type: 'POSITION', anchor: 'BOTTOM_CENTER' }),
      RIGHT: () => service.send({ type: 'POSITION', anchor: 'BOTTOM_RIGHT' }),
    }),
    MID: buttonGroup({
      LEFT: () => service.send({ type: 'POSITION', anchor: 'MIDDLE_LEFT' }),
      CENTER: () => service.send({ type: 'POSITION', anchor: 'MIDDLE_CENTER' }),
      RIGHT: () => service.send({ type: 'POSITION', anchor: 'MIDDLE_RIGHT' }),
    }),
    TOP: buttonGroup({
      LEFT: () => service.send({ type: 'POSITION', anchor: 'TOP_LEFT' }),
      CENTER: () => service.send({ type: 'POSITION', anchor: 'TOP_CENTER' }),
      RIGHT: () => service.send({ type: 'POSITION', anchor: 'TOP_RIGHT' }),
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

function TiltControl() {
  const { service } = useContext(CameraRigContext);

  useControls('Tilt', {
    DOWN: buttonGroup({
      FLOOR: () => service.send({ type: 'POSITION', tilt: 'FLOOR' }),
      SLIGHT: () => service.send({ type: 'POSITION', tilt: 'SLIGHT_TILT' }),
      LOW_DIAG: () => service.send({ type: 'POSITION', tilt: 'LOW_DIAGONAL' }),
    }),
    HORIZONTAL: button(() =>
      service.send({ type: 'POSITION', tilt: 'HORIZONTAL' })
    ),
    UP: buttonGroup({
      SKY: () => service.send({ type: 'POSITION', tilt: 'SKY' }),
      STEEP: () => service.send({ type: 'POSITION', tilt: 'STEEP_TILT' }),
      HIGH_DIAG: () =>
        service.send({ type: 'POSITION', tilt: 'HIGH_DIAGONAL' }),
    }),
  });

  return null;
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
