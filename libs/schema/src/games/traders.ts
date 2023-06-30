import { Observable } from 'rxjs';
import { StateMachine } from 'xstate';
import { z } from 'zod';
import { SnowflakeIdSchema, UserIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import {
  BananaTradersGameIdLiteral,
  BananaTradersGameSchemaTypeLiteral,
  BananaTradersPlayerSchemaTypeLiteral,
} from '../literals';

const StartCommandSchema = z.object({
  type: z.literal('START'),
  connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
  connectionEntityId: SnowflakeIdSchema,
});

const BananaTradersGameEntityPropSchema = z.object({
  schema: BananaTradersGameSchemaTypeLiteral,
  gameId: BananaTradersGameIdLiteral,
  playerEntityIds: z.array(SnowflakeIdSchema),
  roomEntityId: SnowflakeIdSchema,
});

export const BananaTradersGameStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
});


export const BananaTradersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const BananaTradersGameEntitySchema = EntityBaseSchema(
  BananaTradersGameEntityPropSchema,
  BananaTradersGameCommandSchema,
  BananaTradersGameStateValueSchema
);

export const BananaTradersGameContextSchema = z.object({
  foo: z.string(),
});

const BananaTradersPlayerEntityPropSchema = z.object({
  schema: BananaTradersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
  channel: z.custom<Observable<MessageEvent>>(),
});

export const BananaTradersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const BananaTradersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const BananaTradersPlayerEntitySchema = EntityBaseSchema(
  BananaTradersPlayerEntityPropSchema,
  BananaTradersPlayerCommandSchema,
  BananaTradersPlayerStateValueSchema
);

export const BananaTradersPlayerContextSchema = z.object({
  foo: z.string(),
});
