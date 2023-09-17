import { z } from 'zod';
import { PlayerNameSchema, SlugSchema, SnowflakeIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import { UserSchemaTypeLiteral } from '../literals';
import { ChatContextSchema, ChatStateValueSchema } from '../services/chat';
import { ChatInterpreter } from '..';
import {
  ConnectCommandSchema,
  DisconnectCommandSchema,
} from '@schema/commands';

export const DevicePushSubscriptionSchema = z.object({
  deviceId: SnowflakeIdSchema,
  endpoint: z.string(),
  expirationTime: z.number().nullable().optional(),
  addedAt: z.number(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
export type DevicePushSubscription = z.infer<
  typeof DevicePushSubscriptionSchema
>;

export const UserContextSchema = z.object({
  chatServiceRef: z.custom<ChatInterpreter>().optional(),
  pushSubscriptions: z.array(DevicePushSubscriptionSchema),
});

export const UserInitializePropsSchema = z.object({
  connectionId: SnowflakeIdSchema,
  userId: SnowflakeIdSchema,
});

const UserEntityPropsSchema = z.object({
  schema: UserSchemaTypeLiteral,
  profileId: SnowflakeIdSchema.optional(),
  name: PlayerNameSchema.optional(),
  serialNumber: z.number(),
  streamIds: z.array(SnowflakeIdSchema),
  chatService: z
    .object({
      context: ChatContextSchema,
      value: ChatStateValueSchema,
    })
    .optional(),
});

export const RegisterPushSubscriptionCommandSchema = z.object({
  type: z.literal('REGISTER_PUSH_SUBSCRIPTION'),
  json: z.custom<PushSubscriptionJSON>(),
});

const UpdateNameCommandSchema = z.object({
  type: z.literal('UPDATE_NAME'),
  name: SlugSchema,
});

const CreateProfileCommandSchema = z.object({
  type: z.literal('UPDATE_PROFILE'),
  profileId: SnowflakeIdSchema,
});

const CreateStreamCommandSchema = z.object({
  type: z.literal('CREATE_STREAM'),
  roomId: SnowflakeIdSchema,
});

export const EnterChannelCommandSchema = z.object({
  type: z.literal('ENTER_CHANNEL'),
  channelId: SnowflakeIdSchema,
});

export const UserCommandSchema = z.union([
  UpdateNameCommandSchema,
  CreateProfileCommandSchema,
  CreateStreamCommandSchema,
  EnterChannelCommandSchema,
  RegisterPushSubscriptionCommandSchema,
  ConnectCommandSchema,
  DisconnectCommandSchema,
]);

export const UserStateValueSchema = z.object({
  Online: z.enum(['True', 'False']),
  Connected: z.enum(['True', 'False']),
});

export const UserEntitySchema = EntityBaseSchema(
  UserEntityPropsSchema,
  UserCommandSchema,
  UserStateValueSchema
);
