import { StateSchema } from 'xstate';
import type { Params } from 'astro';
import { z } from 'zod';

export const PlayerNameSchema = z.string();

type EnumKeys<T> = T extends z.ZodEnum<infer R> ? Extract<R, string> : never;

type NestedState<T> = T extends z.ZodObject<infer R>
  ? {
      [K in keyof R]: {
        states: NestedStates<R[K]>;
      };
    }
  : {
      [P in EnumKeys<T>]: {};
    };

type NestedStates<T> = {
  [K in keyof T]: NestedState<T[K]>;
};

export type StateSchemaFromStateValue<T> = StateSchema & {
  states: NestedStates<T>;
};

export const SnowflakeIdSchema = z.string();

export const SlugSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-z0-9-]+$/);

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const UserIdSchema = SnowflakeIdSchema;
export type UserId = z.infer<typeof UserIdSchema>;

export const ECEpochTimestampSchema = z.number();
export type ECEpochTimestamp = z.infer<typeof ECEpochTimestampSchema>;

const LayoutIslandSchema = z.enum(['MainScene', 'MainPanel', 'Chat']);
export type LayoutIsland = z.infer<typeof LayoutIslandSchema>;

export const LayoutPropsSchema = z.object({
  focusArea: LayoutIslandSchema.optional(),
});

export const RouteNameSchema = z.enum([
  'Home',
  'New',
  'Room',
  'Login',
  'NotFound',
  'Uninitialized',
]);

export const HomeRoutePropsSchema = z.object({
  name: z.literal('Home'),
});

export const LoginRoutePropsSchema = z.object({
  name: z.literal('Login'),
});

export const NewRoutePropsSchema = z.object({
  name: z.literal('New'),
});

export const RoomRoutePropsSchema = z.object({
  name: z.literal('Room'),
  roomSlug: z.string(),
});

export const RoutePropsSchema = z.union([
  HomeRoutePropsSchema,
  NewRoutePropsSchema,
  RoomRoutePropsSchema,
  LoginRoutePropsSchema,
]);

export const PageParamsSchema = z.union([
  HomeRoutePropsSchema,
  NewRoutePropsSchema,
  RoomRoutePropsSchema,
  LoginRoutePropsSchema,
]);

export const ConnectionAccessTokenPropsSchema = z.object({
  sub: SnowflakeIdSchema,
  deviceId: SnowflakeIdSchema,
  sessionId: SnowflakeIdSchema,
  initialRouteProps: RoutePropsSchema,
  url: z.string().url(),
});

export const SessionAccessOneTimeTokenPropsSchema = z.object({
  sub: SnowflakeIdSchema,
  jwtid: z.literal('ONE'),
});
