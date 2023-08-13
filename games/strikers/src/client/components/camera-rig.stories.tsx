import { SunsetSky } from '@3d/sky';
import { AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { useSelector } from '@xstate/react';

import { StoryObj } from '@storybook/react';
import { useControls } from 'leva';
import { atom } from 'nanostores';
import { memo, useContext, useEffect, useMemo, useRef } from 'react';
import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Vector3,
} from 'three';
import { CameraRigContext, CameraRigProvider } from './camera-rig.context';
import { Field } from './field';
import { GridContext } from '../context/grid.context';
import { DecoratorFn, Unarray } from '@explorers-club/utils';

export default {
  component: CameraRigProvider,
};
type Story = StoryObj<typeof CameraRigProvider>;
type Dectorator = DecoratorFn<typeof CameraRigProvider>;

const gridStore = atom(
  new Grid(defineHex(), rectangle({ width: 26, height: 20 }))
);

const decorator: Dectorator = (StoryComponent) => {
  return (
    <Canvas
      shadows
      style={{ background: '#eee', aspectRatio: '1' }}
      camera={{ position: new Vector3(0, 1000, 1000) }}
    >
      <GridContext.Provider value={gridStore.get()}>
        <CameraRigProvider>
          <StoryComponent />
        </CameraRigProvider>
      </GridContext.Provider>
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
        <gridHelper />
        <axesHelper />
        <SunsetSky />
        <GridContext.Provider value={gridStore.get()}>
          <Field />
        </GridContext.Provider>
      </>
    );
  },
};

export const FocusTile: Story = {
  decorators: [decorator],
  render: () => {
    const { service } = useContext(CameraRigContext);
    const box3 = useSelector(service, (state) => state.context.targetBox);

    useEffect(() => {
      // cameraControls.setLookAt(0, 10, 120, 0, 0, -20, true);
      console.log('send');
      service.send({
        type: 'FOCUS_TILE',
        tileCoordinate: [5, 5],
      });
    }, [service]);

    return (
      <>
        <Shadows />
        <BoundingBox box={box3} />
        <ambientLight />
        <gridHelper />
        <axesHelper />
        <SunsetSky />
        <GridContext.Provider value={gridStore.get()}>
          <Field />
        </GridContext.Provider>
      </>
    );
  },
};

function BoundingBox({ box }: { box: Box3 }) {
  const { scene } = useThree();
  const lineSegments = useMemo(() => {
    // Create a box geometry from the Box3 dimensions
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    geometry.translate(center.x, center.y, center.z);

    // Generate edges from the geometry
    const edges = new EdgesGeometry(geometry);
    const material = new LineBasicMaterial({ color: 'red' });
    const segments = new LineSegments(edges, material);

    scene.add(segments);

    // Cleanup on unmount
    return () => {
      scene.remove(segments);
      material.dispose();
      edges.dispose();
      geometry.dispose();
    };
  }, [box, scene]);

  useFrame(() => {
    // Update your LineSegments if necessary
  });

  return null; // Render nothing as we've directly added the LineSegments to the scene.
}

function ZoomControl() {
  // const cameraStore = useContext(CameraRigContext);
  const { zoom } = useControls({
    zoom: { value: 10, min: 2, max: 19, label: 'Zoom' },
  });

  // Normalize zoom to a value between 0 and 1
  const normalizedZoom = zoom / 19;

  // Calculate tilt based on zoom
  const maxTiltDeg = 85;
  const tilt = lerp(maxTiltDeg, 0, normalizedZoom);

  // useEffect(() => {
  //   cameraStore.setKey('zoom', zoom);
  //   cameraStore.setKey('tilt', tilt);
  // }, [zoom, cameraStore]);

  // Render nothing as this component only updates the store
  return null;
}

function TiltControl() {
  const cameraStore = useContext(CameraRigContext);
  const { tilt } = useControls({
    tilt: { value: 45, min: 0, max: 180, label: 'Tilt' },
  });

  // useEffect(() => {
  //   cameraStore.setKey('tilt', tilt);
  // }, [tilt, cameraStore]);

  // Render nothing as this component only updates the store
  return null;
}
function HeadingControl() {
  const cameraStore = useContext(CameraRigContext);
  const { heading } = useControls({
    heading: { value: 0, min: 0, max: 360, label: 'Heading' },
  });

  // useEffect(() => {
  //   cameraStore.setKey('heading', heading);
  // }, [heading, cameraStore]);

  // Render nothing as this component only updates the store
  return null;
}

function ScaleFactorControl() {
  const cameraStore = useContext(CameraRigContext);
  const { scaleFactor } = useControls({
    scaleFactor: { value: 3, min: 1, max: 10, label: 'Scale Factor' },
  });

  // useEffect(() => {
  //   cameraStore.setKey('scaleFactor', scaleFactor);
  // }, [scaleFactor, cameraStore]);

  // Render nothing as this component only updates the store
  return null;
}

function CenterControls() {
  const cameraStore = useContext(CameraRigContext);
  const { centerRow, centerColumn } = useControls({
    centerRow: { value: 10, min: 1, max: 20, label: 'Hex Row' },
    centerColumn: { value: 13, min: 1, max: 26, label: 'Hex Column' },
  });

  // useEffect(() => {
  //   cameraStore.setKey('center', [centerRow, centerColumn]);
  // }, [centerRow, centerColumn, cameraStore]);

  // Render nothing as this component only updates the store
  return null;
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
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
