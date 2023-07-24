import { Canvas, MeshProps } from '@react-three/fiber';
import { MainCamera } from './main-camera';

export default {
  component: MainCamera,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <MainCamera gridHeight={10} gridWidth={10} />
        <MapComponent />
      </Canvas>
    );
  },
};

interface SquareProps extends MeshProps {
  color: string;
}

const MapComponent: React.FC = () => {
  return (
    <group>
      {/* Create a 10x10 grid of squares */}
      {Array.from({ length: 10 }, (_, i) => i).map((_, i) => {
        return Array.from({ length: 10 }, (_, j) => j).map((_, j) => (
          <mesh
            position={[i - 5, 0, j - 5]} // Position each square in the grid
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeBufferGeometry
              args={[1, 1]} // Each square is 1x1
              key={`${i}-${j}`}
            />
            <meshBasicMaterial
              attach="material"
              color={
                i % 2 === 0
                  ? j % 2 === 0
                    ? 'white'
                    : 'black'
                  : j % 2 === 0
                  ? 'black'
                  : 'white'
              }
            />
          </mesh>
        ));
      })}
    </group>
  );
};
