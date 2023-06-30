import { z } from 'zod';
import {
  AuthTokensSchema,
  SlugSchema,
  SnowflakeIdSchema,
  StateSchemaFromStateValue,
} from '../common';
import { EntityBaseSchema } from '../entity/base';
import { ConnectionSchemaTypeLiteral, GameIdLiteralSchema } from '../literals';
import { ChatContextSchema, ChatStateValueSchema } from '../services/chat';
import {
  NewRoomCommandSchema,
  NewRoomContextSchema,
  NewRoomStateValueSchema,
} from '../services/new-room';

export const HomeRoutePropsSchema = z.object({
  name: z.literal('Home'),
});

export const LoginRoutePropsSchema = z.object({
  name: z.literal('Login'),
});

export const NewRoomRoutePropsSchema = z.object({
  name: z.literal('NewRoom'),
});

export const RoomRoutePropsSchema = z.object({
  name: z.literal('Room'),
  roomSlug: z.string(),
});

export const RoutePropsSchema = z.union([
  HomeRoutePropsSchema,
  NewRoomRoutePropsSchema,
  RoomRoutePropsSchema,
  LoginRoutePropsSchema,
]);
export type RouteProps = z.infer<typeof RoutePropsSchema>;

const RouteNameSchema = z.enum([
  'Home',
  'NewRoom',
  'Room',
  'Login',
  'NotFound',
  'Uninitialized',
]);

export type RouteName = z.infer<typeof RouteNameSchema>;

export const GeolocationStateSchema = z.enum([
  'Initialized',
  'Uninitialized',
  'Error',
  'Denied',
]);

const ConnectionStateValueSchema = z.object({
  Initialized: z.enum(['True', 'False', 'Initializing', 'Error']),
  Route: RouteNameSchema,
  Geolocation: GeolocationStateSchema,
});

type ConnectionStateValue = z.infer<typeof ConnectionStateValueSchema>;

export type ConnectionStateSchema =
  StateSchemaFromStateValue<ConnectionStateValue>;

export const ConnectionInitializeInputSchema = z.object({
  deviceId: SnowflakeIdSchema.optional().nullable(),
  initialRouteProps: RoutePropsSchema,
  authTokens: AuthTokensSchema.optional().nullable(),
});

const ConnectionNavigateCommandSchema = z.object({
  type: z.literal('NAVIGATE'),
  route: RoutePropsSchema,
});

const ConnectionInitializeCommandSchema =
  ConnectionInitializeInputSchema.extend({
    type: z.literal('INITIALIZE'),
  });

const UpdateGeolocationPositionCommandSchema = z.object({
  type: z.literal('UPDATE_GEOLOCATION_POSITION'),
  position: z.custom<GeolocationPosition>().optional(),
});

const ConnectionHeartbeatCommandSchema = z.object({
  type: z.literal('HEARTBEAT'),
});

const BaseConnectionCommandSchema = z.union([
  ConnectionInitializeCommandSchema,
  ConnectionHeartbeatCommandSchema,
  ConnectionNavigateCommandSchema,
  UpdateGeolocationPositionCommandSchema,
]);

const ConfigureCommandSchema = z.object({
  type: z.literal('CONFIGURE_GAME'),
  configuration: z.any(),
  // configuration: GameConfigurationSchema,
});
const SubmitNameCommandSchema = z.object({
  type: z.literal('SUBMIT_NAME'),
  name: z.string(),
});
const SelectGameCommandSchema = z.object({
  type: z.literal('SELECT_GAME'),
  gameId: GameIdLiteralSchema,
});

export const ConnectionCommandSchema = z.union([
  BaseConnectionCommandSchema,
  NewRoomCommandSchema,
  // todo other commands here, workflows, etc
]);

// const ChatContextSchema = z.object({
//   channelEntityIds: z.record(SnowflakeIdSchema, SnowflakeIdSchema),
// });
// export type ChatContext = z.infer<typeof ChatContextSchema>;

// const ChatStateValueSchema = z.enum(['Initializing', 'Loaded']);

// export type ChatStateValue = z.infer<typeof ChatStateValueSchema>;

// export type ChatStateSchema = StateSchemaFromStateValue<ChatStateValue>;

const JoinChannelCommandSchema = z.object({
  type: z.literal('JOIN_CHANNEL'),
  channelId: SnowflakeIdSchema,
});

// const LeaveChannelCommandSchema = z.object({
//   type: z.literal('LEAVE_CHANNEL'),
//   channelId: SnowflakeIdSchema,
// });

// const ChatCommandSchema = z.union([
//   JoinChannelCommandSchema,
//   LeaveChannelCommandSchema,
// ]);
// export type ChatCommand = z.infer<typeof ChatCommandSchema>;

// export type ChatMachine = StateMachine<
//   ChatContext,
//   ChatStateSchema,
//   ChatCommand
// >;

// const NewRoomContextSchema = z.object({
//   roomSlug: z.string().optional(),
//   gameId: GameIdLiteralSchema.optional(),
//   gameConfiguration: GameConfigurationSchema.optional(),
// });
// export type NewRoomContext = z.infer<typeof NewRoomContextSchema>;

// const NewRoomStateValueSchema = z.enum([
//   'SelectGame',
//   'EnterName',
//   'Configure',
//   'Complete',
// ]);

// export type NewRoomStateValue = z.infer<typeof NewRoomStateValueSchema>;

const ConnectionEntityPropsSchema = z.object({
  schema: ConnectionSchemaTypeLiteral,
  sessionId: SnowflakeIdSchema.optional(),
  authTokens: AuthTokensSchema.optional(),
  deviceId: SnowflakeIdSchema.optional(),
  currentRoomSlug: SlugSchema.optional(),
  connectedRoomSlugs: z.array(SlugSchema),
  activeRoomSlugs: z.array(SlugSchema),
  currentGeolocation: z.custom<GeolocationPosition>().optional(),
  chatService: z
    .object({
      context: ChatContextSchema,
      value: ChatStateValueSchema,
    })
    .optional(),
  newRoomService: z
    .object({
      context: NewRoomContextSchema,
      value: NewRoomStateValueSchema,
    })
    .optional(),
  instanceId: z.string().uuid().optional(),
});

// type ConnectionEntityProps = z.infer<typeof ConnectionEntityPropsSchema>;

export const ConnectionEntitySchema = EntityBaseSchema(
  ConnectionEntityPropsSchema,
  ConnectionCommandSchema,
  ConnectionStateValueSchema
);

// export type InitializedConnectionContext = MakeRequired<
//   ConnectionContext,
//   'supabaseClient'
// >;

// export type ConnectionContext = {
//   supabaseClient?: SupabaseClient<Database>;
//   chatServiceRef?: ChatInterpreter;
// };

// const ConnectionCommandSchema = z.union([
//   BaseConnectionCommandSchema,
//   NewRoomCommandSchema,
//   UpdateGeolocationPositionCommandSchema,
// ]);
// export type ConnectionCommand = z.infer<typeof ConnectionCommandSchema>;
