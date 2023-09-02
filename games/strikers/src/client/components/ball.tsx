export const Ball = () => {
  return (
    <mesh position={[0, 0.5, 0.5]}>
      <sphereBufferGeometry attach="geometry" args={[0.25, 32, 16]} />
      <meshBasicMaterial attach="material" color={'white'} />
    </mesh>
  );
};
