import { MakeRequired } from '@explorers-club/utils';
import { ISheet } from '@theatre/core';
import { Hex, HexCoordinates, Traverser } from 'honeycomb-grid';
import { Vector3 } from 'three';
import { Interpreter, StateMachine } from 'xstate';
import z from 'zod';

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

const CameraRigEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('SET_MODE_POINT_FOCUS'),
    center: Vector3Schema,
    position: Vector3Schema.optional(),
    transition: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('SET_MODE_TILE_FOCUS'),
    tile: HexCoordinatesSchema,
    transition: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('SET_MODE_TRAVERSER_FOCUS'),
    traverser: TraverserSchema,
    transition: z.boolean().optional(),
    zoom: CameraZoomSchema.optional(),
  }),
  z.object({
    type: z.literal('SET_MODE_BOUNDING_SPHERE'),
    sphere: SphereSchema,
  }),
  z.object({ type: z.literal('SET_MODE_CINEMATIC'), sheet: SheetSchema }),
  z.object({
    type: z.literal('SET_MODE_FIXED_HEIGHT'),
    centerTile: HexCoordinatesSchema,
    zoom: CameraZoomSchema,
  }),
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

export type CameraRigTypeState =
  | {
      value: 'PointFocus';
      context: MakeRequired<CameraRigBaseContext, 'position' | 'center'>;
    }
  | {
      value: 'TileFocus';
      context: MakeRequired<
        CameraRigBaseContext,
        'tile' | 'zoom' | 'heading' | 'tilt' | 'transition'
      >;
    }
  | {
      value: 'TraverserFocus';
      context: MakeRequired<
        CameraRigBaseContext,
        'traverser' | 'zoom' | 'transition'
      >;
    }
  | {
      value: 'BoundingSphere';
      context: MakeRequired<
        CameraRigBaseContext,
        'sphere' | 'heading' | 'tilt'
      >;
    }
  | {
      value: 'Cinematic';
      context: MakeRequired<CameraRigBaseContext, 'sheet'>;
    }
  | {
      value: 'FixedHeight';
      context: MakeRequired<CameraRigBaseContext, 'tile' | 'zoom'>;
    };
