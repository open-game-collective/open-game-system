import { Observable } from 'rxjs';
import { StateMachine } from 'xstate';
import { z } from 'zod';
import { SnowflakeIdSchema, UserIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import {
  LittleVigilanteGameIdLiteral,
  LittleVigilanteGameSchemaTypeLiteral,
  LittleVigilantePlayerSchemaTypeLiteral,
} from '../literals';

const LittleVigilanteGameMessageSchema = z.object({
  id: SnowflakeIdSchema,
  type: z.literal('PLAIN_MESSAGE'),
  senderEntityId: SnowflakeIdSchema,
  message: z.string(),
});

const LittleVigilanteGameEntityPropSchema = z.object({
  schema: LittleVigilanteGameSchemaTypeLiteral,
  gameId: LittleVigilanteGameIdLiteral,
  playerEntityIds: z.array(SnowflakeIdSchema),
  roomEntityId: SnowflakeIdSchema,
  channel: z.custom<Observable<MessageEvent>>(),
});

export const LittleVigilanteGameStateValueSchema = z.object({
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

export const LittleVigilanteGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);


export const LittleVigilanteGameEntitySchema = EntityBaseSchema(
  LittleVigilanteGameEntityPropSchema,
  LittleVigilanteGameCommandSchema,
  LittleVigilanteGameStateValueSchema
);

export const LittleVigilanteGameContextSchema = z.object({
  foo: z.string(),
});

const LittleVigilantePlayerEntityPropSchema = z.object({
  schema: LittleVigilantePlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
});

export const LittleVigilantePlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const LittleVigilantePlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const LittleVigilantePlayerEntitySchema = EntityBaseSchema(
  LittleVigilantePlayerEntityPropSchema,
  LittleVigilantePlayerCommandSchema,
  LittleVigilantePlayerStateValueSchema
);

export const LittleVigilantePlayerContextSchema = z.object({
  foo: z.string(),
});
