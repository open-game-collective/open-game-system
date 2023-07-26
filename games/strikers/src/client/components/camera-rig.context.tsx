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

// CameraControlsImpl.install({ THREE: THREE });

export const CameraRigContext = createContext(
  {} as { cameraControls: CameraControls }
);

export const CameraRigProvider: FC<{
  children: ReactNode;
  grid: Grid<Hex>;
}> = ({ children, grid }) => {
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const [cameraControls, setCameraControls] = useState<CameraControls | null>(
    null
  );

  // todo fix this extra re-render, better way to do this
  // had troupble instantiating CameraControlsImpl directly
  useEffect(() => {
    setCameraControls(cameraControlsRef.current);
  }, [cameraControlsRef.current]);

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
