// pro-camera.tsx
import { useThree } from '@react-three/fiber';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { PerspectiveCamera as PerspectiveCameraImpl, Vector3 } from 'three';
import { CameraRigContext } from './camera-rig.context';
import { BoundingBox } from 'honeycomb-grid';
import { CameraControls } from '@react-three/drei';

export function CameraRig() {
  const rigStore = useContext(CameraRigContext);
  const { set, camera } = useThree();
  const cameraRef = useRef<PerspectiveCameraImpl>(null!);

  const diagonal = Math.sqrt(
    rigStore.get().grid.pixelWidth ** 2 + rigStore.get().grid.pixelHeight ** 2
  );

  useLayoutEffect(() => {
    const oldCam = camera;
    set(() => ({ camera: cameraRef.current! }));
    return () => set(() => ({ camera: oldCam }));
  }, [cameraRef, set]);

  useEffect(() => {
    const unsubscribe = rigStore.subscribe((settings) => {
      if (cameraRef.current) {
        const scaleFactor =
          (diagonal / 19) * (rigStore.get().scaleFactor ?? 1.5); // Using the scaleFactor prop
        const radius = settings.zoom * scaleFactor; // Applying scale factor to zoom level
        const tiltRad = (settings.tilt * Math.PI) / 180;
        const headingRad = (settings.heading * Math.PI) / 180;

        // Compute position using spherical coordinates
        const x = radius * Math.sin(tiltRad) * Math.sin(headingRad);
        const y = radius * Math.cos(tiltRad);
        const z = radius * Math.sin(tiltRad) * Math.cos(headingRad);

        const position = new Vector3(x, y, z);
        cameraRef.current.position.copy(position);

        // Make the camera look towards the center
        // const center = new Vector3(settings.center[0], settings.center[1], 0);
        cameraRef.current.lookAt(new Vector3(0, 0, 0));

        // Get the target hex from the grid
        // const targetHex = settings.grid.getHex({
        //   row: Math.round(settings.center[0]),
        //   col: Math.roundsettings.center[1],
        // });

        //
      }
    });

    return () => unsubscribe();
  }, [cameraRef, rigStore]);

  // return <CameraControls />;

  return <perspectiveCamera ref={cameraRef} />;
}
