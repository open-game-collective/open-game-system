import { SunsetSky } from '@3d/sky';
import { AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';

import { useControls } from 'leva';
import { memo, useContext, useState } from 'react';
import { CameraRig } from './camera-rig';
import { CameraRigContext, CameraRigProvider } from './camera-rig.context';
import { Field } from './field';

export default {
  component: CameraRig,
};

export const Default = () => {
  const [grid] = useState(
    new Grid(defineHex(), rectangle({ width: 26, height: 20 }))
  );

  return (
    <Canvas
      shadows
      style={{ background: '#eee', aspectRatio: '1' }}
      camera={{ position: [0, 100, 0] }}
    >
      <CameraRigProvider grid={grid}>
        <Shadows />
        <ambientLight />
        <gridHelper />
        <axesHelper />
        <Field grid={grid} />
        {/* <ZoomControl />
        <TiltControl />
        <HeadingControl />
        <ScaleFactorControl />
        <CenterControls /> */}
        <SunsetSky />
      </CameraRigProvider>
    </Canvas>
  );
};

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
