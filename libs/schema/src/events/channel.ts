import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import {
  DebugEventTypeLiteral,
  LogEventTypeLiteral,
  MessageEventTypeLiteral,
} from '../literals';
import { EventBaseSchema } from './base';
import { RoomEventSchema, RoomMessageEventSchema } from '@schema/lib/room';
import { StrikersGameEventSchema } from '@schema/games/strikers';

const ConnectMessageComponentLiteral = z.literal('CONNECT_MESSAGE');
const DisconnectMessageComponentLiteral = z.literal('DISCONNECT_MESSAGE');
const StartingGameMessageComponentLiteral = z.literal('STARTING_GAME_MESSAGE');

export const MessageComponentTypeSchema = z.union([
  ConnectMessageComponentLiteral,
  DisconnectMessageComponentLiteral,
  StartingGameMessageComponentLiteral,
]);

// const ConnectMessagePropsSchema = z.object({
//   type: ConnectMessageComponentLiteral,
//   name: z.string(),
// });

// const DisconnectMessagePropsSchema = z.object({
//   type: DisconnectMessageComponentLiteral,
//   name: z.string(),
// });

// const MessageContentSchema = z.discriminatedUnion('type', [
//   ConnectMessagePropsSchema,
//   DisconnectMessagePropsSchema,
// ]);

// export const MessageEventSchema = EventBaseSchema(
//   MessageEventTypeLiteral,
//   z.object({
//     sender: SnowflakeIdSchema,
//     contents: z.object({
//       sender: SnowflakeIdSchema,
//       recipient: SnowflakeIdSchema.optional(),
//       content: z.array(MessageContentSchema),
//     }),
//   })
// );

export const LogEventSchema = EventBaseSchema(
  LogEventTypeLiteral,
  z.object({
    level: z.enum(['DEBUG', 'INFO', 'ERROR']),
    content: z.string(),
  })
);

export const DebugEventSchema = EventBaseSchema(
  DebugEventTypeLiteral,
  z.object({
    content: z.string(),
  })
);

export const MessageEventSchema = z.union([
  RoomMessageEventSchema,
  StrikersGameEventSchema,
]);

export const ChannelEventSchema = z.union([
  RoomEventSchema,
  StrikersGameEventSchema,
]);
