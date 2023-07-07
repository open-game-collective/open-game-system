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
import { StrikersLobbyConfigSchema } from './strikers';

export const CodebreakersGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

export const LittleVigilanteGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

export const BananTradersGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

// Union of configs that are needed for a game before it is created
// Usually determines who is in the game and what their "slots" are
export const LobbyGameConfigSchema = StrikersLobbyConfigSchema;