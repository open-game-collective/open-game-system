import { SunsetSky } from '@3d/sky';
import { OrbitControls } from '@react-three/drei';
import { Canvas, MeshProps } from '@react-three/fiber';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { useControls } from 'leva';
import { useEffect, useState } from 'react';
import { Field } from './field';
import { FieldCamera, cameraStore } from './field-camera';

export default {
  component: FieldCamera,
};
const HexTile = defineHex();

export const Default = {
  render: () => {
    const [grid] = useState(
      new Grid(HexTile, rectangle({ width: 26, height: 20 }))
    );

    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <axesHelper size={60} />
        <SunsetSky />
        <ambientLight args={[0x00ff00, 0.5]} />
        <FieldCamera grid={grid} />
        <OrbitControls />
        {/* <MapComponent /> */}
        <Field grid={grid} />
        <ZoomControl />
        <CenterControl />
      </Canvas>
    );
  },
};

// New CenterControl component
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

const ZoomControl = () => {
  // useControls hook to create zoom slider
  const { zoom } = useControls({
    zoom: { value: 10, min: 0, max: 19, label: 'Zoom' },
  });

  useEffect(() => {
    // Update CameraStore zoom level whenever zoom control changes
    cameraStore.setKey('zoom', zoom);
  }, [zoom]);

  // Render nothing as this component only updates the store
  return null;
};

// interface SquareProps extends MeshProps {
//   color: string;
// }

// const MapComponent: React.FC = () => {
//   return (
//     <group>
//       {/* Create a 10x10 grid of squares */}
//       {Array.from({ length: 10 }, (_, i) => i).map((_, i) => {
//         return Array.from({ length: 10 }, (_, j) => j).map((_, j) => (
//           <mesh
//             position={[i - 5, 0, j - 5]} // Position each square in the grid
//             rotation={[-Math.PI / 2, 0, 0]}
//           >
//             <planeBufferGeometry
//               args={[1, 1]} // Each square is 1x1
//               key={`${i}-${j}`}
//             />
//             <meshBasicMaterial
//               attach="material"
//               color={
//                 i % 2 === 0
//                   ? j % 2 === 0
//                     ? 'white'
//                     : 'black'
//                   : j % 2 === 0
//                   ? 'black'
//                   : 'white'
//               }
//             />
//           </mesh>
//         ));
//       })}
//     </group>
//   );
// };
