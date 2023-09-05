import { SnowflakeIdSchema } from '@schema/common';
import { EntityBaseSchema } from '@schema/entity/base';
import { StreamSchemaTypeLiteral } from '@schema/literals';
import { z } from 'zod';

const StreamEntityPropsSchema = z.object({
  schema: StreamSchemaTypeLiteral,
  hostId: SnowflakeIdSchema,
  token: z.string(),
  name: z.string(),
});

// The HLS server will send these commands over HTTP
export const StreamCommandSchema = z.object({ type: z.literal('ERROR') });

export const StreamStateValueSchema = z.object({
  Online: z.enum(['True', 'False']),
  Error: z.enum(['None', 'Unknown']),
  //   Connected: z.enum(['True', 'False']),
});

export const StreamEntitySchema = EntityBaseSchema(
  StreamEntityPropsSchema,
  StreamCommandSchema,
  StreamStateValueSchema
);

export const StreamContextSchema = z.object({
  foo: z.string(),
});
