import { AnyInterpreter, StateMachine } from 'xstate';
import { z } from 'zod';
import {
  SlugSchema,
  SnowflakeIdSchema,
  StateSchemaFromStateValue,
} from '../common';
import { GameConfigurationSchema } from '../configuration';
import { EntityBaseSchema } from '../entity/base';
import { EventBaseSchema } from '../events/base';
import {
  ConnectEventTypeLiteral,
  DisconnectEventTypeLiteral,
  DebugEventTypeLiteral,
  GameIdLiteralSchema,
  JoinEventTypeLiteral,
  LeaveEventTypeLiteral,
  LogEventTypeLiteral,
  MessageEventTypeLiteral,
  RoomSchemaTypeLiteral,
} from '../literals';

export const RoomContextSchema = z.object({
  workflows: z.map(z.string(), z.custom<AnyInterpreter>()),
});
// export type RoomContext = z.infer<typeof RoomContextSchema>;

const StartCommandSchema = z.object({
  type: z.literal('START'),
});

const ConnectCommandSchema = z.object({
  type: z.literal('CONNECT'),
  senderId: SnowflakeIdSchema,
});

const DisconnectCommandSchema = z.object({
  type: z.literal('DISCONNECT'),
});

const JoinCommandSchema = z.object({
  type: z.literal('JOIN'),
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
});

export const RoomCommandSchema = z.union([
  ConnectCommandSchema,
  DisconnectCommandSchema,
  JoinCommandSchema,
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const RoomEntityPropsSchema = z.object({
  schema: RoomSchemaTypeLiteral,
  hostSessionId: SnowflakeIdSchema,
  allSessionIds: z.array(SnowflakeIdSchema),
  slug: SlugSchema,
  gameId: GameIdLiteralSchema.optional(),
  currentGameInstanceId: SnowflakeIdSchema.optional(),
  currentGameConfiguration: GameConfigurationSchema.optional(),
});

export const RoomStateValueSchema = z.object({
  Scene: z.enum(['Lobby', 'Loading', 'Game']),
  Active: z.enum(['No', 'Yes']), // Yes if there is at least 1 player currently connected
});

// type RoomStateValue = z.infer<typeof RoomStateValueSchema>;
// export type RoomMessageData = z.infer<typeof RoomMessageDataSchema>;

// const RoomMessageDataSchema = z.object({
//   sender: SnowflakeIdSchema,
//   type: MessageEventTypeLiteral,
//   content: z.string(),
// });

export const LogEventSchema = EventBaseSchema(
  LogEventTypeLiteral,
  z.object({
    level: z.enum(['DEBUG', 'INFO', 'ERROR']),
    content: z.string(),
  })
);

export const RoomEntitySchema = EntityBaseSchema(
  RoomEntityPropsSchema,
  RoomCommandSchema,
  RoomStateValueSchema
);

export const DebugEventSchema = EventBaseSchema(
  DebugEventTypeLiteral,
  z.object({
    content: z.string(),
  })
);

const ConnectMessageComponentLiteral = z.literal('CONNECT_MESSAGE');
const DisconnectMessageComponentLiteral = z.literal('DISCONNECT_MESSAGE');
const StartingGameMessageComponentLiteral = z.literal('STARTING_GAME_MESSAGE');

export const MessageComponentType = z.union([
  ConnectMessageComponentLiteral,
  DisconnectMessageComponentLiteral,
  StartingGameMessageComponentLiteral,
]);

const ConnectMessagePropsSchema = z.object({
  type: ConnectMessageComponentLiteral,
  name: z.string(),
});

const DisconnectMessagePropsSchema = z.object({
  type: DisconnectMessageComponentLiteral,
  name: z.string(),
});

const MessageContentSchema = z.discriminatedUnion('type', [
  ConnectMessagePropsSchema,
  DisconnectMessagePropsSchema,
]);

export const RoomMessageEventSchema = EventBaseSchema(
  MessageEventTypeLiteral,
  z.object({
    senderId: SnowflakeIdSchema,
    recipientId: SnowflakeIdSchema.optional(),
    contents: z.array(MessageContentSchema),
  })
);

export const RoomEventSchema = z.discriminatedUnion('type', [
  RoomMessageEventSchema,
  LogEventSchema,
  DebugEventSchema,
]);
