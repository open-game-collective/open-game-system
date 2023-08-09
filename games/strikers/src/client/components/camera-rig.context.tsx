import { CameraControls } from '@react-three/drei';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GridContext } from '../context/grid.context';

// CameraControlsImpl.install({ THREE: THREE });

export const CameraRigContext = createContext(
  {} as { cameraControls: CameraControls }
);

export const CameraRigProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const grid = useContext(GridContext);
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
