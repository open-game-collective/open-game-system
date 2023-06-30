import { defineHex, HexCoordinates } from 'honeycomb-grid';
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

const StrikersRollSchema = z.object({
  rawValue: z.number(), // 1-20
  modifiers: z.array(z.number()), // bonuses, buffs
  result: z.number(),
});

class StrikersFieldHex extends defineHex() {
  static create(coordinates: HexCoordinates, custom: string) {
    const hex = new StrikersFieldHex(coordinates);
    hex.custom = custom;
    return hex;
  }

  custom!: string;
}

// const StrikersGridSchema = z.custom<GridAsJSON<StrikersFieldHex>>();

const KeeperPositionLiteral = z.literal('keeper');
const DefenderPositionLiteral = z.literal('defender');
const MidfielderPositionLiteral = z.literal('midfielder');
const ForwardPositionLiteral = z.literal('forward');

const StrikersPlayerPositionSchema = z.union([
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

const StrikersGameTurnSchema = z.object({
  startTime: z.date(),
  cells: z.array(z.custom<HexCoordinates>()), // todo how do we extend?
  half: z.enum(['first', 'second']),
  team: z.enum(['home', 'away']),
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
  config: z.any(),
  //   config: StrikersGameConfigDataSchema,
  roomEntityId: SnowflakeIdSchema,
  hostPlayerId: SnowflakeIdSchema,
  homePlayerId: SnowflakeIdSchema,
  awayPlayerId: SnowflakeIdSchema,
  turnsIds: z.array(SnowflakeIdSchema),
});

const StrikersGameStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
});

export type StrikersGameStateValue = z.infer<
  typeof StrikersGameStateValueSchema
>;

const StartCommandSchema = z.object({
  type: z.literal('START'),
  connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
  connectionEntityId: SnowflakeIdSchema,
});

const StrikersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type StrikersGameCommand = z.infer<typeof StrikersGameCommandSchema>;

const StrikersGameEntitySchema = EntityBaseSchema(
  StrikersGameEntityPropSchema,
  StrikersGameCommandSchema,
  StrikersGameStateValueSchema
);

export type StrikersGameStateSchema =
  StateSchemaFromStateValue<StrikersGameStateValue>;

const StrikersGameContextSchema = z.object({
  foo: z.string(),
});
export type StrikersGameContext = z.infer<typeof StrikersGameContextSchema>;

export type StrikersGameMachine = StateMachine<
  StrikersGameContext,
  StrikersGameStateSchema,
  StrikersGameCommand
>;

const StrikersTurnEntityPropSchema = z.object({
  schema: StrikersTurnSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  team: z.enum(['home', 'away']),
});

const StrikersTurnStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
export type StrikersTurnStateValue = z.infer<
  typeof StrikersTurnStateValueSchema
>;

const StrikersTurnCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type StrikersTurnCommand = z.infer<typeof StrikersTurnCommandSchema>;

const StrikersTurnEntitySchema = EntityBaseSchema(
  StrikersTurnEntityPropSchema,
  StrikersTurnCommandSchema,
  StrikersTurnStateValueSchema
);

export type StrikersTurnStateSchema =
  StateSchemaFromStateValue<StrikersTurnStateValue>;

const StrikersTurnContextSchema = z.object({
  foo: z.string(),
});
export type StrikersTurnContext = z.infer<typeof StrikersTurnContextSchema>;
type StrikersTurnEntity = z.infer<typeof StrikersTurnEntitySchema>;

export type StrikersTurnMachine = StateMachine<
  StrikersTurnContext,
  StrikersTurnStateSchema,
  StrikersTurnCommand
>;

const StrikersPlayerEntityPropSchema = z.object({
  schema: StrikersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
  channel: z.custom<Observable<MessageEvent>>(),
});

const StrikersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
export type StrikersPlayerStateValue = z.infer<
  typeof StrikersPlayerStateValueSchema
>;

const StrikersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type StrikersPlayerCommand = z.infer<typeof StrikersPlayerCommandSchema>;

const StrikersPlayerEntitySchema = EntityBaseSchema(
  StrikersPlayerEntityPropSchema,
  StrikersPlayerCommandSchema,
  StrikersPlayerStateValueSchema
);

export type StrikersPlayerStateSchema =
  StateSchemaFromStateValue<StrikersPlayerStateValue>;

const StrikersPlayerContextSchema = z.object({
  foo: z.string(),
});
export type StrikersPlayerContext = z.infer<typeof StrikersPlayerContextSchema>;
type StrikersPlayerEntity = z.infer<typeof StrikersPlayerEntitySchema>;

export type StrikersPlayerMachine = StateMachine<
  StrikersPlayerContext,
  StrikersPlayerStateSchema,
  StrikersPlayerCommand
>;
