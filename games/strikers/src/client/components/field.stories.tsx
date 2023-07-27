import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { useEffect, useState } from 'react';
import { Field } from './field';
import { FieldCell } from './field-cell';
import { useControls } from 'leva';
import { cameraStore } from './field-camera';
import { CameraRigProvider } from './camera-rig.context';
import { SunsetSky } from '@3d/sky';
import { Vector3 } from 'three';

export default {
  component: Field,
};

const HexTile = defineHex();

export const Default = {
  render: () => {
    const [grid] = useState(
      new Grid(HexTile, rectangle({ width: 25, height: 15 }))
    );

    return (
      <Canvas
        style={{ background: '#eee', aspectRatio: '1' }}
        camera={{ position: new Vector3(0, 100, 50) }}
      >
        <CameraRigProvider grid={grid}>
          <gridHelper />
          <ambientLight />
          <pointLight />
          <Field grid={grid} />
          <SunsetSky />
        </CameraRigProvider>
        {/* <OrthographicCamera
          makeDefault
          zoom={1}
          // todo update top, bot, left, right to put field in frame
          top={50}
          bottom={-50}
          left={50}
          right={-50}
          near={1}
          far={400}
          position={[0, 0, 100]}
          matrixWorldAutoUpdate={undefined}
          getObjectsByProperty={undefined}
        /> */}
      </Canvas>
    );
  },
};

const CenterControl = () => {
  // useControls hook to create center controls
  const { centerX, centerY } = useControls({
    centerX: { value: 0, min: -50, max: 50, label: 'Center X' },
    centerY: { value: 0, min: -50, max: 50, label: 'Center Y' },
  });

  useEffect(() => {
    // Update CameraStore center coordinates whenever center control changes
    cameraStore.setKey('center', [centerX, centerY]);
  }, [centerX, centerY]);

  // Render nothing as this component only updates the store
  return null;
};
