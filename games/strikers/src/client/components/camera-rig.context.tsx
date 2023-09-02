import { CameraControls } from '@react-three/drei';
import { useInterpret } from '@xstate/react';
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
import {
  CameraRigInterpreter,
  createCameraRigMachine,
} from './camera-rig.machine';

export const CameraRigContext = createContext(
  {} as {
    cameraControls: CameraControls;
    service: CameraRigInterpreter;
  }
);

export const CameraRigProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const [cameraControls, setCameraControls] = useState<CameraControls | null>(
    null
  );

  useEffect(() => {
    setCameraControls(cameraControlsRef.current);
  }, [cameraControlsRef.current]);

  // todo add sheet provider there

  return (
    <>
      <CameraControls makeDefault ref={cameraControlsRef} />
      {cameraControls && (
        <CameraRigProviderImpl cameraControls={cameraControls}>
          {children}
        </CameraRigProviderImpl>
      )}
    </>
  );
};

const CameraRigProviderImpl: FC<{
  children: ReactNode;
  cameraControls: CameraControls;
}> = ({ children, cameraControls }) => {
  const grid = useContext(GridContext);

  const [machine] = useState(createCameraRigMachine(grid, cameraControls));
  const service = useInterpret(machine);

  return (
    <>
      <CameraRigContext.Provider value={{ cameraControls, service }}>
        {children}
      </CameraRigContext.Provider>
    </>
  );
};
