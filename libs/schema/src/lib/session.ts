import { z } from 'zod';
import { SnowflakeIdSchema, StateSchemaFromStateValue } from '../common';
import { EntityBaseSchema } from '../entity/base';
import { SessionSchemaTypeLiteral } from '../literals';
import { SomeRequired } from '@explorers-club/utils';
import { StateMachine } from 'xstate';
import {
  ConnectCommandSchema,
  DisconnectCommandSchema,
} from '@schema/commands';

export const SessionContextSchema = z.object({
  foo: z.string(),
});

export const SessionEntityPropsSchema = z.object({
  schema: SessionSchemaTypeLiteral,
  userId: SnowflakeIdSchema,
  connectionIds: z.array(SnowflakeIdSchema),
  // name: z.string(),
});

export const SessionCommandSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('NEW_CONNECTION'),
    connectionId: z.string(),
  }),
  ConnectCommandSchema,
  DisconnectCommandSchema,
]);

export const SessionStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const SessionEntitySchema = EntityBaseSchema(
  SessionEntityPropsSchema,
  SessionCommandSchema,
  SessionStateValueSchema
);
