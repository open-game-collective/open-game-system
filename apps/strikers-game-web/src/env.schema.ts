import { z } from 'zod';

export const envSchema = z.object({
  RAILWAY_SERVICE_APP_API_SERVER_URL: z.string(),
  RAILWAY_SERVICE_APP_STRIKERS_GAME_WEB_URL: z.string(),
});
