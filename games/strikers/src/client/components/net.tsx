import { HexCoordinates } from "honeycomb-grid";
import { FC } from "react";

export const Net = () => {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material" color={0xcc0000} />
    </mesh>
  );
};
