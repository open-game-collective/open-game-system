import { z } from 'zod';

// Block props schemas
export const PlainMessageBlockProps = z.object({
  avatarId: z.string(),
  message: z.string(),
  timestamp: z.string(),
  textSize: z.number().optional(),
  textColor: z.string().optional(),
});

export const UserJoinedBlockProps = z.object({
  avatarId: z.string(),
  username: z.string(),
  timestamp: z.string(),
});

export const PlayerConnectedBlockProps = z.object({
  playerId: z.string(),
  username: z.string(),
  timestamp: z.string(),
});

export const PlayerDisconnectedBlockProps = z.object({
  playerId: z.string(),
  username: z.string(),
  timestamp: z.string(),
});

// Individual block schemas
const PlainMessageBlockSchema = z.object({
  type: z.literal('PlainMessage'),
  props: PlainMessageBlockProps,
});

const UserJoinedBlockSchema = z.object({
  type: z.literal('UserJoined'),
  props: UserJoinedBlockProps,
});

const PlayerConnectedBlockSchema = z.object({
  type: z.literal('PlayerConnected'),
  props: PlayerConnectedBlockProps,
});

const PlayerDisconnectedBlockSchema = z.object({
  type: z.literal('PlayerDisconnected'),
  props: PlayerDisconnectedBlockProps,
});

// Union of all block schemas
export const MessageContentBlockSchema = z.union([
  PlainMessageBlockSchema,
  UserJoinedBlockSchema,
  PlayerConnectedBlockSchema,
  PlayerDisconnectedBlockSchema,
]);
