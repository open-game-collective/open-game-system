import { InterpreterFrom, StateMachine } from 'xstate';
import { z } from 'zod';
import { GameConfigurationSchema } from '../configuration';
import { GameIdLiteralSchema } from '../literals';
import { StateSchemaFromStateValue } from '../common';

export const NewRoomContextSchema = z.object({
  roomSlug: z.string().optional(),
  gameId: GameIdLiteralSchema.optional(),
  gameConfiguration: GameConfigurationSchema.optional(),
});

const ConfigureCommandSchema = z.object({
  type: z.literal('CONFIGURE_GAME'),
  configuration: GameConfigurationSchema,
});
const SubmitNameCommandSchema = z.object({
  type: z.literal('SUBMIT_NAME'),
  name: z.string(),
});
const SelectGameCommandSchema = z.object({
  type: z.literal('SELECT_GAME'),
  gameId: GameIdLiteralSchema,
});

export const NewRoomCommandSchema = z.union([
  SelectGameCommandSchema,
  SubmitNameCommandSchema,
  ConfigureCommandSchema,
]);

export const NewRoomStateValueSchema = z.enum([
  'SelectGame',
  'EnterName',
  'Configure',
  'Complete',
]);