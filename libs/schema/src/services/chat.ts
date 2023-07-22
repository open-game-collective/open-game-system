import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import { EnterChannelCommandSchema } from '@schema/lib/user';

// type ChannelMachine =
//   | LittleVigilanteChannelMachine
//   | BananaTradersChannelMachine
//   | RoomChannelMachine
//   | DirectChannelMachine
//   | GroupChannelMachine;

export const ChatContextSchema = z.object({
  channelEntityIds: z.record(SnowflakeIdSchema, SnowflakeIdSchema),
});

// const JoinChannelCommandSchema = z.object({
//   type: z.literal('JOIN_CHANNEL'),
//   channelId: SnowflakeIdSchema,
// });

const LeaveChannelCommandSchema = z.object({
  type: z.literal('LEAVE_CHANNEL'),
  channelId: SnowflakeIdSchema,
});

export const ChatCommandSchema = z.union([
  EnterChannelCommandSchema,
  LeaveChannelCommandSchema,
]);

export const ChatStateValueSchema = z.enum(['Initializing', 'Loaded']);
