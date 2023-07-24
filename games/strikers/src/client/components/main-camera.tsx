import { MapControls, OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export const MainCamera: React.FC = () => {
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const { set, size } = useThree();

  useEffect(() => {
    if (cameraRef.current) {
      set({
        camera: cameraRef.current,
      });
    }
  }, [set]);

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.updateProjectionMatrix();

      // Constrain the camera's position
      cameraRef.current.position.x = Math.max(
        -5,
        Math.min(5, cameraRef.current.position.x)
      );
      cameraRef.current.position.z = Math.max(
        -5,
        Math.min(5, cameraRef.current.position.z)
      );
    }
  });

  // Change this variable to adjust zoom level
  const zoomLevel = 5;
  const aspectRatio = size.width / size.height;

  return (
    <>
      <MapControls minZoom={1} maxZoom={3} />
      {/* <OrbitControls 
        enableRotate={false} 
        screenSpacePanning 
        zoomSpeed={0.5} 
        minZoom={0.5} // Min zoom level (zoomed in)
        maxZoom={2} // Max zoom level (zoomed out)
      /> */}
      <orthographicCamera
        ref={cameraRef}
        position={[0, 10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[
          -aspectRatio * zoomLevel, // left
          aspectRatio * zoomLevel, // right
          zoomLevel, // top
          -zoomLevel, // bottom
          1, // near clipping plane
          1000, // far clipping plane
        ]}
      />
    </>
  );
};
