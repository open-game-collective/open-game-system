import { MakeRequired, assert, assertProp } from '@explorers-club/utils';
import { CameraControls } from '@react-three/drei';
import { ISheet } from '@theatre/core';
import { assign } from '@xstate/immer';
import { useInterpret } from '@xstate/react';
import { Hex, HexCoordinates, Traverser } from 'honeycomb-grid';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Box3, MathUtils, Vector3 } from 'three';
import { Interpreter, StateMachine, createMachine } from 'xstate';
import { z } from 'zod';
import { GridContext } from '../context/grid.context';

const Vector3Schema = z.custom<Vector3>();
const SheetSchema = z.custom<ISheet>();
const TraverserSchema = z.custom<Traverser<Hex>>();
const Box3Schema = z.custom<Box3>();
const HexCoordinatesSchema = z.custom<HexCoordinates>();
const HeadingSchema = z.number().min(0).max(360).default(270);
const TiltSchema = z.number().min(-90).max(90).default(90);

const CameraZoomSchema = z.union([
  z.literal('CLOSEST'),
  z.literal('CLOSER'),
  z.literal('MID'),
  z.literal('FAR'),
  z.literal('FARTHER'),
  z.literal('FARTHEST'),
]);

export type CameraZoom = z.infer<typeof CameraZoomSchema>;

const CameraDirectionSchema = z.union([
  z.literal('FRONT'),
  z.literal('BACK'),
  z.literal('UP'),
  z.literal('DOWN'),
  z.literal('LEFT'),
  z.literal('RIGHT'),
]);

export type CameraDirection = z.infer<typeof CameraDirectionSchema>;

// const LookDirection = z.object({
//   type: z.literal('ROTATE'),
//   heading: HeadingSchema.optional(),
//   tilt: TiltSchema.optional(),
//   zoom: CameraZoomSchema.optional(),
//   transition: z.boolean().optional(),
// });

const ZoomEventSchema = z.object({
  type: z.literal('ZOOM'),
  zoom: CameraZoomSchema,
  transition: z.boolean().optional(),
});

const RotateEventSchema = z.object({
  type: z.literal('ROTATE'),
  heading: HeadingSchema.optional(),
  tilt: TiltSchema.optional(),
  zoom: CameraZoomSchema.optional(),
  transition: z.boolean().optional(),
});

const FocusTileEventSchema = z.object({
  type: z.literal('FOCUS_TILE'),
  tileCoordinate: HexCoordinatesSchema,
  position: Vector3Schema.optional(),
  transition: z.boolean().optional(),
  zoom: CameraZoomSchema.optional(),
});

const FocusTilesEventSchema = z.object({
  type: z.literal('FOCUS_TILES'),
  tileCoordinates: z.array(HexCoordinatesSchema),
  position: Vector3Schema.optional(),
  transition: z.boolean().optional(),
  zoom: CameraZoomSchema.optional(),
});

const FocusTraverserEventSchema = z.object({
  type: z.literal('FOCUS_TRAVERSER'),
  traverser: TraverserSchema,
  position: Vector3Schema.optional(),
  transition: z.boolean().optional(),
  zoom: CameraZoomSchema.optional(),
});

const StartSheetEventSchema = z.object({
  type: z.literal('START_SHEET'),
  sheet: SheetSchema,
});

const CameraRigEventSchema = z.discriminatedUnion('type', [
  FocusTileEventSchema,
  RotateEventSchema,
  ZoomEventSchema,
  FocusTilesEventSchema,
  FocusTraverserEventSchema,
  StartSheetEventSchema,
]);

export type CameraRigEvent = z.infer<typeof CameraRigEventSchema>;

const CameraRigBaseContextSchema = z.object({
  targetBox: Box3Schema,

  // The camera's rotation around the up axis, measured in degrees.
  // Default: 0 (facing North in a typical convention).
  heading: z.number().default(0),

  // The camera's tilt from the horizontal plane, measured in degrees.
  // Default: 0 (camera facing directly forward, no tilt).
  tilt: z.number(),

  // The camera's zoom level. Determines how "close" the camera feels to the grid/world.
  // Default: EYE_LEVEL (camera at human eye height).
  zoom: CameraZoomSchema,

  // Whether the most recent called action was a transition or if updated immediately
  transition: z.boolean(),

  // The cinematic sheet, likely for predefined camera sequences.
  // No default as this would be specific to a cinematic sequence.
  sheet: SheetSchema.optional(),
});

export type CameraRigBaseContext = z.infer<typeof CameraRigBaseContextSchema>;

export type CameraRigStateSchema = {
  states: {
    PointFocus: {};
    TileFocus: {};
    TraverserFocus: {};
    BoundingSphere: {};
    Cinematic: {};
    FixedHeight: {};
  };
};

export type CameraRigMachine = StateMachine<
  CameraRigBaseContext,
  CameraRigStateSchema,
  CameraRigEvent
>;

export type CameraRigInterpreter = Interpreter<
  CameraRigBaseContext,
  CameraRigStateSchema,
  CameraRigEvent
>;

type CameraRigCinematicTypeState = {
  value: 'Cinematic';
  context: MakeRequired<CameraRigBaseContext, 'sheet'>;
};

type CameraRigFocusTypeState = {
  value: 'Focus';
  context: CameraRigBaseContext;
};

export type CameraRigTypeState =
  | CameraRigCinematicTypeState
  | CameraRigFocusTypeState;

export const CameraRigContext = createContext(
  {} as {
    cameraControls: CameraControls;
    service: CameraRigInterpreter;
  }
);

export const CameraRigProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const [cameraControls, setCameraControls] = useState<CameraControls | null>(
    null
  );

  useEffect(() => {
    setCameraControls(cameraControlsRef.current);
  }, [cameraControlsRef.current]);

  // todo add sheet provider there

  return (
    <>
      <CameraControls makeDefault ref={cameraControlsRef} />
      {cameraControls && (
        <CameraRigProviderImpl cameraControls={cameraControls}>
          {children}
        </CameraRigProviderImpl>
      )}
    </>
  );
};

const CameraRigProviderImpl: FC<{
  children: ReactNode;
  cameraControls: CameraControls;
}> = ({ children, cameraControls }) => {
  const grid = useContext(GridContext);

  const [machine] = useState(
    createMachine<CameraRigBaseContext, CameraRigEvent, CameraRigTypeState>(
      {
        initial: 'Focused',
        context: {
          targetBox: new Box3(new Vector3(0, 0, 0), new Vector3(1, 1, 1)),
          tilt: 0,
          zoom: 'CLOSEST',
          heading: 0,
          transition: false,
        },
        on: {
          // FOCUS_POINT: {
          //   target: 'Focused',
          //   actions: [
          //     'assignTargetBoxFromPoint',
          //     'assignZoom',
          //     'assignHeading',
          //     'assignTilt',
          //   ],
          // },
          ZOOM: {
            target: 'Focused',
            actions: ['assignZoom'],
          },

          ROTATE: {
            target: 'Focused',
            actions: ['assignZoom', 'assignTilt', 'assignHeading'],
          },

          FOCUS_TILE: {
            target: 'Focused',
            actions: [
              'assignTargetBoxFromTileCoordiante',
              'assignZoom',
              'assignHeading',
              'assignTilt',
            ],
          },
          FOCUS_TILES: {
            target: 'Focused',
            actions: [
              'assignTargetBoxFromTileCoordiantes',
              'assignZoom',
              'assignHeading',
              'assignTilt',
            ],
          },
          FOCUS_TRAVERSER: {
            target: 'Focused',
            actions: [
              'assignTargetBoxFromTraverser',
              'assignZoom',
              'assignHeading',
              'assignTilt',
            ],
          },
          START_SHEET: {
            target: 'Cinematic',
            actions: 'assignSheet',
          },
        },
        states: {
          Focused: {
            initial: 'Starting',
            states: {
              Starting: {
                always: {
                  target: 'Active',
                  actions: 'fitToBox',
                },
              },
              Active: {
                invoke: {
                  src: 'onActionComplete',
                  onDone: 'Idle',
                },
              },
              Idle: {},
            },
          },
          Cinematic: {
            entry: 'startSheet',
          },
        },
        predictableActionArguments: true,
      },
      {
        actions: {
          /**
           * Uses the zoom, heading, tilt, and center values to calculate
           * the padding and bounding box for the camera and target then calls
           * cameraControls.fitToBox with it.
           */
          fitToBox: (context) => {
            // Extract heading and tilt from context
            const { heading, tilt } = context;
            // console.log({ heading, tilt });

            const azimuthAngle = heading * MathUtils.DEG2RAD;
            const polarAngle = tilt * MathUtils.DEG2RAD;

            console.log({ heading, tilt, azimuthAngle, polarAngle });

            // Rotate camera to the specified heading and tilt
            cameraControls.setPosition(0, 50, 0, false);
            cameraControls.rotateTo(azimuthAngle, polarAngle, false); // set third parameter to false to not transition during rotation

            // After rotation, apply padding and fit the camera to the box
            const transition = context.transition || false;
            const padding = getPaddingForZoom(context.zoom);
            // cameraControls.fitToBox(context.targetBox, transition, padding);
          },

          assignTargetBoxFromTileCoordiante: assign((context, event) => {
            assertProp(event, 'tileCoordinate');
            const hex = grid.getHex(event.tileCoordinate);
            assert(hex, 'couldnt find hex');

            context.targetBox = getBoundingBoxForHexes([hex]);
          }),

          assignTargetBoxFromTileCoordiantes: assign((context, event) => {
            assertProp(event, 'tileCoordinates');
            const hexes = event.tileCoordinates.map((coordinate) => {
              const hex = grid.getHex(coordinate);
              assert(hex, 'expected hex');
              return hex;
            });

            context.targetBox = getBoundingBoxForHexes(hexes);
          }),

          assignTargetBoxFromTraverser: assign((context, event) => {
            assertProp(event, 'traverser');

            const hexes = Array.from(grid.traverse(event.traverser));

            context.targetBox = getBoundingBoxForHexes(hexes);
          }),

          assignSheet: assign((context, event, meta) => {
            if ('sheet' in event) {
              context.sheet = event.sheet;
            }
          }),

          assignZoom: assign((context, event) => {
            if ('zoom' in event && typeof event['zoom'] === 'string') {
              context.zoom = event.zoom;
            }
          }),

          assignTilt: assign((context, event) => {
            if ('tilt' in event && typeof event.tilt === 'number') {
              context.tilt = event.tilt;
            }
          }),

          assignHeading: assign((context, event) => {
            if ('heading' in event && typeof event.heading === 'number') {
              context.heading = event.heading;
            }
          }),

          startSheet: () => {
            console.log('starting sheet!');
            // todo call start sheet
          },
        },

        services: {
          /**
           * Returns a promise that resolves when the current action
           * on the cameraControls is complete. If there is no action
           * running, it resolves immediately
           */
          onActionComplete: (): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
              // If the controls are not active updating, resolve immediately
              if (!cameraControls.active) {
                resolve();
                return;
              }

              // Listen for the 'rest' event, which indicates that the camera movement is below the restThreshold
              const onRest = () => {
                cameraControls.removeEventListener('rest', onRest); // Clean up the listener after the event is caught
                resolve();
              };

              cameraControls.addEventListener('rest', onRest);
            });
          },
        },
      }
    )
  );
  const service = useInterpret(machine);

  return (
    <>
      <CameraRigContext.Provider value={{ cameraControls, service }}>
        {children}
      </CameraRigContext.Provider>
    </>
  );
};

/**
 * Maps a zoom value to unit padding values to be able to zoom out from the current axis
 * @param zoom
 */
const getPaddingForZoom = (
  zoom: CameraZoom
): {
  paddingTop: number;
  paddingLeft: number;
  paddingRight: number;
  paddingBottom: number;
} => {
  let basePadding: number;
  switch (zoom) {
    case 'CLOSEST':
      basePadding = 0;
      break;
    case 'CLOSER':
      basePadding = 1;
      break;
    case 'MID':
      basePadding = 2;
      break;
    case 'FAR':
      basePadding = 4;
      break;
    case 'FARTHER':
      basePadding = 8;
      break;
    case 'FARTHEST':
      basePadding = 16;
      break;
    default:
      throw new Error(`Unimplemented zoom level: ${zoom}`);
  }

  // This is to ensure we don't exceed a padding of 20
  basePadding = Math.min(basePadding, 20);

  return {
    paddingTop: basePadding,
    paddingLeft: basePadding,
    paddingRight: basePadding,
    paddingBottom: basePadding,
  };
};

/**
 * Returns a Box3 that encapsulates the given hex tiles
 */
const getBoundingBoxForHexes: (hexes: Hex[]) => Box3 = (hexes) => {
  if (hexes.length === 0) {
    throw new Error('No hexes provided.');
  }

  // Initialize the bounding box with the first hex's corner coordinates.
  let firstHexCorners = hexes[0].corners;
  let minX = firstHexCorners[0].x;
  let minZ = firstHexCorners[0].y; // Using Z as it's in 3D space now
  let maxX = firstHexCorners[0].x;
  let maxZ = firstHexCorners[0].y; // Using Z as it's in 3D space now

  // Go through each hex and update the bounding box values using its corners.
  hexes.forEach((hex) => {
    const corners = hex.corners;
    corners.forEach((corner) => {
      minX = Math.min(minX, corner.x);
      minZ = Math.min(minZ, corner.y); // Using Z as it's in 3D space now
      maxX = Math.max(maxX, corner.x);
      maxZ = Math.max(maxZ, corner.y); // Using Z as it's in 3D space now
    });
  });

  // Y-values are constant for all hexes since we've decided on an arbitrary height of 1 unit.
  const minY = 0;
  const maxY = 1;

  return new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ));
};
