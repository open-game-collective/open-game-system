export const Ball = () => {
  return (
    <mesh position={[0, 1, 0]}>
      <sphereBufferGeometry attach="geometry" args={[0.5, 32, 16]} />
      <meshBasicMaterial attach="material" color={0xffffff} />
    </mesh>
  );
};
