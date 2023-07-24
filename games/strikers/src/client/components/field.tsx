import { Grid, defineHex } from 'honeycomb-grid';
import { FC, ReactNode } from 'react';
import type { Hex } from 'honeycomb-grid';
import { FieldContext } from './field.context';

export const Field: FC<{ children?: ReactNode; grid: Grid<Hex> }> = ({
  children,
  grid,
}) => {
  return (
    <FieldContext.Provider value={{ grid }}>
      <mesh position={[-grid.pixelWidth / 2, 0, -grid.pixelHeight / 2]}>
        <axesHelper />
        <planeBufferGeometry
          attach="geometry"
          args={[grid.pixelWidth, grid.pixelHeight]}
        />
        <meshStandardMaterial attach="material" color={0x000000} />
      </mesh>
      {children}
    </FieldContext.Provider>
  );
};
