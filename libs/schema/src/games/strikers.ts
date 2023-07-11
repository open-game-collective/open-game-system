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

const CardIdSchema = z.string();

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

// export const KeeperPositionLiteral = z.literal('keeper');
// export const DefenderPositionLiteral = z.literal('defender');
// export const MidfielderPositionLiteral = z.literal('midfielder');
// export const ForwardPositionLiteral = z.literal('forward');

// export const StrikersPlayerPositionSchema = z.union([
//   KeeperPositionLiteral,
//   DefenderPositionLiteral,
//   MidfielderPositionLiteral,
//   ForwardPositionLiteral,
// ]);

const PossessionValueSchema = z.number().min(0).max(20);

// const PlayChartSchema = z.object({
//   turnover: z.number(),
//   dribble: z.number(),
//   shortPass: z.number(),
//   longPassOrShot: z.number(),
// });

// const ShotChartSchema = z.object({
//   miss: z.number(),
//   save: z.number(),
//   goal: z.number(),
// });

// const StrikersForwardPlayerCardSchema = z.object({
//   id: z.string().uuid(),
//   position: StrikersPlayerPositionSchema,
//   possessionValue: PossessionValueSchema,
//   playChart: PlayChartSchema,
//   shotChart: ShotChartSchema,
// });

// const StrikersMidfielderPlayerCardSchema = z.object({
//   id: z.string().uuid(),
//   position: StrikersPlayerPositionSchema,
//   possessionValue: PossessionValueSchema,
//   playChart: PlayChartSchema,
//   shotChart: ShotChartSchema,
// });

// const StrikersKeeperPlayerCardSchema = z.object({
//   id: z.string().uuid(),
//   position: StrikersPlayerPositionSchema,
//   possessionValue: PossessionValueSchema,
//   shotChart: ShotChartSchema,
// });

// const StrikersDefenderPlayerCardSchema = z.object({
//   id: z.string().uuid(),
//   position: StrikersPlayerPositionSchema,
//   possessionValue: PossessionValueSchema,
//   playChart: PlayChartSchema,
//   shotChart: ShotChartSchema,
// });

// export const StrikersPlayerCardSchema = z.union([
//   StrikersDefenderPlayerCardSchema,
//   StrikersKeeperPlayerCardSchema,
//   StrikersMidfielderPlayerCardSchema,
//   StrikersForwardPlayerCardSchema,
// ]);

const StrikersGameEntityPropSchema = z.object({
  schema: StrikersGameSchemaTypeLiteral,
  gameId: StrikersGameIdLiteral,
  config: StrikersGameConfigDataSchema,
  turnsIds: z.array(SnowflakeIdSchema),
});

const PlayPeriodStateEnum = z.enum(['NormalTime', 'StoppageTime', 'Complete']);

const FirstHalfSchema = z.object({
  FirstHalf: PlayPeriodStateEnum,
});
const HalfTimeSchema = z.object({
  Halftime: z.object({}),
});
const SecondHalfSchema = z.object({
  SecondHalf: PlayPeriodStateEnum,
});

const RegulationSchema = z.object({
  Regulation: z.union([FirstHalfSchema, HalfTimeSchema, SecondHalfSchema]),
});

const ExtraTimeSchema = z.object({
  ExtraTime: PlayPeriodStateEnum,
});

export const StrikersGameStateValueSchema = z.object({
  RunStatus: z.enum(['Paused', 'Running', 'Resuming', 'Error']),
  PlayStatus: z.union([RegulationSchema, ExtraTimeSchema]),
});

const StartCommandSchema = z.object({
  type: z.literal('START'),
  // connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
  // connectionEntityId: SnowflakeIdSchema,
});

// const SetPlayerCommandSchema = z.object({
//   type: z.literal('SET_PLAYER'),
//   connectionEntityId: SnowflakeIdSchema,
// });

// const SelectGameCommandSchema = z.object({
//   type: z.literal('SELECT_PLAYER'),
//   cardId: CardIdSchema,
// });

// export const StrikersLineupCommandSchema = SelectGameCommandSchema;

export const StrikersLineupContextSchema = z.object({
  homeCardIds: z.array(CardIdSchema),
  awayCardIds: z.array(CardIdSchema),
});

export const StrikersLineupStateValueSchema = z.enum([
  'Initializing',
  'Complete',
]);

export const StrikersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
  // StrikersLineupCommandSchema,
]);

// export const ConnectionCommandSchema = z.union([
//   BaseConnectionCommandSchema,
//   NewRoomCommandSchema,
//   // todo other commands here, workflows, etc
// ]);

export const StrikersGameEntitySchema = EntityBaseSchema(
  StrikersGameEntityPropSchema,
  StrikersGameCommandSchema,
  StrikersGameStateValueSchema
);

export const StrikersTeamSchema = z.enum(['home', 'away']);

// export const BoardCoordinatesSchema = z.tuple([z.number(), z.number()]);

const TilePositionSchema = z.custom<HexCoordinates>();

export const StrikersBoardCardSchema = z.object({
  team: StrikersTeamSchema,
  cardId: CardIdSchema,
  tilePosition: TilePositionSchema,
  // activeModifiers: z.array(ModifiersSchema) add endurance and other modifiers here...
});

export const StrikersBoardStateSchema = z.object({
  ballPosition: TilePositionSchema,
  possession: StrikersTeamSchema,
  players: z.array(StrikersBoardCardSchema),
});

export const StrikersGameContextSchema = z.object({
  initialBoard: StrikersBoardStateSchema,
});

// Actions
// Short pass - a pass traveling to a player within 1-2 spaces of the current player. Cannot travel through defenders. Success threshold 5.
// Long pass - a pass traveling to a player within 3-4 spaces of the current player. Cannot travel through defenders. Success threshold: 10.
// Lob pass - a pass traveling over a defender to a player 2-4 spaces away. Success threshold: 10.
// Through pass - a pass travelling along a line to a space. Success threshold is 3x the number of spaces it must travel. (allowing spaces to theoretically move 6 spaces).
// Marking - if a player is within one space of another player, they can "mark" that player for 5 turns, following thei rmovements but not using endurance tokens.
// Header - on a corner kick, the player that receives the ball can try a header. Threshold: 16.
// Corner kick - when a corner kick is triggered, teams are allowed to 1 by 1 place their players near the goal. One player is selected to kick. A roll is determined to see if it goes in the center hex as planned. 13-20 puts you in that spot, otherwise 1-12 each puts you in a different hex around that middle hex

const MoveActionSchema = z.object({
  actionType: z.literal('MOVE'),
  playerId: SnowflakeIdSchema,
  cardId: CardIdSchema,
  startBoardState: StrikersBoardStateSchema,
  endBoardState: StrikersBoardStateSchema,
});

const ShootActionSchema = z.object({
  actionType: z.literal('SHOOT'),
  playerId: SnowflakeIdSchema,
  cardId: CardIdSchema,
  startingBoardState: StrikersBoardStateSchema,
  endingBoardState: StrikersBoardStateSchema,
});

const PassActionSchema = z.object({
  actionType: z.literal('PASS'),
  playerId: SnowflakeIdSchema,
  cardId: CardIdSchema,
  startingBoardState: StrikersBoardStateSchema,
  endingBoardState: StrikersBoardStateSchema,
});

const ActionsSchema = z.discriminatedUnion('actionType', [
  MoveActionSchema,
  ShootActionSchema,
  PassActionSchema,
]);

const StrikersTurnEntityPropsSchema = z.object({
  schema: StrikersTurnSchemaTypeLiteral,
  startedAt: z.date(),
  side: StrikersTeamSchema,
  totalActionCount: z.number(),
  actions: z.array(ActionsSchema),
});

export const StrikersTurnStateValueSchema = z.object({
  Complete: z.enum(['True', 'False']),
});

const StrikersMoveActionCommandSchema = z.object({
  type: z.literal('MOVE'),
  destination: TilePositionSchema,
});

const StrikersPassActionCommandSchema = z.object({
  type: z.literal('PASS'),
  destination: TilePositionSchema,
});

const StrikersShootActionCommandSchema = z.object({
  type: z.literal('SHOOT'),
});

const StrikersRollCommandSchema = z.object({
  type: z.literal('ROLL'),
});

export const StrikersTurnCommandSchema = z.discriminatedUnion('type', [
  // StrikersMoveActionCommandSchema,
  // StrikersPassActionCommandSchema,
  StrikersShootActionCommandSchema,
  StrikersRollCommandSchema,
]);

export const StrikersTurnEntitySchema = EntityBaseSchema(
  StrikersTurnEntityPropsSchema,
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
