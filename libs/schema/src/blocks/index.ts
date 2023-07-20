// import { z } from 'zod';

// // Block props schemas
// // export const PlainMessageBlockProps = z.object({
// // });

// // export const UserJoinedBlockProps = z.object({
// // });

// // export const PlayerConnectedBlockProps = z.object({
// // });

// // export const PlayerDisconnectedBlockSchema = z.object({
// // });

// // Individual block schemas
// export const PlainMessageBlockSchema = z.object({
//   type: z.literal('PlainMessage'),
//   avatarId: z.string(),
//   message: z.string(),
//   timestamp: z.string(),
//   textSize: z.number().optional(),
//   textColor: z.string().optional(),
// });

// export const UserJoinedBlockSchema = z.object({
//   type: z.literal('UserJoined'),
//   avatarId: z.string(),
//   username: z.string(),
//   timestamp: z.string(),
// });

// export const PlayerConnectedBlockSchema = z.object({
//   type: z.literal('PlayerConnected'),
//   playerId: z.string(),
//   username: z.string(),
//   timestamp: z.string(),
// });

// export const PlayerDisconnectedBlockSchema = z.object({
//   type: z.literal('PlayerDisconnected'),
//   playerId: z.string(),
//   username: z.string(),
//   timestamp: z.string(),
// });

// // Union of all block schemas
// export const MessageContentBlockSchema = z.discriminatedUnion("type", [
//   PlainMessageBlockSchema,
//   UserJoinedBlockSchema,
//   PlayerConnectedBlockSchema,
//   PlayerDisconnectedBlockSchema,
// ]);
