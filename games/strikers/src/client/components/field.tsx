import { useInterpret } from '@xstate/react';
import { ReactNode, useContext } from 'react';
import { DoubleSide } from 'three';
import { GridContext } from '../context/grid.context';
import { FieldContext, fieldMachine } from './field.context';
import { ClientEventContext } from '../context/client-event.context';

export function Field({ children }: { children?: ReactNode }) {
  const grid = useContext(GridContext);
  const actor = useInterpret(fieldMachine);
  const send = useContext(ClientEventContext)

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
      </group>
    </FieldContext.Provider>
  );
}
