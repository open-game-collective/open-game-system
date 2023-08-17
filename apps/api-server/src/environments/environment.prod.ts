import { envSchema } from './environment';

export const environment = envSchema.parse(process.env);
