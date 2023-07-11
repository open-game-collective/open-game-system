import { SnowflakeIdSchema } from '@schema/common';
import { z } from 'zod';

const KeeperPositionLiteral = z.literal('GK');
const DefenderPositionLiteral = z.literal('DEF');
const MidfielderPositionLiteral = z.literal('MID');
const ForwardPositionLiteral = z.literal('FWD');

export const StrikersRosterPositionSchema = z.union([
  KeeperPositionLiteral,
  DefenderPositionLiteral,
  MidfielderPositionLiteral,
  ForwardPositionLiteral,
]);

// These settings are used by the card generation algorithm
// to create the cards following distributions.
export const StrikersCardSettingsSchema = z.object({
  GK_POSSESSION_MIN: z.number(),
  GK_POSSESSION_MAX: z.number(),
  DEF_POSSESSION_MIN: z.number(),
  DEF_POSSESSION_MAX: z.number(),
  MID_POSSESSION_MIN: z.number(),
  MID_POSSESSION_MAX: z.number(),
  FWD_POSSESSION_MIN: z.number(),
  FWD_POSSESSION_MAX: z.number(),
  ENDURANCE_MIN: z.number(),
  ENDURANCE_MAX: z.number(),
  SALARY_MIN: z.number(),
  SALARY_MAX: z.number(),
});

export const StrikersGameplaySettingsSchema = z.object({
  rollThresholds: z.object({
    // Tackles attempts occur when a defender moves on to the same space as the player with the ball
    // differences in control

    // To determine if successul, take the possession value of the tackling player and subtract it from the value
    // possession value of the player who has the ball. Add that to the value defined here.

    // Example:
    // defender has a POSS value of 6
    // player with ball has POSS value of 9, difference of 3
    // Value defined here is 10. Add 3 to 10 = 13.
    // Tackling player must roll 13 or higher to succeed.

    // If successful, the ball changes possession.
    TACKLE: z.object({
      value: z.number(),
    }),

    // Marking occurs when a defnder moves on to the same space as an opposing player who doesn't have the ball
    // The same roll calculation that applies to tackling applies to marking, but with typically a lower value.
    MARKING: z.object({
      value: z.number(),
    }),

    // A short pass is one that goes to a player within 1-2 spaces of the player who is passing.
    // A short pass succeeds
    // If the pass succeeds, it goes to the player as intended
    // If the pass fails, it goes to a random hex around the player.
    SHORT_PASS: z.object({
      value: z.number(),
    }),

    // A long pass is the same as a short pass but can go 3-4 spaces.
    LONG_PASS: z.object({
      value: z.number(),
    }),

    // A through pass moves in space rather than to a specific player.
    // The value here is the per-value multiple.
    // Example, value is 3, the through pass attempt is 3 spaces,
    // the player must roll 9 or higher
    // Example value is 2, through pass attempt is 5 spaces
    // the player must roll a 10 or higher
    THROUGH_PASS: z.object({
      value: z.number(),
    }),

    // Lob passes follow the same success as marking and tackling, except its possible to have
    // more than one defender.

    // Example Defneder A: has POSS 6, Defender B has POSS 8. Passer has POSS 12.
    // 6 + 8 - 12 + 10 = 12 or higher.
    LOB_PASS: z.object({
      value: z.number(),
    }),

    // Shots follow the same mechanics as through passes to determine if they are on target.
    // If the shot is successfully on target, there is a possession role versus the goal keeper and a shot chart role determine the result.
    SHOT: z.object({
      value: z.number(),
    }),
  }),
});

/**
 * Possession charts contain abilities
 * Each time a player on your team gains possession, they get to roll
 * to get a temporary bonus from the possession chart.
 *
 * The orderWeight here determiners where the ability would go on their chart
 * (usually higher values are better), and a rollWeight that determines
 * how likely it is they are to get that relative to other abilities
 *
 * order and roll weights are relative values, and thus can be any real number value
 * but are typically integers
 */
const AbilityWeightSchema = z.object({
  orderWeight: z.number().int(),
  rollWeight: z.number().int(),
});

export const StrikersPossessionChartWeightsSchema = z.object({
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

export const StrikersShotChartWeightsSchema = z.object({
  save: z.number(),
  corner: z.number(),
  deflect: z.number(),
  goal: z.number(),
});

export const StrikersPlayerCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  rosterPosition: StrikersRosterPositionSchema,
  league: z.string(),
  year: z.number(),
  possession: z.number(),
  speed: z.number(),
  endurance: z.number(),
  salary: z.number(),
  possessionChartWeights: StrikersPossessionChartWeightsSchema,
  shotChartWeights: StrikersShotChartWeightsSchema,
});

export const StrikersCardSchema = StrikersPlayerCardSchema;

export const CardIdSchema = z.string();

export const StrikersLobbyConfigSchema = z.object({
  p1SessionId: SnowflakeIdSchema,
  p2SessionId: SnowflakeIdSchema,
});

export const StrikersGameConfigDataSchema = z.object({
  lobbyConfig: StrikersLobbyConfigSchema,
  gameplaySettings: StrikersGameplaySettingsSchema,
  cardSettings: StrikersCardSettingsSchema,
  playerIds: z.array(SnowflakeIdSchema),
  cards: z.array(StrikersCardSchema),
  gameMode: z.enum(['quickplay', 'draft']).default('quickplay'),
  turnsPerHalf: z.number().default(20),
  extraTime: z.object({
    minRounds: z.number().default(2),
    maxRounds: z.number().default(6),
  }),
});
