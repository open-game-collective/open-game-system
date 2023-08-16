import { gridPointToWorldPosition } from '@strikers/lib/utils';
import { Grid, Hex, HexCoordinates } from 'honeycomb-grid';
import { Sphere, Vector3 } from 'three';

export const getSphereForHexes: (
  child: Grid<Hex>,
  parent: Grid<Hex>
) => Sphere = (child, parent) => {
  let hexesCount = 0;

  // Initialize bounding box variables
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Iterate over the hexes in the grid
  for (const hex of child) {
    // Update the bounding box by comparing with each hexagon's point
    minX = Math.min(minX, hex.x);
    minY = Math.min(minY, hex.y);
    maxX = Math.max(maxX, hex.x);
    maxY = Math.max(maxY, hex.y);

    hexesCount++;
  }

  if (hexesCount === 0) {
    throw new Error('Hex list should not be empty');
  }

  // Get the center and half-diagonal of the bounding box
  const centerX = (minX + maxX) / 2;
  // const centerY = (minY + maxY) / 2;  // We are not using Y-coordinate here, as Y should be 0
  const centerZ = (minY + maxY) / 2; // We have moved the 'Y' calculation to 'Z' based on your requirement
  const halfDiagonal = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) / 2;

  const worldCenter = gridPointToWorldPosition(
    { x: centerX, y: centerZ },
    parent.pixelWidth,
    parent.pixelHeight
  );
  console.log(
    centerX,
    centerZ,
    worldCenter,
    parent.pixelWidth,
    parent.pixelHeight
  );

  return new Sphere(worldCenter, halfDiagonal);
};
