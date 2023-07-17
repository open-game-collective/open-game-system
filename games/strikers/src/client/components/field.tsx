import { Grid, defineHex } from 'honeycomb-grid';
import { FC, ReactNode } from 'react';
import type { Hex } from 'honeycomb-grid';
import { FieldContext } from './field.context';

export const Field: FC<{ children?: ReactNode; grid: Grid<Hex> }> = ({
  children,
  grid,
}) => {
  console.log(grid.pixelWidth, grid.pixelHeight);
  return (
    <FieldContext.Provider value={{ grid }}>
      <mesh position={[-grid.pixelWidth / 2, 0, -grid.pixelHeight / 2]}>
        <axesHelper />
        <planeBufferGeometry
          attach="geometry"
          args={[grid.pixelWidth, grid.pixelHeight]}
        />
        <meshStandardMaterial attach="material" color={0x00ff00} />
      </mesh>
      {children}
    </FieldContext.Provider>
  );
};
