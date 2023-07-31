import { z } from 'zod';

export const envSchema = z.object({
  PUBLIC_API_HTTP_SERVER_URL: z.string(),
  PUBLIC_API_WS_SERVER_URL: z.string(),
});
