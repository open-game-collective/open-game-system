import { defineHex, Grid, HexCoordinates, Orientation } from 'honeycomb-grid';
import { Observable } from 'rxjs';
import { StateMachine } from 'xstate';
import { z } from 'zod';
import { SnowflakeIdSchema, UserIdSchema } from '../common';
import { StateSchemaFromStateValue } from '../common';
import { EntityBaseSchema } from '../entity/base';
import {
  StrikersGameIdLiteral,
  StrikersGameSchemaTypeLiteral,
  StrikersPlayerSchemaTypeLiteral,
  StrikersTurnSchemaTypeLiteral,
} from '../literals';
import { StrikersGameConfigDataSchema } from '@schema/game-configuration/strikers';

const StrikersRollSchema = z.object({
  rawValue: z.number(), // 1-20
  modifiers: z.array(z.number()), // bonuses, buffs
  total: z.number(),
});

class StrikersFieldHex extends defineHex({
  orientation: Orientation.POINTY,
}) {
  static create(coordinates: HexCoordinates, cardId: string) {
    const hex = new StrikersFieldHex(coordinates);
    hex.cardId = cardId;
    return hex;
  }

  cardId!: string;
}

// const grid = new Grid(StrikersFieldHex);
// // grid.
// const asjson = grid.toJSON();
// asjson.coordinates.map((value) => {
//   value.q;
//   // value as StrikersFieldHex
// });
// grid.

// const hex = StrikersFieldHex.create(
//   {
//     q: 1,
//     r: 1,
//   },
//   'foo'
// );

// const StrikersGridSchema = z.custom<GridAsJSON<StrikersFieldHex>>();

export const KeeperPositionLiteral = z.literal('keeper');
export const DefenderPositionLiteral = z.literal('defender');
export const MidfielderPositionLiteral = z.literal('midfielder');
export const ForwardPositionLiteral = z.literal('forward');

export const StrikersPlayerPositionSchema = z.union([
  KeeperPositionLiteral,
  DefenderPositionLiteral,
  MidfielderPositionLiteral,
  ForwardPositionLiteral,
]);

const PossessionValueSchema = z.number().min(0).max(20);

const PlayChartSchema = z.object({
  turnover: z.number(),
  dribble: z.number(),
  shortPass: z.number(),
  longPassOrShot: z.number(),
});

const ShotChartSchema = z.object({
  miss: z.number(),
  save: z.number(),
  goal: z.number(),
});

const StrikersForwardPlayerCardSchema = z.object({
  id: z.string().uuid(),
  position: StrikersPlayerPositionSchema,
  possessionValue: PossessionValueSchema,
  playChart: PlayChartSchema,
  shotChart: ShotChartSchema,
});

const StrikersMidfielderPlayerCardSchema = z.object({
  id: z.string().uuid(),
  position: StrikersPlayerPositionSchema,
  possessionValue: PossessionValueSchema,
  playChart: PlayChartSchema,
  shotChart: ShotChartSchema,
});

const StrikersKeeperPlayerCardSchema = z.object({
  id: z.string().uuid(),
  position: StrikersPlayerPositionSchema,
  possessionValue: PossessionValueSchema,
  shotChart: ShotChartSchema,
});

const StrikersDefenderPlayerCardSchema = z.object({
  id: z.string().uuid(),
  position: StrikersPlayerPositionSchema,
  possessionValue: PossessionValueSchema,
  playChart: PlayChartSchema,
  shotChart: ShotChartSchema,
});

export const StrikersPlayerCardSchema = z.union([
  StrikersDefenderPlayerCardSchema,
  StrikersKeeperPlayerCardSchema,
  StrikersMidfielderPlayerCardSchema,
  StrikersForwardPlayerCardSchema,
]);

const StrikersTurnEntityPropsSchema = z.object({
  startTime: z.date(),
  turn: z.enum(['p1', 'p2']),
  cells: z.array(z.custom<HexCoordinates>()), // todo how do we extend?
  half: z.enum(['first', 'second']),
  halfIndex: z.number(),
  turnIndex: z.number(),
  moves: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      cardId: z.string(), // todo type these to coords and cardIds
    })
  ),
  rolls: z.array(StrikersRollSchema),
});

const StrikersGameEntityPropSchema = z.object({
  schema: StrikersGameSchemaTypeLiteral,
  gameId: StrikersGameIdLiteral,
  config: StrikersGameConfigDataSchema,
  turnsIds: z.array(SnowflakeIdSchema),
});

export const StrikersGameStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
});

const StartCommandSchema = z.object({
  type: z.literal('START'),
  connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
  connectionEntityId: SnowflakeIdSchema,
});

const SetPlayerCommandSchema = z.object({
  type: z.literal('SET_PLAYER'),
  connectionEntityId: SnowflakeIdSchema,
});

export const StrikersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const StrikersGameEntitySchema = EntityBaseSchema(
  StrikersGameEntityPropSchema,
  StrikersGameCommandSchema,
  StrikersGameStateValueSchema
);

export const StrikersGameContextSchema = z.object({
  foo: z.string(),
});

const StrikersTurnEntityPropSchema = z.object({
  schema: StrikersTurnSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  team: z.enum(['home', 'away']),
});

export const StrikersTurnStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
// export type StrikersTurnStateValue = z.infer<
//   typeof StrikersTurnStateValueSchema
// >;

export const StrikersTurnCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const StrikersTurnEntitySchema = EntityBaseSchema(
  StrikersTurnEntityPropSchema,
  StrikersTurnCommandSchema,
  StrikersTurnStateValueSchema
);

export const StrikersTurnContextSchema = z.object({
  foo: z.string(),
});

const StrikersPlayerEntityPropSchema = z.object({
  schema: StrikersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  sessionIds: z.array(SnowflakeIdSchema),
  // channel: z.custom<Observable<MessageEvent>>(),
});

export const StrikersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const StrikersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const StrikersPlayerEntitySchema = EntityBaseSchema(
  StrikersPlayerEntityPropSchema,
  StrikersPlayerCommandSchema,
  StrikersPlayerStateValueSchema
);

export const StrikersPlayerContextSchema = z.object({
  foo: z.string(),
});
// export type StrikersPlayerContext = z.infer<typeof StrikersPlayerContextSchema>;
// type StrikersPlayerEntity = z.infer<typeof StrikersPlayerEntitySchema>;

// export type StrikersPlayerMachine = StateMachine<
//   StrikersPlayerContext,
//   StrikersPlayerStateSchema,
//   StrikersPlayerCommand
// >;
