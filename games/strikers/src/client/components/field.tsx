import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';
import { Grid, Hex } from 'honeycomb-grid';
import { drawHexagons } from './field-canvas';

export function Field({ grid }: { grid: Grid<Hex> }) {
  const canvasRef = useRef(document.createElement('canvas'));
  canvasRef.current.width = grid.pixelWidth;
  canvasRef.current.height = grid.pixelHeight;
  const textureRef = useRef<CanvasTexture | null>(null);
  const contextRef = useRef(canvasRef.current.getContext('2d'));
  // document.body.appendChild(canvasRef.current);

  useFrame(({ clock }) => {
    canvasRef.current.width = grid.pixelWidth;
    canvasRef.current.height = grid.pixelHeight;

    let ctx = contextRef.current;

    if (ctx) {
      ctx.clearRect(0, 0, grid.pixelWidth, grid.pixelHeight);

      // Replace drawHexagons with your own function for drawing hexagons
      drawHexagons(ctx, grid);
    }

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
      <planeBufferGeometry args={[grid.pixelWidth, grid.pixelHeight]} />
      <meshBasicMaterial color={0xff0000} attach="material">
        <canvasTexture
          ref={textureRef}
          attach="map"
          image={canvasRef.current}
        />
      </meshBasicMaterial>
    </mesh>
  );
}
