import { Box3, Vector3, Matrix4, Euler, MathUtils } from 'three';

export function rotateBox(box: Box3, polarAngle: number, azimuthAngle: number): Box3 {
  // Create a rotation matrix that first rotates around the Y axis (azimuth)
  // and then around the X axis (polar).
  const rotationMatrix = new Matrix4()
    .makeRotationY(azimuthAngle)
    .multiply(new Matrix4().makeRotationX(polarAngle));

  // Extract the corners of the box.
  const corners: Vector3[] = [
    new Vector3(box.min.x, box.min.y, box.min.z),
    new Vector3(box.min.x, box.min.y, box.max.z),
    new Vector3(box.min.x, box.max.y, box.min.z),
    new Vector3(box.min.x, box.max.y, box.max.z),
    new Vector3(box.max.x, box.min.y, box.min.z),
    new Vector3(box.max.x, box.min.y, box.max.z),
    new Vector3(box.max.x, box.max.y, box.min.z),
    new Vector3(box.max.x, box.max.y, box.max.z),
  ];

  // Rotate each corner.
  const transformedCorners = corners.map((corner) =>
    corner.applyMatrix4(rotationMatrix)
  );

  // Compute the enclosing box.
  const transformedBox = new Box3().setFromPoints(transformedCorners);

  return transformedBox;
}
