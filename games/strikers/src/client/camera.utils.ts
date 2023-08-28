import { CameraControls } from '@react-three/drei';

export const lookBirdsEye = (cameraControls: CameraControls) => {
  return cameraControls.setLookAt(0, 30, 0, 0, 0, 0, true);
};
