export const Ball = () => {
  return (
    <mesh>
      <sphereBufferGeometry attach="geometry" args={[1, 32, 16]} />
      <meshStandardMaterial attach="material" color={0xcc0000} />
    </mesh>
  );
};
