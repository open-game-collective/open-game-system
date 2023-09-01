import { useStore } from '@nanostores/react';
import { Text } from '@react-three/drei';
import { useInterpret } from '@xstate/react';
import { folder, useControls } from 'leva';
import { map } from 'nanostores';
import { ReactNode, useContext } from 'react';
import { DoubleSide } from 'three';
import { GridContext } from '../context/grid.context';
import { CameraRigContext } from './camera-rig.context';
import { FieldCell } from './field-cell';
import { FieldContext, fieldMachine } from './field.context';

export interface FieldState {
  showCoordinates: boolean;
}

export const field$ = map<FieldState>({
  showCoordinates: false,
});

export function Field({ children }: { children?: ReactNode }) {
  const grid = useContext(GridContext);
  const actor = useInterpret(fieldMachine);
  const { showCoordinates } = useStore(field$);

  return (
    <FieldContext.Provider value={{ grid, actor }}>
      <group>
        <mesh rotation-x={-Math.PI / 2}>
          <planeBufferGeometry args={[grid.pixelWidth, grid.pixelHeight]} />
          <meshBasicMaterial side={DoubleSide} color={0x00ff00}>
            {/* <canvasTexture
              ref={textureRef}
              attach="map"
              image={canvasRef.current}
            /> */}
          </meshBasicMaterial>
        </mesh>
        {children}
        {showCoordinates && <FieldCoordinates />}
      </group>
    </FieldContext.Provider>
  );
}

const FieldCoordinates = () => {
  const grid = useContext(GridContext);
  return (
    <>
      {Array.from(grid).map((hex) => {
        return (
          <FieldCell key={hex.toString()} tilePosition={hex}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <Text
                color="black"
                fontSize={0.2}
                anchorX="center"
                anchorY="bottom"
                matrixWorldAutoUpdate={undefined}
                getObjectsByProperty={undefined}
                getVertexPosition={undefined}
              >
                {/* {axialToStrikersTile(hex)} */}
                {rowToLetter(hex.row)} {hex.col}
              </Text>
            </group>
          </FieldCell>
        );
      })}
    </>
  );
};

export const FieldControls = () => {
  useControls({
    field: folder({
      showCoordinates: {
        value: field$.get().showCoordinates,
        onChange: (newValue) => {
          field$.setKey('showCoordinates', newValue);
        },
      },
    }),
  });

  return null;
};

function rowToLetter(n: number): string {
  if (n < 0 || n > 25) {
    throw new Error('Number out of range');
  }
  return String.fromCharCode(65 + n);
}
