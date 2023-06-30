import { SnowflakeIdSchema } from '../common';
import { z } from 'zod';
import { RoomCommandSchema } from '../lib/room';
import { UserCommandSchema } from '../lib/user';

export const ClientEventSchema = z.object({
  id: SnowflakeIdSchema,
  senderId: SnowflakeIdSchema,
  command: z.union([RoomCommandSchema, UserCommandSchema]),
});
