export const SplashScene = () => {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material" color={0xcc0000} />
      <ambientLight />
    </mesh>
  );
};
