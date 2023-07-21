import { z } from 'zod';
import { PlayerNameSchema, SlugSchema, SnowflakeIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import { UserSchemaTypeLiteral } from '../literals';

export const UserContextSchema = z.object({
  foo: z.string(),
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
});

const UpdateNameCommandSchema = z.object({
  type: z.literal('UPDATE_NAME'),
  name: SlugSchema,
});

const CreateProfileCommandSchema = z.object({
  type: z.literal('UPDATE_PROFILE'),
  profileId: SnowflakeIdSchema,
});

export const UserCommandSchema = z.union([
  UpdateNameCommandSchema,
  CreateProfileCommandSchema,
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
