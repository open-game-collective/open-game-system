// schema/game-configuration
//
// Game configuration schemas should be considered the
// structure of static data that is required to power
// how the game runs, but never changes onces the game strats.
// Data that exists only for the state of the game should
// be modeled in schema/game.

// Examples: minPlayers, cardData, triviaQuestionSetId, characterNames
import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import { StrikersPlayerCardSchema } from './strikers';

export const CodebreakersGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

export const LittleVigilanteGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

export const BananTradersGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

export const StrikersGameConfigDataSchema = z.object({
  cards: StrikersPlayerCardSchema,
  init: z.object({
    gameMode: z.enum(['quickplay', 'draft']),
    homePlayerSessionId: SnowflakeIdSchema,
    awayPlayerSessionId: SnowflakeIdSchema,
  }),
});
