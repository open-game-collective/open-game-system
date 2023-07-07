import { SnowflakeIdSchema } from '@schema/common';
import { z } from 'zod';

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

const StrikersPlayerCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  league: z.string(),
  year: z.number(),
  speed: z.number(),
  control: z.number(),
  endurance: z.number(),
  shooting: z.number(),
  salary: z.number(),
  weights: z.object({
    goal: z.number(),
    save: z.number(),
    deflection: z.number(),
    blocked: z.number(),
    miss: z.number(),
  }),
});

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

// const StrikersPlayerCardSchema = z.union([
//   StrikersDefenderPlayerCardSchema,
//   StrikersKeeperPlayerCardSchema,
//   StrikersMidfielderPlayerCardSchema,
//   StrikersForwardPlayerCardSchema,
// ]);

export const StrikersCardSchema = StrikersPlayerCardSchema;

export const CardIdSchema = z.string();

export const StrikersGameConfigDataSchema = z.object({
  cards: z.array(StrikersCardSchema),
  gameMode: z.enum(['quickplay', 'draft']).default('quickplay'),
  turnsPerHalf: z.number().default(20),
  p1SessionId: SnowflakeIdSchema,
  p2SessionId: SnowflakeIdSchema,
  extraTime: z.object({
    minRounds: z.number().default(2),
    maxRounds: z.number().default(6),
  }),
});
