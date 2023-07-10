import { SnowflakeIdSchema } from '@schema/common';
import { z } from 'zod';

const KeeperPositionLiteral = z.literal('GK');
const DefenderPositionLiteral = z.literal('DEF');
const MidfielderPositionLiteral = z.literal('MID');
const ForwardPositionLiteral = z.literal('FWD');

// Actions
// Short pass - a pass traveling to a player within 1-2 spaces of the current player. Cannot travel through defenders. Success threshold 5.
// Long pass - a pass traveling to a player within 3-4 spaces of the current player. Cannot travel through defenders. Success threshold: 10.
// Lob pass - a pass traveling over a defender to a player 2-4 spaces away. Success threshold: 10.
// Through pass - a pass travelling along a line to a space. Success threshold is 3x the number of spaces it must travel. (allowing spaces to theoretically move 6 spaces).
// Marking - if a player is within one space of another player, they can "mark" that player for 5 turns, following thei rmovements but not using endurance tokens.
// Header - on a corner kick, the player that receives the ball can try a header. Threshold: 16.
// Corner kick - when a corner kick is triggered, teams are allowed to 1 by 1 place their players near the goal. One player is selected to kick. A roll is determined to see if it goes in the center hex as planned. 13-20 puts you in that spot, otherwise 1-12 each puts you in a different hex around that middle hex

export const StrikersRosterPositionSchema = z.union([
  KeeperPositionLiteral,
  DefenderPositionLiteral,
  MidfielderPositionLiteral,
  ForwardPositionLiteral,
]);

const AbilityWeightSchema = z.object({
  orderWeight: z.number(),
  rollWeight: z.number(),
});

const AbilityWeightsSchema = z.object({
  plusOneAction: AbilityWeightSchema, // add ones action for this turn
  plusTwoActions: AbilityWeightSchema, // adds two action for this turn
  plusFiveShortPass: AbilityWeightSchema, // adds +5 to a roll for a short pass
  plusThreeAnyPass: AbilityWeightSchema, // adds +3 to any roll for pass
  plusFiveHeader: AbilityWeightSchema, // adds +5 to any roll for header
  plusFiveLongPass: AbilityWeightSchema, // adds +5 to any long pass roll
  plusFiveThroughpass: AbilityWeightSchema, // +5 to any through pass roll
  plusFiveLobPass: AbilityWeightSchema, // adds +5 any lob pass roll
  plusFiveAssist: AbilityWeightSchema, // adds +5 to the shot of player who receives pass
  plusFiveMark: AbilityWeightSchema, // adds +5 to the players attempt to mark an opponent to follow
});

const ShotWeightsSchema = z.object({
  miss: z.number(),
  save: z.number(),
  corner: z.number(),
  deflect: z.number(),
  goal: z.number(),
});

const StrikersPlayerCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  rosterPosition: StrikersRosterPositionSchema,
  league: z.string(),
  year: z.number(),
  speed: z.number(),
  control: z.number(),
  endurance: z.number(),
  salary: z.number(),
  abilityWeights: AbilityWeightSchema,
  shotWeights: ShotWeightsSchema,
});

export const StrikersCardSchema = StrikersPlayerCardSchema;

export const CardIdSchema = z.string();

export const StrikersLobbyConfigSchema = z.object({
  p1SessionId: SnowflakeIdSchema,
  p2SessionId: SnowflakeIdSchema,
});

export const StrikersGameConfigDataSchema = z.object({
  lobbyConfig: StrikersLobbyConfigSchema,
  playerIds: z.array(SnowflakeIdSchema),
  cards: z.array(StrikersCardSchema),
  gameMode: z.enum(['quickplay', 'draft']).default('quickplay'),
  turnsPerHalf: z.number().default(20),
  extraTime: z.object({
    minRounds: z.number().default(2),
    maxRounds: z.number().default(6),
  }),
});
