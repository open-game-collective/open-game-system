import { z } from 'zod';

export const envSchema = z.object({
  PUBLIC_VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
});

export const environment = envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}