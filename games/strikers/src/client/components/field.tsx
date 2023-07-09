import { FC, ReactNode } from 'react';

export const Field: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
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
