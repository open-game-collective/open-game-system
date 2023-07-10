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

export const StrikersGameStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
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
});

export const StrikersBoardStateSchema = z.object({
  ballPosition: TilePositionSchema,
  possession: StrikersTeamSchema,
  players: z.array(StrikersBoardCardSchema),
});

export const StrikersGameContextSchema = z.object({
  initialBoard: StrikersBoardStateSchema,
});

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
  startedAt: z.date(),
  side: StrikersTeamSchema,
  totalActionCount: z.number(),
  actions: z.array(ActionsSchema),
});

export const StrikersTurnStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const StrikersTurnCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
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
