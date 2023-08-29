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
      senderId: SnowflakeIdSchema,
      recipientId: SnowflakeIdSchema.optional(),
      channelId: SnowflakeIdSchema,

      // the id of the entity that response commands should be sent to
      // by default events to the channelId but this allows it to be changed
      responderId: SnowflakeIdSchema.optional(),
    })
  );
