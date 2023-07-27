import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';
import { Grid, Hex } from 'honeycomb-grid';

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
      drawHexagons(ctx, clock.getElapsedTime(), grid);
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

function drawHexagons(
  context: CanvasRenderingContext2D,
  time: number,
  grid: Grid<Hex>
) {
  // Clear the canvas
  context.clearRect(0, 0, grid.pixelWidth, grid.pixelHeight);

  // Iterate over all hexes in the grid
  for (const hex of grid) {
    // Get the corners of the hex
    const corners = hex.corners.map(({ x, y }) => [
      x + hex.center.x,
      y + hex.center.y,
    ]);

    // Draw the hex
    context.beginPath();
    context.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < corners.length; i++) {
      context.lineTo(corners[i][0], corners[i][1]);
    }
    context.closePath();

    // Choose the fill style based on time and the hex's position
    const color =
      Math.floor((time + hex.center.x + hex.center.y) * 10) % 2 === 0
        ? 'red'
        : 'yellow';
    context.fillStyle = color;

    // Fill the hex
    context.fill();
  }
}
