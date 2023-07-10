import { FC, ReactNode } from 'react';

export const Field: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <mesh>
        <planeBufferGeometry attach="geometry" args={[200, 2000]} />
        <meshStandardMaterial attach="material" color={0x00ff00} />
      </mesh>
      <mesh>
        <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
        <meshStandardMaterial attach="material" color={0xcc0000} />
      </mesh>
    </>
  );
  //   return (
  //     <mesh>
  //       <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
  //       <meshStandardMaterial attach="material" color={0xcc0000} />
  //     </mesh>
  //   );
};
