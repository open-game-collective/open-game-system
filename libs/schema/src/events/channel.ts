import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import {
  DebugEventTypeLiteral,
  JoinEventTypeLiteral,
  LeaveEventTypeLiteral,
  LogEventTypeLiteral,
  MessageEventTypeLiteral,
} from '../literals';
import { EventBaseSchema } from './base';

export const MessageEventSchema = EventBaseSchema(
  MessageEventTypeLiteral,
  z.object({
    sender: SnowflakeIdSchema,
    content: z.string(),
  })
);

export const LogEventSchema = EventBaseSchema(
  LogEventTypeLiteral,
  z.object({
    level: z.enum(['DEBUG', 'INFO', 'ERROR']),
    content: z.string(),
  })
);

export const JoinEventSchema = EventBaseSchema(
  JoinEventTypeLiteral,
  z.object({
    subjectId: SnowflakeIdSchema,
  })
);

export const LeaveEventSchema = EventBaseSchema(
  LeaveEventTypeLiteral,
  z.object({
    subjectId: SnowflakeIdSchema,
  })
);

export const DebugEventSchema = EventBaseSchema(
  DebugEventTypeLiteral,
  z.object({
    content: z.string(),
  })
);

export const ChannelEventSchema = z.union([
  LogEventSchema,
  MessageEventSchema,
  JoinEventSchema,
  LeaveEventSchema,
  DebugEventSchema,
]);
