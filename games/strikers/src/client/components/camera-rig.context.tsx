import { MakeRequired, assert, assertProp } from '@explorers-club/utils';
import { CameraControls } from '@react-three/drei';
import { ISheet } from '@theatre/core';
import { assign } from '@xstate/immer';
import { useInterpret } from '@xstate/react';
import { Grid, Hex, HexCoordinates, Traverser } from 'honeycomb-grid';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Box3,
  Sphere,
  MathUtils,
  Matrix4,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { Interpreter, StateMachine, createMachine } from 'xstate';
import { z } from 'zod';
import { GridContext } from '../context/grid.context';
import { rotateBox } from '../utils';
import {
  CameraAnchor,
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

const getSphereForHexes = () => {};

// const anchorWeightsMap: Record<
//   CameraAnchor,
//   { top: number; left: number; right: number; bottom: number }
// > = {
//   TOP_LEFT: { top: 2, left: 2, right: 1, bottom: 1 },
//   TOP_CENTER: { top: 2, left: 1, right: 1, bottom: 1 },
//   TOP_RIGHT: { top: 2, left: 1, right: 2, bottom: 1 },

//   MIDDLE_LEFT: { top: 1, left: 2, right: 1, bottom: 1 },
//   MIDDLE_CENTER: { top: 1, left: 1, right: 1, bottom: 1 },
//   MIDDLE_RIGHT: { top: 1, left: 1, right: 2, bottom: 1 },

//   BOTTOM_LEFT: { top: 3, left: 1, right: 3, bottom: 1 },
//   BOTTOM_CENTER: { top: 3, left: 1, right: 1, bottom: 1 },
//   BOTTOM_RIGHT: { top: 3, left: 3, right: 1, bottom: 1 },
// };

// function tiltToPolarRadians(tilt: CameraTilt): number {
//   switch (tilt) {
//     case 'FLOOR':
//       return 0;
//     case 'SLIGHT_TILT':
//       return 30 * MathUtils.DEG2RAD;
//     case 'LOW_DIAGONAL':
//       return 60 * MathUtils.DEG2RAD;
//     case 'HORIZONTAL':
//       return 90 * MathUtils.DEG2RAD;
//     case 'HIGH_DIAGONAL':
//       return 120 * MathUtils.DEG2RAD;
//     case 'STEEP_TILT':
//       return 150 * MathUtils.DEG2RAD;
//     case 'SKY':
//       return 180 * MathUtils.DEG2RAD;
//     default:
//       // If the tilt is a number, it should be between -90 and 90 degrees inclusive.
//       // Convert that degree to radians and return.
//       return tilt * MathUtils.DEG2RAD;
//   }
// }

// function headingToAzimuthRadians(heading: number): number {
//   // Ensure the heading is between 0° and 360°.
//   const normalizedHeading = ((heading % 360) + 360) % 360;

//   // Convert the normalized heading to radians.
//   return normalizedHeading * MathUtils.DEG2RAD;
// }
