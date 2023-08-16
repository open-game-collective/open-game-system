import { getSphereForHexes } from './camera-rig.utils';
import { Grid, Hex } from 'honeycomb-grid';
import { Sphere, Vector3 } from 'three';

describe('getSphereForHexes', () => {
  // it('should compute the correct bounding sphere for a grid of hexes', () => {
  //   const mockHexes = [
  //     new Hex({ q: 0, r: 0 }),
  //     new Hex({ q: 2, r: 3 }),
  //     new Hex({ q: 4, r: -1 }),
  //     new Hex({ q: -2, r: 5 })
  //   ];
    
  //   // Create a mock grid
  //   const grid: any = mockHexes;

  //   const result = getSphereForHexes(grid);

  //   const centerX = (4 + (-2)) / 2;  
  //   const centerZ = (5 + (-1)) / 2;  
  //   const halfDiagonal = Math.sqrt((4 + 2) ** 2 + (5 + 1) ** 2) / 2;  
    
  //   expect(result).toEqual(new Sphere(new Vector3(centerX, 0, centerZ), halfDiagonal));
  // });

  it('should throw an error when the grid is empty', () => {
    const grid: any = [];
    expect(() => getSphereForHexes(grid)).toThrowError('Hex list should not be empty');
  });
});
