import { MakeRequired, assert } from '@explorers-club/utils';
import { CameraControls } from '@react-three/drei';
import { assign } from '@xstate/immer';
import { useInterpret } from '@xstate/react';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Interpreter, StateMachine, createMachine } from 'xstate';
import { GridContext } from '../context/grid.context';
import { z } from 'zod';
import { ISheet } from '@theatre/core';
import { Traverser, Hex, HexCoordinates } from 'honeycomb-grid';
import { Box3, Vector3 } from 'three';

const Vector3Schema = z.custom<Vector3>();
const SheetSchema = z.custom<ISheet>();
const TraverserSchema = z.custom<Traverser<Hex>>();
const SphereSchema = z.custom<THREE.Sphere>();
const HexCoordinatesSchema = z.custom<HexCoordinates>();

const CameraZoomSchema = z.union([
  z.literal('GROUND_LEVEL'), // This represents the camera being at ground level.
  z.literal('EYE_LEVEL'), // This height is akin to a human's eye level when standing.
  z.literal('BIRDSEYE'), // A view from high above, like a bird would see.
  z.literal('SKYLINE'), // Very high up, akin to the view from the top of a skyscraper.
  z.literal('STRATOSPHERE'), // Near the edge of the Earth's atmosphere.
  z.literal('SPACE'), // Looking down on the grid/world from outer space.
]);

export type CameraZoom = z.infer<typeof CameraZoomSchema>;

const SetModePointFocusSchema = z.object({
  type: z.literal('SET_MODE_POINT_FOCUS'),
  center: Vector3Schema,
  position: Vector3Schema.optional(),
  transition: z.boolean().optional(),
});

const SetModeTileFocusSchema = z.object({
  type: z.literal('SET_MODE_TILES_FOCUS'),
  tiles: z.array(HexCoordinatesSchema),
  transition: z.boolean().optional(),
  zoom: CameraZoomSchema.optional(),
});

const SetModeCinematicSchema = z.object({
  type: z.literal('SET_MODE_CINEMATIC'),
  sheet: SheetSchema,
});

const CameraRigEventSchema = z.discriminatedUnion('type', [
  SetModePointFocusSchema,
  SetModeTilesFocusSchema,
  SetModeCinematicSchema,
]);

export type CameraRigEvent = z.infer<typeof CameraRigEventSchema>;

const CameraRigBaseContextSchema = z.object({
  // The Vector3 position in space where the camera is located.
  // Default: A position at the origin (0, 0, 0).
  position: Vector3Schema.optional().default(new Vector3(0, 0, 0)),

  // The Vector3 position in space that the camera is looking at.
  // Default: A position just in front of the camera on the Z-axis.
  center: Vector3Schema.optional().default(new Vector3(0, 0, -1)),

  // The camera's rotation around the up axis, measured in degrees.
  // Default: 0 (facing North in a typical convention).
  heading: z.number().optional().default(0),

  // The camera's tilt from the horizontal plane, measured in degrees.
  // Default: 0 (camera facing directly forward, no tilt).
  tilt: z.number().optional().default(0),

  // Traverser for dynamic or custom camera behavior.
  traverser: TraverserSchema.optional(),

  // The central hex tile that the camera focuses on.
  // No default is provided because a sensible default would depend on the grid system specifics.
  tile: HexCoordinatesSchema.optional(),

  // The bounding sphere for camera limits or region of interest.
  // No default provided as a bounding sphere is specific to the environment.
  sphere: SphereSchema.optional(),

  // The cinematic sheet, likely for predefined camera sequences.
  // No default as this would be specific to a cinematic sequence.
  sheet: SheetSchema.optional(),

  // The camera's zoom level. Determines how "close" the camera feels to the grid/world.
  // Default: EYE_LEVEL (camera at human eye height).
  zoom: CameraZoomSchema.optional().default('EYE_LEVEL'),

  // Whether the most recent called action was a transition or if updated immediately
  transition: z.boolean().optional(),
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

type CameraRigTilesFocusTypeState = {
  value: 'TilesFocus';
  context: MakeRequired<CameraRigBaseContext, 'tile' | 'zoom' | 'heading' | 'tilt'>;
};
type CameraRigPointFocusTypeState = {
  value: 'PointFocus';
  context: MakeRequired<
    CameraRigBaseContext,
    'center' | 'zoom' | 'heading' | 'tilt'
  >;
};

export type CameraRigTypeState =
  | CameraRigCinematicTypeState
  | CameraRigPointFocusTypeState
  | CameraRigTilesFocusTypeState;

export const CameraRigContext = createContext(
  {} as {
    cameraControls: CameraControls;
    service: CameraRigInterpreter;
  }
);

export const CaemraRigProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const cameraControlsRef = useRef<CameraControls | null>(null);
  const [cameraControls, setCameraControls] = useState<CameraControls | null>(
    null
  );

  useEffect(() => {
    setCameraControls(cameraControlsRef.current);
  }, [cameraControlsRef.current]);

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

export const CameraRigProviderImpl: FC<{
  children: ReactNode;
  cameraControls: CameraControls;
}> = ({ children, cameraControls }) => {
  const grid = useContext(GridContext);

  const [machine] = useState(
    createMachine<CameraRigBaseContext, CameraRigEvent, CameraRigTypeState>(
      {
        initial: 'PointFocus',
        on: {
          SET_MODE_POINT_FOCUS: 'PointFocus',
          SET_MODE_TILE_FOCUS: {
            target: 'TileFocus',
            actions: ['assignCenter', 'assignZoom', 'assignTransition'],
          },
          SET_MODE_TRAVERSER_FOCUS: {
            target: 'TraverserFocus',
            actions: ['assignTraverser', 'assignZoom', 'assignTransition'],
          },
          SET_MODE_CINEMATIC: {
            target: 'Cinematic',
            actions: 'assignSheet',
          },
        },
        states: {
          PointFocus: {
            entry: ({ position, center }, event) => {
              const transition =
                'transition' in event ? !!event.transition : false;

              cameraControls.setLookAt(
                position.x,
                position.y,
                position.z,
                center.x,
                center.y,
                center.z,
                transition
              );
            },
          },
          TileFocus: {
            initial: 'Idle',
            states: {
              Idle: {
                always: {
                  target: 'Moving',
                  actions: '',
                },
              },
              Moving: {},
            },
          },
          TraverserFocus: {
            initial: 'Starting',
            states: {
              Starting: {
                always: [
                  {
                    target: 'Animating',
                    cond: 'shouldTransition',
                    actions: 'focusTraverser',
                  },
                  {
                    target: 'Idle',
                    actions: 'focusTraverser',
                  },
                ],
              },
              Animating: {
                invoke: {
                  src: 'onActionComplete',
                  onDone: 'Idle',
                },
              },
              Idle: {},
            },
          },
          Cinematic: {
            entry: () => {
              // todo play theatrejs sheet
            },
          },
          FixedHeight: {
            entry: () => {
              // allow panning around the map at a fixed height
              // todo: what commands to send to move around?
            },
          },
        },
        predictableActionArguments: true,
      },
      {
        guards: {
          shouldTransition: (context, event) => {
            if ('transition' in event) {
              return !!event.transition;
            }
            return false;
          },
        },
        actions: {
          assignZoom: assign((context, event, meta) => {
            if ('zoom' in event && !!event.zoom) {
              // does 0 zoom work?
              context.zoom = event.zoom;
            }
          }),
          assignSheet: assign((context, event, meta) => {
            if ('sheet' in event) {
              context.sheet = event.sheet;
            }
          }),
          assignTransition: assign((context, event) => {
            if ('transition' in event) {
              context.transition = event.transition;
            }
          }),
          assignTraverser: assign((context, event) => {
            if ('traverser' in event) {
              context.traverser = event.traverser;
            }
          }),
          assignCenter: assign((context, event) => {
            if ('center' in event) {
              context.center = event.center;
            }
          }),

          /**
           * Centers the camera on a given traverser.
           *
           * By default the traverser will fit to be entirely visible within
           */
          focusTraverser: ({ traverser, transition }) => {
            assert(traverser, 'expected traverser');
            transition = transition || false;

            const hexes = Array.from(grid.traverse(traverser)); // Assuming this returns the hex cells for a given traverser

            if (!hexes || hexes.length === 0) {
              console.error('No hex cells returned by the traverser.');
              return;
            }

            const { isPointy, width, height } = grid.hexPrototype; // Assuming `grid` has a `hexPrototype` property

            // Determine bounding box for the set of hexes
            let mostLeft, mostRight, mostTop, mostBottom;

            if (isPointy) {
              hexes.sort((a, b) => b.s - a.s || a.q - b.q);
              mostLeft = hexes[0];
              mostRight = hexes[hexes.length - 1];

              hexes.sort((a, b) => a.r - b.r);
              mostTop = hexes[0];
              mostBottom = hexes[hexes.length - 1];
            } else {
              hexes.sort((a, b) => a.q - b.q);
              mostLeft = hexes[0];
              mostRight = hexes[hexes.length - 1];

              hexes.sort((a, b) => b.s - a.s || a.r - b.r);
              mostTop = hexes[0];
              mostBottom = hexes[hexes.length - 1];
            }

            const box = new Box3(
              new Vector3(mostLeft.x, mostTop.y, 0), // Bottom-left corner based on hex positions
              new Vector3(mostRight.x + width, mostBottom.y + height, 0) // Top-right corner based on hex positions
            );

            // Use fitToBox on the camera with the potential transition.
            cameraControls.fitToBox(box, transition);
          },

          // focusTraverser: ({ traverser, zoom, transition }) => {
          //   assert(traverser, 'expected traverser');
          //   zoom = zoom || 'EYE_LEVEL';
          //   transition = transition || false;

          //   const { pixelWidth, pixelHeight } = grid.traverse(traverser);

          //   // Calculate height based on zoom.
          //   let boxHeight;
          //   switch (zoom) {
          //     case 'GROUND_LEVEL':
          //       boxHeight = 1 * pixelHeight;
          //       break;
          //     case 'EYE_LEVEL':
          //       boxHeight = 1.5 * pixelHeight;
          //       break;
          //     case 'BIRDSEYE':
          //       boxHeight = 3 * pixelHeight;
          //       break;
          //     case 'SKYLINE':
          //       boxHeight = 5 * pixelHeight;
          //       break;
          //     case 'STRATOSPHERE':
          //       boxHeight = 10 * pixelHeight;
          //       break;
          //     case 'SPACE':
          //       boxHeight = 20 * pixelHeight;
          //       break;
          //     default:
          //       boxHeight = pixelHeight; // Defaulting to the original pixelHeight.
          //       break;
          //   }

          //   // Generate a THREE.Box3 from the traverser's pixel dimensions.
          //   // Note: This is just a basic example, adjust this according to your application's 3D space.
          //   const box = new Box3(
          //     new Vector3(0, 0, 0), // Assuming bottom-left corner
          //     new Vector3(pixelWidth, boxHeight, 0) // Assuming top-right corner
          //   );

          //   // Use fitToBox on the viewableGrid with potential transition.
          //   cameraControls.fitToBox(box, transition, {
          //     paddingTop: 0,
          //     paddingRight: 0,
          //     paddingBottom: 0,
          //     paddingLeft: 0,
          //   });
          // },
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

          // playCinematic: (context) => {
          // return new Promise((resolve, reject) => {
          //   // pseudo code
          //   const result = playTheatreJSSheet(context.sheet);
          //   if (result.success) resolve(result);
          //   else reject(result);
          // });
          // },
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

function getPolarAngleForZoomLevel(zoom: CameraZoom): number {
  // todo
  return 1;
}

function calculateHeightFromZoom(zoom: CameraZoom): number {
  switch (zoom) {
    case 'GROUND_LEVEL':
      return 0; // On the ground
    case 'EYE_LEVEL':
      return 1.7; // Roughly average human height in meters
    case 'BIRDSEYE':
      return 100; // 100 meters high, like a drone view
    case 'SKYLINE':
      return 300; // Top of a skyscraper
    case 'STRATOSPHERE':
      return 1000;
    case 'SPACE':
      return 4000;
    default:
      throw new Error(`Unknown zoom level: ${zoom}`);
  }
}

const getHeightMultiplierForZoom = (zoom: string): number => {
  switch (zoom) {
    case 'GROUND_LEVEL':
      return 1;
    case 'EYE_LEVEL':
      return 1.5;
    case 'BIRDSEYE':
      return 3;
    case 'SKYLINE':
      return 5;
    case 'STRATOSPHERE':
      return 10;
    case 'SPACE':
      return 20;
    default:
      return 1; // Defaulting to 1 for an unexpected zoom value.
  }
};
