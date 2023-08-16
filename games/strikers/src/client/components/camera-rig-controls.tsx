import { convertStrikersTileCoordinateToRowCol } from '@strikers/lib/utils';
import { button, buttonGroup, folder, useControls } from 'leva';
import { spiral } from 'honeycomb-grid';
import { useContext } from 'react';
import { DEG2RAD } from 'three/src/math/MathUtils';
import { GridContext } from '../context/grid.context';
import { CameraRigContext } from './camera-rig.context';

export function CameraRigControls() {
  const { cameraControls, service } = useContext(CameraRigContext);
  const camera = cameraControls.camera;
  const grid = useContext(GridContext);

  useControls({
    headingGrp: buttonGroup({
      label: 'heading',
      opts: {
        '-45º': () => {
          cameraControls.rotate(-45 * DEG2RAD, 0, true);
        },
        '-15º': () => {
          cameraControls.rotate(-15 * DEG2RAD, 0, true);
        },
        '+15º': () => {
          cameraControls.rotate(15 * DEG2RAD, 0, true);
        },
        '+45º': () => {
          cameraControls.rotate(45 * DEG2RAD, 0, true);
        },
      },
    }),
    tiltGrp: buttonGroup({
      label: 'tilt',
      opts: {
        '-20º': () => {
          cameraControls.rotate(0, -20 * DEG2RAD, true);
        },
        '-5º': () => {
          cameraControls.rotate(0, -5 * DEG2RAD, true);
        },
        '+5º': () => {
          cameraControls.rotate(0, 5 * DEG2RAD, true);
        },
        '+20º': () => {
          cameraControls.rotate(0, 20 * DEG2RAD, true);
        },
      },
    }),
    truckGrp: buttonGroup({
      label: 'truck',
      opts: {
        left: () => cameraControls.truck(-1, 0, true),
        right: () => cameraControls.truck(1, 0, true),
        down: () => cameraControls.truck(0, 1, true),
        up: () => cameraControls.truck(0, -1, true),
      },
    }),
    dollyGrp: buttonGroup({
      label: 'dolly',
      opts: {
        forward: () => cameraControls.dolly(1, true),
        back: () => cameraControls.dolly(-1, true),
      },
    }),
    zoomGrp: buttonGroup({
      label: 'zoom',
      opts: {
        '/2': () => cameraControls.zoomTo(camera.zoom / 2, true),
        '+1': () => cameraControls.zoomTo(camera.zoom + 1, true),
        '1.0': () => cameraControls.zoomTo(1, true),
        // '/2': () => cameraControls.zoom(camera.zoom / 2, true),
        // '/-2': () => cameraControls.zoom(-camera.zoom / 2, true),
      },
    }),
    // moveTo: folder(
    //   {
    //     vec1: { value: [3, 5, 2], label: 'vec' },
    //     'moveTo(…vec)': button((get) =>
    //       cameraControls.moveTo(
    //         ...(get('moveTo.vec1') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    // 'fitToBox(mesh)': button(() =>
    //   cameraControls.fitToBox(meshRef.current, true)
    // ),
    grid: folder(
      {
        centerCoord: {
          value: 'A1',
          label: 'center',
          hint: 'Format: [ROW][COL], ROW=A-Z, COL=1-36',
        },
        radius: {
          value: 1,
          label: 'radius',
          hint: 'sets radius of spiral out of center coordinate',
        },
        'focusSphere(coord, radius)': button((get) => {
          const val = get('grid.centerCoord');

          service.send({
            type: 'POSITION',
            target: grid.traverse(
              spiral({
                start: convertStrikersTileCoordinateToRowCol(val),
                radius: get('grid.radius'),
              })
            ),
          });

          // cameraControls.setTarget(
          //   x - grid.pixelWidth / 2,
          //   y,
          //   z - grid.pixelHeight / 2,
          //   false
          // );

          // cameraControls.setLookAt(

          // )

          // console.log(
          //   { sphere, val },
          //   cameraControls.azimuthAngle,
          //   cameraControls.polarAngle
          // );

          // cameraControls.set
          // console.log({ val });
        }),
        'focusGrid()': button((get) => {
          service.send({
            type: 'POSITION',
            target: grid,
          });

          // cameraControls.setTarget(
          //   x - grid.pixelWidth / 2,
          //   y,
          //   z - grid.pixelHeight / 2,
          //   false
          // );

          // cameraControls.setLookAt(

          // )

          // console.log(
          //   { sphere, val },
          //   cameraControls.azimuthAngle,
          //   cameraControls.polarAngle
          // );

          // cameraControls.set
          // console.log({ val });
        }),
      },
      { collapsed: true }
    ),
    // setPosition: folder(
    //   {
    //     vec2: { value: [-5, 2, 1], label: 'vec' },
    //     'setPosition(…vec)': button((get) =>
    //       cameraControls.setPosition(
    //         ...(get('setPosition.vec2') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    // setTarget: folder(
    //   {
    //     vec3: { value: [3, 0, -3], label: 'vec' },
    //     'setTarget(…vec)': button((get) =>
    //       cameraControls.setTarget(
    //         ...(get('setTarget.vec3') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    // setLookAt: folder(
    //   {
    //     vec4: { value: [1, 2, 3], label: 'position' },
    //     vec5: { value: [1, 1, 0], label: 'target' },
    //     'setLookAt(…position, …target)': button((get) =>
    //       cameraControls.setLookAt(
    //         ...(get('setLookAt.vec4') as [number, number, number]),
    //         ...(get('setLookAt.vec5') as [number, number, number]),
    //         true
    //       )
    //     ),
    //   },
    //   { collapsed: true }
    // ),
    lerpLookAt: folder(
      {
        vec6: { value: [-2, 0, 0], label: 'posA' },
        vec7: { value: [1, 1, 0], label: 'tgtA' },
        vec8: { value: [0, 2, 5], label: 'posB' },
        vec9: { value: [-1, 0, 0], label: 'tgtB' },
        t: { value: Math.random(), label: 't', min: 0, max: 1 },
        'f(…posA,…tgtA,…posB,…tgtB,t)': button((get) => {
          return cameraControls.lerpLookAt(
            ...(get('lerpLookAt.vec6') as [number, number, number]),
            ...(get('lerpLookAt.vec7') as [number, number, number]),
            ...(get('lerpLookAt.vec8') as [number, number, number]),
            ...(get('lerpLookAt.vec9') as [number, number, number]),
            get('lerpLookAt.t'),
            true
          );
        }),
      },
      { collapsed: true }
    ),
    saveState: button(() => cameraControls.saveState()),
    reset: button(() => cameraControls.reset(true)),
    // enabled: { value: true, label: 'controls on' },
    // verticalDragToForward: {
    //   value: false,
    //   label: 'vert. drag to move forward',
    // },
    // dollyToCursor: { value: false, label: 'dolly to cursor' },
    // infinityDolly: { value: false, label: 'infinity dolly' },
  });

  return null;
}
