import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';

export const EventBaseSchema = <
  TType extends string,
  TEventProps extends z.ZodRawShape
>(
  typeLiteral: z.ZodLiteral<TType>,
  eventPropsSchema: z.ZodObject<TEventProps>
) =>
  eventPropsSchema.merge(
    z.object({
      id: SnowflakeIdSchema,
      type: typeLiteral,
      channelId: SnowflakeIdSchema,
    })
  );
