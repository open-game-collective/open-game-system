import { z } from 'zod';
import { SnowflakeIdSchema, StateSchemaFromStateValue } from '../common';
import { EntityBaseSchema } from '../entity/base';
import { SessionSchemaTypeLiteral } from '../literals';
import { MakeRequired } from '@explorers-club/utils';
import { StateMachine } from 'xstate';

export const SessionContextSchema = z.object({
  foo: z.string(),
});

export const SessionEntityPropsSchema = z.object({
  schema: SessionSchemaTypeLiteral,
  userId: SnowflakeIdSchema.optional(),
  // name: z.string(),
});

export const SessionCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal('RECONNECT'),
  }),
  z.object({
    type: z.literal('DISCONNECT'),
  }),
]);

export const SessionStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const SessionEntitySchema = EntityBaseSchema(
  SessionEntityPropsSchema,
  SessionCommandSchema,
  SessionStateValueSchema
);


