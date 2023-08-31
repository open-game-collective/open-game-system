import { Grid, Hex, Orientation } from 'honeycomb-grid'; // Replace with your actual path

const drawHexagons = (
  context: CanvasRenderingContext2D,
  grid: Grid<Hex>
): void => {
  const { canvas } = context;

  // Clear the canvas before starting to draw.
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Convert the grid to an array of Hex objects.
  const hexes = grid.toArray();
  if (hexes.length === 0) return;

  // Extract the settings from the first hexagon. Assuming all hexagons in the grid have the same settings.
  const hexSettings = Hex.settings;

  const {
    dimensions: { xRadius, yRadius },
    orientation,
  } = hexSettings;

  // Compute the width and height of a hexagon depending on its orientation.
  const hexWidth = orientation === Orientation.FLAT ? xRadius : yRadius;
  const hexHeight = orientation === Orientation. ? yRadius : xRadius;

  // Compute the width and height of the grid by getting the maximum column and row indices.
  const gridWidth = Math.max(...hexes.map((hex) => hex.col)) + 1;
  const gridHeight = Math.max(...hexes.map((hex) => hex.row)) + 1;

  // Compute the scale factor to fit all hexagons on the canvas.
  const hexScale = Math.min(
    canvas.width / (gridWidth * hexWidth),
    canvas.height / (gridHeight * hexHeight)
  );

  // Set line width and color for the hexagon borders.
  context.lineWidth = 1;
  context.strokeStyle = '#000000';

  // Draw each hexagon in the grid.
  hexes.forEach((hex) => {
    const { col, row } = hex;

    // Compute the center of the hexagon in the scaled grid.
    const centerX = (col + 0.5) * hexWidth * hexScale;
    const centerY = (row + 0.5) * hexHeight * hexScale;

    context.beginPath();

    // Draw the border of the hexagon.
    for (let side = 0; side < 6; side++) {
      // Compute the angle of each vertex of the hexagon (in radians).
      const angleDeg = 60 * side;
      const angleRad = (Math.PI / 180) * angleDeg;

      // Compute the position of each vertex.
      const x = centerX + hexScale * xRadius * Math.cos(angleRad);
      const y = centerY + hexScale * yRadius * Math.sin(angleRad);

      // Move to the first vertex and draw lines to the others.
      if (side === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    // Close the path and stroke it to draw the border of the hexagon.
    context.closePath();
    context.stroke();
  });
};

export default drawHexagons;
