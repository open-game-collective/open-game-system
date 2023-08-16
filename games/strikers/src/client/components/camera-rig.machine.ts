import { MakeRequired } from '@explorers-club/utils';
import { CameraControls } from '@react-three/drei';
import { ISheet } from '@theatre/core';
import { assign } from '@xstate/immer';
import { Grid, Hex, HexCoordinates } from 'honeycomb-grid';
import { MathUtils, Sphere, Vector3 } from 'three';
import { Interpreter, StateMachine, createMachine } from 'xstate';
import { z } from 'zod';
import { getSphereForHexes } from './camera-rig.utils';

const SheetSchema = z.custom<ISheet>();
const SphereSchema = z.custom<Sphere>();
const HexCoordinatesSchema = z.custom<HexCoordinates>();
const GridSchema = z.custom<Grid<Hex>>();
const HeadingSchema = z.number().min(0).max(360).default(270);
const CameraTiltSchema = z.union([
  z.number().min(-90).max(90).default(90),
  z.literal('FLOOR'), // 0°
  z.literal('SLIGHT_TILT'), // 30° (slight tilt up from the floor)
  z.literal('LOW_DIAGONAL'), // 60° (more pronounced tilt, but still towards the ground)
  z.literal('HORIZONTAL'), // 90° (directly forward)
  z.literal('HIGH_DIAGONAL'), // 120° (tilting upwards, but not straight up)
  z.literal('STEEP_TILT'), // 150° (almost directly upwards)
  z.literal('SKY'), // 180° (directly upwards)
]);
type CameraTilt = z.infer<typeof CameraTiltSchema>;

const BIRDS_EYE_HEIGHT = 1000;

const CameraZoomSchema = z.union([
  z.literal('CLOSEST'),
  z.literal('CLOSER'),
  z.literal('MID'),
  z.literal('FAR'),
  z.literal('FARTHER'),
  z.literal('FARTHEST'),
]);

export type CameraZoom = z.infer<typeof CameraZoomSchema>;

export const CameraTiltDegreesMap = {
  FLOOR: 0,
  SLIGHT_TILT: 30,
  LOW_DIAGONAL: 60,
  HORIZONTAL: 90,
  HIGH_DIAGONAL: 120,
  STEEP_TILT: 150,
  SKY: 180,
};

const CameraDirectionSchema = z.union([
  z.literal('FRONT'),
  z.literal('BACK'),
  z.literal('LEFT'),
  z.literal('RIGHT'),
]);

export type CameraDirection = z.infer<typeof CameraDirectionSchema>;

export const CameraHeadingDegreesMap: Record<CameraDirection, number> = {
  FRONT: 0,
  BACK: 180,
  LEFT: 90,
  RIGHT: -90,
};

export const CameraAnchorSchema = z.union([
  z.literal('TOP_LEFT'),
  z.literal('TOP_CENTER'),
  z.literal('TOP_RIGHT'),
  z.literal('MIDDLE_LEFT'),
  z.literal('MIDDLE_CENTER'),
  z.literal('MIDDLE_RIGHT'),
  z.literal('BOTTOM_LEFT'),
  z.literal('BOTTOM_CENTER'),
  z.literal('BOTTOM_RIGHT'),
]);
export type CameraAnchor = z.infer<typeof CameraAnchorSchema>;

export const CameraClearanceSchema = z.union([
  z.literal('NONE'),
  z.literal('MINIMAL'),
  z.literal('MODERATE'),
  z.literal('AMPLE'),
]);
export type CameraClearance = z.infer<typeof CameraClearanceSchema>;

const TargetSchema = GridSchema;

const PositionEventSchema = z.object({
  type: z.literal('POSITION'),
  target: TargetSchema.optional(),
  clearance: CameraClearanceSchema.optional(),
  anchor: CameraAnchorSchema.optional(),
  tilt: CameraTiltSchema.optional(),
  heading: HeadingSchema.optional(),
});

const CameraRigEventSchema = z.discriminatedUnion('type', [
  PositionEventSchema,
]);

export type CameraRigEvent = z.infer<typeof CameraRigEventSchema>;

const CameraRigBaseContextSchema = z.object({
  targetSphere: SphereSchema,
  heading: HeadingSchema,
  tilt: CameraTiltSchema,
  transition: z.boolean(),
  anchor: CameraAnchorSchema,
  clearance: CameraClearanceSchema,
  sheet: SheetSchema.optional(),
});

export type CameraRigBaseContext = z.infer<typeof CameraRigBaseContextSchema>;

export type CameraRigStateSchema = {
  states: {
    Focused: {};
    Cinematic: {};
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

export const createCameraRigMachine = (
  grid: Grid<Hex>,
  cameraControls: CameraControls
) =>
  createMachine<CameraRigBaseContext, CameraRigEvent, CameraRigTypeState>(
    {
      initial: 'Focused',
      context: {
        targetSphere: getSphereForHexes(grid, grid),
        tilt: 0,
        heading: 0,
        transition: false,
        clearance: 'NONE',
        anchor: 'MIDDLE_CENTER',
      },
      on: {
        POSITION: {
          target: 'Focused',
          actions: [
            'assignTargetSphere',
            'assignTilt',
            'assignHeading',
            'assignAnchor',
            'assignClearance',
          ],
        },
      },
      states: {
        Focused: {
          initial: 'Starting',
          states: {
            Starting: {
              always: [
                {
                  target: 'Active',
                  cond: 'hasTransition',
                  actions: ['focusTarget'],
                },
                {
                  target: 'Idle',
                  actions: ['focusTarget'],
                },
              ],
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
      guards: {
        hasTransition: () => {
          return false;
        },
      },
      actions: {
        assignAnchor: assign((context, event) => {
          if ('anchor' in event && event.anchor !== undefined) {
            context.anchor = event.anchor;
          }
        }),

        assignClearance: assign((context, event) => {
          if ('clearance' in event && event.clearance !== undefined) {
            context.clearance = event.clearance;
          }
        }),

        assignTilt: assign((context, event) => {
          if ('tilt' in event && event.tilt !== undefined) {
            context.tilt = event.tilt;
          }
        }),

        assignHeading: assign((context, event) => {
          if ('heading' in event && event.heading !== undefined) {
            context.heading = event.heading;
          }
        }),

        assignTargetSphere: assign((context, event) => {
          if ('target' in event && !!event.target) {
            const sphere = getSphereForHexes(event.target, grid);

            context.targetSphere = sphere;
          }
        }),

        focusTarget: (context) => {
          // todo what should I do here?
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
  );

function tiltToPolarRadians(tilt: CameraTilt): number {
  switch (tilt) {
    case 'FLOOR':
      return 0;
    case 'SLIGHT_TILT':
      return 30 * MathUtils.DEG2RAD;
    case 'LOW_DIAGONAL':
      return 60 * MathUtils.DEG2RAD;
    case 'HORIZONTAL':
      return 90 * MathUtils.DEG2RAD;
    case 'HIGH_DIAGONAL':
      return 120 * MathUtils.DEG2RAD;
    case 'STEEP_TILT':
      return 150 * MathUtils.DEG2RAD;
    case 'SKY':
      return 180 * MathUtils.DEG2RAD;
    default:
      // If the tilt is a number, it should be between -90 and 90 degrees inclusive.
      // Convert that degree to radians and return.
      return tilt * MathUtils.DEG2RAD;
  }
}

function headingToAzimuthRadians(heading: number): number {
  // Ensure the heading is between 0° and 360°.
  const normalizedHeading = ((heading % 360) + 360) % 360;

  // Convert the normalized heading to radians.
  return normalizedHeading * MathUtils.DEG2RAD;
}

const CameraClearanceMultipliers: Record<CameraClearance, number> = {
  NONE: 0, // No extra clearance
  MINIMAL: 0.5, // 50% extra clearance
  MODERATE: 2, // 200% extra clearance
  AMPLE: 5, // 500% extra clearance
};
