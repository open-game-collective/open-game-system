import { StateMachine } from 'xstate';
import { z } from 'zod';
import { UserIdSchema, SnowflakeIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import {
  CodebreakersGameIdLiteral,
  CodebreakersGameSchemaTypeLiteral,
  CodebreakersPlayerSchemaTypeLiteral,
} from '../literals';

// const CodebreakersEventSchema = MessageEventSchema;

const CodebreakersGameEntityPropSchema = z.object({
  schema: CodebreakersGameSchemaTypeLiteral,
  gameId: CodebreakersGameIdLiteral,
  playerEntityIds: z.array(SnowflakeIdSchema),
  roomEntityId: SnowflakeIdSchema,
});

export const CodebreakersGameStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

const StartCommandSchema = z.object({
  type: z.literal('START'),
  connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
  connectionEntityId: SnowflakeIdSchema,
});

export const CodebreakersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const CodebreakersGameEntitySchema = EntityBaseSchema(
  CodebreakersGameEntityPropSchema,
  CodebreakersGameCommandSchema,
  CodebreakersGameStateValueSchema
);

export const CodebreakersGameContextSchema = z.object({
  foo: z.string(),
});

export const CodebreakersPlayerEntityPropSchema = z.object({
  schema: CodebreakersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
});

export const CodebreakersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const CodebreakersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const CodebreakersPlayerEntitySchema = EntityBaseSchema(
  CodebreakersPlayerEntityPropSchema,
  CodebreakersPlayerCommandSchema,
  CodebreakersPlayerStateValueSchema
);

export const CodebreakersPlayerContextSchema = z.object({
  foo: z.string(),
});
