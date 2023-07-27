import { Grid, Hex } from 'honeycomb-grid';
import { useEffect, useRef } from 'react';

interface FieldCanvasProps {
  grid: Grid<Hex>;
  width: number | string;
  height: number | string;
}

export const FieldCanvas = ({ grid, width, height }: FieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    if (ctx) {
      ctx.canvas.width = typeof width === 'number' ? width : parseInt(width);
      ctx.canvas.height =
        typeof height === 'number' ? height : parseInt(height);
      drawHexagons(ctx, grid);
    }
  }, [grid, width, height]);

  return (
    <canvas ref={canvasRef} style={{ width, height, background: '#eee' }} />
  );
};

function drawHexagons(context: CanvasRenderingContext2D, grid: Grid<Hex>) {
  // Clear the canvas
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  // Iterate over all hexes in the grid
  for (const hex of grid) {
    // Calculate the hex's pixel center
    const pixelCenter = {
      x: hex.width * Math.sqrt(3) * (hex.col + hex.row / 2),
      y: ((hex.height * 3) / 2) * hex.row,
    };

    // Get the corners of the hex
    const corners = hex.corners.map((corner) => ({
      x: corner.x + pixelCenter.x,
      y: corner.y + pixelCenter.y,
    }));

    // Draw the hex
    context.beginPath();
    context.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      context.lineTo(corners[i].x, corners[i].y);
    }
    context.closePath();

    // Choose the fill style based on the hex's position
    const color = (hex.col + hex.row) % 2 === 0 ? 'red' : 'yellow';
    context.fillStyle = color;

    // Fill the hex
    context.fill();

    // Set text color and font
    context.fillStyle = 'black';
    context.font = '12px Arial';

    // Draw the q and r values on the hexagon
    context.fillText(`q: ${hex.q}, r: ${hex.r}`, pixelCenter.x, pixelCenter.y);
  }
}
