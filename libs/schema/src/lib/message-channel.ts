import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import { ChannelEventSchema, MessageEventSchema } from '../events/channel';
import {
  MessageChannelSchemaTypeLiteral,
  MessageEventTypeLiteral,
} from '../literals';

// const ChannelEventTypeSchema = z.union([
//   LogEventTypeLiteral,
//   JoinEventTypeLiteral,
//   MessageEventTypeLiteral,
//   LeaveEventTypeLiteral,
// ]);

const PlainMessageTemplateSchema = z.object({
  messageType: MessageEventTypeLiteral,
  contentTemplate: z.string(),
});

export const MessageTemplateSchema = PlainMessageTemplateSchema;

const MessageChannelEntityPropsSchema = z.object({
  schema: MessageChannelSchemaTypeLiteral,
  messageIds: z.array(SnowflakeIdSchema),
  eventsById: z.record(ChannelEventSchema),
  userId: SnowflakeIdSchema,
  channelId: SnowflakeIdSchema,
  tsOffset: z.number().optional(), // not used yet? todo split out offsets
});

const TypingCommandSchema = z.object({
  type: z.literal('TYPE'),
});

export const MessageChannelCommandSchema = TypingCommandSchema;

export const MessageChannelStateValueSchema = z.object({
  Initialized: z.enum(['Running', 'Error']), // todo
});

export const MessageChannelEntitySchema = EntityBaseSchema(
  MessageChannelEntityPropsSchema,
  MessageChannelCommandSchema,
  MessageChannelStateValueSchema
);

export const MessageChannelContextSchema = z.object({
  foo: z.string(),
});
