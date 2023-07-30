import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Grid, Hex } from 'honeycomb-grid';
import {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import CameraControlsImpl from 'camera-controls';
import { StrikersCameraPosition } from '@schema/types';

// CameraControlsImpl.install({ THREE: THREE });

export const CameraRigContext = createContext(
  {} as {
    cameraControls: CameraControls;
  }
);

export const CameraRigProvider: FC<{
  children: ReactNode;
  grid: Grid<Hex>;
  playerCameraPosition: StrikersCameraPosition;
}> = ({ children, playerCameraPosition }) => {
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const [cameraControls, setCameraControls] = useState<CameraControls | null>(
    null
  );

  // todo fix this extra re-render, better way to do this
  // had trouble instantiating CameraControlsImpl directly
  useEffect(() => {
    setCameraControls(cameraControlsRef.current);
  }, [cameraControlsRef.current]);

  // When server-controlled camera position changes, update client-side camera
  useEffect(() => {
    if (!cameraControls) {
      return;
    }
    const { x, y, z, targetX, targetY, targetZ } = playerCameraPosition;
    console.log('setting camera pos to ', playerCameraPosition);
    cameraControls.setLookAt(x, y, z, targetX, targetY, targetZ, true);
  }, [cameraControls, playerCameraPosition]);

  return (
    <>
      <CameraControls makeDefault ref={cameraControlsRef} />;
      {cameraControls && (
        <CameraRigContext.Provider value={{ cameraControls }}>
          {children}
        </CameraRigContext.Provider>
      )}
    </>
  );
};
