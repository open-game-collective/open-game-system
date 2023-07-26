import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Grid, Hex } from 'honeycomb-grid';
import { map } from 'nanostores';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';

interface CameraStore {
  center: [number, number];
  zoom: number;
}

export const cameraStore = map<CameraStore>({
  center: [0, 0],
  zoom: 10,
});

export function FieldCamera({ grid }: { grid: Grid<Hex> }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    cameraStore.subscribe(({ center, zoom }) => {
      const cell = grid.getHex(center);
      if (!cell) return;

      const camera = cameraRef.current;
      if (camera) {
        const { x, y } = cell;

        // Non-linear altitude based on zoom level
        const altitude = Math.pow(zoom, 2); // Adjust this function based on your grid size and desired altitude

        // Dynamic tilt based on zoom
        const tilt = 90 - (zoom / 19) * 45; // At zoom 0, tilt is 90. At zoom 19, tilt is 45.

        const tiltRadians = (tilt * Math.PI) / 180;
        console.log({ tilt, tiltRadians });

        // Convert polar coordinates (altitude and tilt) to Cartesian coordinates (x, y, z)
        const posX = altitude * Math.sin(tiltRadians);
        const posY = altitude * Math.cos(tiltRadians);

        // Change the camera position
        const position = new Vector3(posX, 0, posY);
        camera.position.copy(position);

        // Point the camera towards the cell
        camera.lookAt(new Vector3(x, 0, y));

        camera.updateProjectionMatrix();
      }
    });
  }, []);

  useFrame(() => {
    const camera = cameraRef.current;
    if (camera) {
      // do any per-frame updates here
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      matrixWorldAutoUpdate={undefined}
      getObjectsByProperty={undefined}
    />
  );
}
