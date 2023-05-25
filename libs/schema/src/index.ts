/* eslint-disable @typescript-eslint/ban-types */
import { Database } from '@explorers-club/database';
import { IndexByType, MakeRequired } from '@explorers-club/utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Operation } from 'fast-json-patch';
import {
  ActorRefFrom,
  AnyEventObject,
  InterpreterFrom,
  StateMachine,
  StateSchema,
  StateValue,
} from 'xstate';
import { z } from 'zod';

const SlugSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-z0-9-]+$/);

// export const ClubRoomIdSchema = z.custom<`club-${string}`>((val) => {
//   return /^club-\w+$/.test(val as string);
// });
// export const TriviaJamRoomIdSchema = z.custom<`trivia_jam-${string}`>((val) => {
//   return /^trivia_jam-\w+$/.test(val as string);
// });
// export const CodebreakersRoomIdSchema = z.custom<`codebreakers-${string}`>(
//   (val) => {
//     return /^codebreakers-\w+$/.test(val as string);
//   }
// );
// export const DiffusionaryRoomIdSchema = z.custom<`diffusionary-${string}`>(
//   (val) => {
//     return /^diffusionary-\w+$/.test(val as string);
//   }
// );
// export const LittleVigilanteRoomIdSchema =
//   z.custom<`little_vigilante-${string}`>((val) => {
//     return /^little_vigilante-\w+$/.test(val as string);
//   });

// export type TriviaJamRoomId = z.infer<typeof TriviaJamRoomIdSchema>;
// export type DiffusionaryRoomId = z.infer<typeof DiffusionaryRoomIdSchema>;
// export type LittleVigilanteRoomId = z.infer<typeof LittleVigilanteRoomIdSchema>;
// export type CodebreakersRoomId = z.infer<typeof CodebreakersRoomIdSchema>;

// export type GameState =
//   | TriviaJamState
//   | DiffusionaryState
//   | LittleVigilanteState
//   | CodebreakersState;

// export type GameRoomId =
//   | TriviaJamRoomId
//   | DiffusionaryRoomId
//   | LittleVigilanteRoomId
//   | CodebreakersRoomId;

export type NewRoomServiceId = 'new-room-service';

export type ServiceId = NewRoomServiceId;

// export type ClubMetadata = {
//   clubName: string;
// };

// export const TriviaJamConfigSchema = z
//   .object({
//     gameId: z.literal('trivia_jam').default('trivia_jam'),
//     minPlayers: z.literal(3).default(3),
//     maxPlayers: z.number().max(250).default(250),
//     questionSetEntryId: z.string().default('dSX6kC0PNliXTl7qHYJLH'),
//   })
//   .required();

// export type TriviaJamConfig = z.infer<typeof TriviaJamConfigSchema>;

// export const DiffusionaryConfigSchema = z
//   .object({
//     gameId: z.literal('diffusionary').default('diffusionary'),
//     minPlayers: z.literal(4).default(4),
//     maxPlayers: z.number().int().min(4).max(10).default(10),
//   })
//   .required();

// export type DiffusionaryConfig = z.infer<typeof DiffusionaryConfigSchema>;

// export const LittleVigilanteConfigSchema = z
//   .object({
//     gameId: z.literal('little_vigilante').default('little_vigilante'),
//     minPlayers: z.literal(4).default(4),
//     maxPlayers: z.number().int().min(4).max(10).default(10),
//     discussionTimeSeconds: z.number().int().min(10).max(600).default(180),
//     roundsToPlay: z.number().int().min(1).max(999).default(5),
//     votingTimeSeconds: z.number().int().default(20),
//     rolesToExclude: z.array(z.string()).default([]),
//   })
//   .required();

// export type LittleVigilanteConfig = z.infer<typeof LittleVigilanteConfigSchema>;

// export const CodebreakersConfigSchema = z
//   .object({
//     gameId: z.literal('codebreakers').default('codebreakers'),
//     minPlayers: z.literal(4).default(4),
//     maxPlayers: z.number().int().min(4).max(10).default(10),
//   })
//   .required();

// export type CodebreakersConfig = z.infer<typeof CodebreakersConfigSchema>;

export const SnowflakeIdSchema = z.string();
export type SnowflakeId = z.infer<typeof SnowflakeIdSchema>;

export const UserIdSchema = SnowflakeIdSchema;
export type UserId = z.infer<typeof UserIdSchema>;
export const ECEpochTimestampSchema = z.number();
export type ECEpochTimestamp = z.infer<typeof ECEpochTimestampSchema>;

export const ClubNameSchema = z.string();

export const PlayerNameSchema = z.string();

const LitlteVigilanteGameId = z.literal('little_vigilante');
const CodebreakersGameId = z.literal('codebreakers');
const TradersGameId = z.literal('traders');
const GameConfigurationSchema = z.discriminatedUnion('gameId', [
  z.object({
    gameId: LitlteVigilanteGameId,
    data: z.object({
      numPlayers: z.number().min(4).max(4),
    }),
  }),
  z.object({
    gameId: CodebreakersGameId,
    data: z.object({
      numPlayers: z.number().min(4).max(4),
    }),
  }),
  z.object({
    gameId: TradersGameId,
    data: z.object({
      numPlayers: z.number().min(4).max(4),
    }),
  }),
]);

const GameIdSchema = z.enum(['little_vigilante', 'codebreakers', 'traders']);
export type GameId = z.infer<typeof GameIdSchema>;

const StateValueSchema: z.ZodType<StateValue> = z.union([
  z.string(),
  z.record(z.lazy(() => StateValueSchema)),
]);
export type AnyStateValue = z.infer<typeof StateValueSchema>;

const UserSchemaTypeLiteral = z.literal('user');
const SessionSchemaTypeLiteral = z.literal('session');
const ConnectionSchemaTypeLiteral = z.literal('connection');
const RoomSchemaTypeLiteral = z.literal('room');

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

// export const SchemaLiteralsSchema = z.union([
//   // UserSchemaTypeLiteral,
//   // RoomSchemaTypeLiteral,
//   // SessionSchemaTypeLiteral,
//   ConnectionSchemaTypeLiteral,
//   // StagingRoomSchemaTypeLiteral,
//   // LittleVigilanteRoomSchemaTypeLiteral,
//   // UserSchemaTypeLiteral,
//   // SessionSchemaTypeLiteral,
//   // DeviceSchemaTypeLiteral,
// ]);
export const SchemaLiteralsSchema = z.union([
  ConnectionSchemaTypeLiteral,
  SessionSchemaTypeLiteral,
]);
export type SchemaType = z.infer<typeof SchemaLiteralsSchema>;

// Define a generic schema for the store
const StoreSchema = <State, Event extends { type: string }>(
  stateSchema: z.ZodSchema<State>,
  eventSchema: z.ZodSchema<Event>
) => {
  return z.object({
    id: z.string(),
    subscribe: z
      .function()
      .args(z.function().args().returns(z.void()))
      .returns(z.function().returns(z.void())),
    send: z.function().args(eventSchema).returns(z.void()),
    getSnapshot: z.function().returns(stateSchema),
  });
};

// Define separate Zod schemas for each event type
const DisconnectEventSchema = z.object({ type: z.literal('DISCONNECT') });
const ReconnectEventSchema = z.object({ type: z.literal('RECONNECT') });

// Create a union schema that combines the event schemas
export const ConnectionEventSchema = z.union([
  DisconnectEventSchema,
  ReconnectEventSchema,
]);

// Define the base Event type with a "type" string parameter
// export const EventBaseSchema = z.object({
//   type: z.string(),
// });
// export type EventBase = z.infer<typeof EventBaseSchema>;

// Define a custom Zod schema for the send function
// const SendFunctionSchema = z.lazy(() =>
//   z.function().args(EventBaseSchema).returns(z.void())
// );

// const SubscribeFunctionSchema = z
//   .function()
//   .args(z.function().args().returns(z.void()))
//   .returns(z.function().args().returns(z.void()));

// const ConnectionStoreSchema = StoreSchema(
//   ConnectionStateSchema,
//   ConnectionEventSchema
// );

// const EntityBaseSchema = z.object({
//   id: SnowflakeIdSchema,
// });
// export type EntityBase = z.infer<typeof EntityBaseSchema>;

// const UserEntitySchema = EntityBaseSchema.extend({
//   schema: UserSchemaTypeLiteral,
// });

// type UserEntity = z.infer<typeof UserEntitySchema>;

// // Define a custom Zod schema for the send function
const SendFunctionSchema = <TEvent extends AnyEventObject>(
  eventSchema: z.ZodSchema<TEvent>
) => z.function().args(eventSchema).returns(z.void());

const CallbackFunctionSchema = <TCommand extends AnyEventObject>(
  commandSchema: z.ZodSchema<TCommand>
) => z.function().args(EntityEventSchema(commandSchema)).returns(z.void());

export type InitialEntityProps<TEntity extends Entity> = Omit<
  TEntity,
  'id' | 'subscribe' | 'send' | 'states' | 'command' | 'context' | 'children'
>;

// export type EntityDataKey = Omit<keyof InitialEntityProps<Entity>, 'schema'>;

// const StatesFrom = // TODO implement

// const ContextFrom = <TTypeState extends Typestate<any>>(typeStateSchema: z.ZodSchema<TTypeState>) => {
//   return typeStateSchema.
// }

const EntityBaseSchema = <
  TEntityProps extends z.ZodRawShape,
  TCommand extends AnyEventObject,
  TStates extends z.ZodRawShape
>(
  entityPropsSchema: z.ZodObject<TEntityProps>,
  commandSchema: z.ZodSchema<TCommand>,
  stateSchema: z.ZodObject<TStates>
  // contextSchema: z.ZodSchema<any>
) =>
  entityPropsSchema.merge(
    z.object({
      id: SnowflakeIdSchema,
      send: SendFunctionSchema(commandSchema),
      states: stateSchema,
      command: commandSchema,
      subscribe: z
        .function()
        .args(CallbackFunctionSchema(commandSchema))
        .returns(z.function().returns(z.void())), // The subscribe function returns an unsubscribe function
    })
  );

export type SyncedEntityProps<TEntity extends Entity> = Omit<
  TEntity,
  'subscribe' | 'send'
>;

export type EntityListEvent =
  | { type: 'ADDED'; entities: SyncedEntityProps<Entity>[] }
  | { type: 'REMOVED'; entities: SyncedEntityProps<Entity>[] }
  | {
      type: 'CHANGED';
      changedEntities: { id: SnowflakeId; patches: Operation[] }[];
    };

const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export type ChatMachine = StateMachine<
  ChatContext,
  ChatStateSchema,
  ChatCommand
>;

export type ConnectionContext = {
  supabaseClient?: SupabaseClient<Database>;
  chatServiceRef?: ActorRefFrom<ChatMachine>;
};

export type InitializedConnectionContext = MakeRequired<
  ConnectionContext,
  'supabaseClient'
>;

export type InitializedConnectionEntity = MakeRequired<
  ConnectionEntity,
  'sessionId' | 'userId' | 'authTokens' | 'deviceId'
>;

// CONNECTION ENTITY
export type ConnectionTypeState =
  | {
      value: 'Initialized';
      context: InitializedConnectionContext;
    }
  | {
      value: 'Unitialized';
      context: ConnectionContext;
    };

export const ConnectionInitializeInputSchema = z.object({
  deviceId: SnowflakeIdSchema.optional(),
  initialLocation: z.string(),
  authTokens: AuthTokensSchema.optional(),
});

export const RouteNameSchema = z.enum([
  'Home',
  'NewRoom',
  'Room',
  'Login',
  'NotFound',
]);

export type RouteName = z.infer<typeof RouteNameSchema>;

const ConnectionStateValueSchema = z.object({
  Initialized: z.enum(['True', 'False', 'Initializing', 'Error']),
  Route: RouteNameSchema,
});

type ConnectionStateValue = z.infer<typeof ConnectionStateValueSchema>;

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

type StateSchemaFromStateValue<T> = StateSchema & {
  states: NestedStates<T>;
};

export type ConnectionStateSchema =
  StateSchemaFromStateValue<ConnectionStateValue>;

const ConnectionInitializeCommandSchema =
  ConnectionInitializeInputSchema.extend({
    type: z.literal('INITIALIZE'),
  });

// Define the shape of your context
interface MyContext {
  count: number;
}

// Define the shape of your event
type MyEvent = { type: 'INCREMENT' } | { type: 'DECREMENT' };

// Define the shape of your state schema
interface MyStateSchema {
  states: {
    active: {
      states: {
        yes: {};
        no: {};
      };
    };
    inactive: {};
  };
}

// todo, how do i expose typed interfaces here for the services?
// Create the state machine
// const connectionMachine = Machine<MyContext, MyStateSchema, MyEvent>({
//   id: 'connectionMachine',
//   initial: 'inactive',
//   context: {
//     count: 0,
//   },
//   states: {
//     inactive: {
//       on: {
//         INCREMENT: {
//           target: 'active',
//           actions: assign<MyContext>({
//             count: (context, event) => context.count + 1,
//           }),
//         },
//       },
//     },
//     active: {
//       on: {
//         DECREMENT: {
//           target: 'inactive',
//           actions: assign({
//             count: (context, event) => context.count - 1,
//           }),
//         },
//       },
//     },
//   },
// });
// type ConnectionMachine = typeof connectionMachine;

// export type SessionMachineSchema = MachineSchema<SessionContext, SessionEvent>;
export type ConnectionMachine = StateMachine<
  ConnectionContext,
  ConnectionStateSchema,
  ConnectionCommand
>;
// export type ConnectionState = StateFrom<ConnectionMachine>;
// export type ConnectionInterpreter = InterpreterFrom<ConnectionMachine>;

// export type SessionContext = {
//   foo?: string;
// };

export type SessionTypeState = {
  value: 'Active';
  context: MakeRequired<SessionContext, 'foo'>;
};
export type SessionStateSchema = StateSchemaFromStateValue<SessionStateValue>;

export type SessionMachine = StateMachine<
  SessionContext,
  SessionStateSchema,
  SessionCommand
>;

// type ModificationEvent =
//   | { type: 'ARRAY_ADD'; index: number; value: any }
//   | { type: 'ARRAY_REMOVE'; index: number; value: any }
//   | { type: 'SET_ADD'; value: any }
//   | { type: 'SET_DELETE'; value: any }
//   | { type: 'MAP_SET'; key: any; value: any }
//   | { type: 'MAP_DELETE'; key: any }
//   | { type: 'OBJECT_SET'; key: PropertyKey; value: any }
//   | { type: 'OBJECT_DELETE'; key: PropertyKey };

// z.union([
//   z.object({
//     type: z.literal('CHANGE'),
//     property: entitySchema.keyof(),
//     value: z.any(),
//     prevValue: z.any(),
//   }),
// EntityPropArrayAddEventSchema(entitySchema),
// EntityPropArrayRemoveEventSchema(entitySchema),
// EntityPropSetAddEventSchema(entitySchema),
// EntityPropSetDeleteEventSchema(entitySchema),
// EntityPropMapSetEventSchema(entitySchema),
// EntityPropMapDeleteEventSchema(entitySchema),
// EntityPropObjectSetEventSchema(entitySchema),
// EntityPropObjectDeleteEventSchema(entitySchema),
// ]);

// EntityPropArrayAddEventSchema(entitySchema),
// EntityPropArrayRemoveEventSchema(entitySchema),
// EntityPropSetAddEventSchema(entitySchema),
// EntityPropSetDeleteEventSchema(entitySchema),
// EntityPropMapSetEventSchema(entitySchema),
// EntityPropMapDeleteEventSchema(entitySchema),
// EntityPropObjectSetEventSchema(entitySchema),
// EntityPropObjectDeleteEventSchema(entitySchema),

// export type EntityPropChangeDelta<TEntity extends Entity> = {
//   property: keyof TEntity;
//   value: TEntity[keyof TEntity];
//   prevValue: TEntity[keyof TEntity];
// };

// type EntityPropArrayAddEvent<TEntity> = {
//   [K in keyof TEntity]: TEntity[K] extends Array<infer TElement> ? {
//     type: 'ARRAY_ADD';
//     prop: K;
//     index: number;
//     value: TElement;
//   } : never;
// }[keyof TEntity];

const EntitySendTriggerEventSchema = <TEvent extends AnyEventObject>(
  commandSchema: z.ZodSchema<TEvent>
) =>
  z.object({
    type: z.literal('SEND_TRIGGER'),
    command: commandSchema,
  });

const EntitySendErrorEventSchema = <TEvent extends AnyEventObject>(
  commandSchema: z.ZodSchema<TEvent>
) =>
  z.object({
    type: z.literal('SEND_ERROR'),
    command: commandSchema,
  });

const EntitySendCompleteEventSchema = <TEvent extends AnyEventObject>(
  commandSchema: z.ZodSchema<TEvent>
) =>
  z.object({
    type: z.literal('SEND_COMPLETE'),
    command: commandSchema,
  });

const EntityTransitionStateEventSchema = z.object({
  type: z.literal('TRANSITION'),
});

const EntityChangeEventSchema = z.object({
  type: z.literal('CHANGE'),
  patches: z.array(z.custom<Operation>()),
});

const EntityEventSchema = <TEvent extends AnyEventObject>(
  commandSchema: z.ZodSchema<TEvent>
) =>
  z.union([
    EntitySendCompleteEventSchema(commandSchema),
    EntitySendErrorEventSchema(commandSchema),
    EntitySendTriggerEventSchema(commandSchema),
    EntityChangeEventSchema,
    EntityTransitionStateEventSchema,
  ]);

// ------------ User Entity Definition ------------
const UserContextSchema = z.object({
  foo: z.string(),
});

export const UserInitializePropsSchema = z.object({
  connectionId: SnowflakeIdSchema,
  userId: SnowflakeIdSchema,
});

const UserEntityPropsSchema = z.object({
  schema: UserSchemaTypeLiteral,
  userId: SnowflakeIdSchema.optional(),
  name: PlayerNameSchema.optional(),
  discriminator: z.number().default(0),
  sessionId: SnowflakeIdSchema,
  connections: z.array(
    z.object({
      id: SnowflakeIdSchema,
      createdAt: z.date(),
      connected: z.boolean(),
    })
  ),
});

export type UserContext = {
  foo: string;
};

export interface UserStateSchema extends StateSchema<UserContext> {
  states: {
    Online: {
      states: {
        [K in UserStateValue['Online']]: {};
      };
    };
  };
}

const UserCommandSchema = z.object({
  type: z.literal('ADD_CONNECTION'),
  connectionId: SnowflakeIdSchema,
});
export type UserCommand = z.infer<typeof UserCommandSchema>;

export type UserMachine = StateMachine<
  UserContext,
  UserStateSchema,
  UserCommand
>;
export type UserInterpreter = InterpreterFrom<UserMachine>;

const UserStateValueSchema = z.object({
  Online: z.enum(['True', 'False']),
});

type UserStateValue = z.infer<typeof UserStateValueSchema>;

const UserTypeStateSchema = z.union([
  z.object({ value: z.literal('Connected.True'), context: UserContextSchema }),
  z.object({ value: z.literal('Connected.False'), context: UserContextSchema }),
  z.object({ value: z.literal('Ready.True'), context: UserContextSchema }),
  z.object({ value: z.literal('Ready.False'), context: UserContextSchema }),
]);
export type UserTypeState = z.infer<typeof UserTypeStateSchema>;

// export const UserEntitySchema = EntityBaseSchema(
//   UserEntityPropsSchema,
//   UserCommandSchema,
//   UserTypeStateSchema
// );
// export type UserEntity = z.infer<typeof UserEntitySchema>;

// ------------ Room Entity ------------
const RoomContextSchema = z.object({
  foo: z.string(),
});
export type RoomContext = z.infer<typeof RoomContextSchema>;

// const SailorsGameStateContextSchema = z.object({
//   playerIds
// })

const SailorsGameOptionSchema = z.object({
  playerIds: z.array(SnowflakeIdSchema),
});

const SailorsGameStateConfigSchema = z.object({});

const SailorsGameStateSchema = z.object({
  config: SailorsGameStateConfigSchema,
  playerIds: z.array(SnowflakeIdSchema),
});

const RoomEntityPropsSchema = z.object({
  schema: RoomSchemaTypeLiteral,
  ownerHostId: SnowflakeIdSchema,
  connectedPlayerIds: z.array(SnowflakeIdSchema),
  url: z.string().url(),
  selectedGame: GameIdSchema,
  sailorsGameOptions: SailorsGameOptionSchema,
  sailorsGameState: SailorsGameStateSchema,
});

const RoomCommandSchema = z.union([
  z.object({
    type: z.literal('JOIN'),
  }),
  z.object({
    type: z.literal('LEAVE'),
  }),
  z.object({
    type: z.literal('START_GAME'),
  }),
]);

const RoomTypeStateSchema = z.union([
  z.object({ value: z.literal('Empty.True'), context: RoomContextSchema }),
  z.object({ value: z.literal('Empty.False'), context: RoomContextSchema }),
  z.object({ value: z.literal('Ready.True'), context: RoomContextSchema }),
  z.object({ value: z.literal('Ready.False'), context: RoomContextSchema }),
]);
export type RoomTypeState = z.infer<typeof RoomTypeStateSchema>;

export type RoomCommand = z.infer<typeof RoomCommandSchema>;

// EntityBaseSchema()

// const RoomEntitySchema = EntityBaseSchema.extend({
//   schema: RoomSchemaTypeLiteral,
// });

// EntityBaseSchema

// export const RoomEntitySchema = EntityBaseSchema(
//   RoomEntityPropsSchema,
//   RoomCommandSchema,
//   RoomTypeStateSchema
// );
// export type RoomMachine = StateMachine<
//   RoomContext,
//   RoomCommand
// >;
// export type RoomEntity = z.infer<typeof RoomEntitySchema>;

// // ------------ Session Entity ------------
const SessionContextSchema = z.object({
  foo: z.string(),
});
export type SessionContext = z.infer<typeof SessionContextSchema>;

const SessionEntityPropsSchema = z.object({
  schema: SessionSchemaTypeLiteral,
  userId: UserIdSchema,
});

const SessionCommandSchema = z.union([
  z.object({
    type: z.literal('RECONNECT'),
  }),
  z.object({
    type: z.literal('DISCONNECT'),
  }),
]);
export type SessionCommand = z.infer<typeof SessionCommandSchema>;

const SessionStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
export type SessionStateValue = z.infer<typeof SessionStateValueSchema>;

export const SessionEntitySchema = EntityBaseSchema(
  SessionEntityPropsSchema,
  SessionCommandSchema,
  SessionStateValueSchema
  // SessionContextSchema
);

// export interface SessionStateSchema extends StateSchema<SessionContext> {
//   states: {
//     Active: {
//       states: {
//         [K in SessionStateValue['Active']]: {};
//       };
//     };
//   };
// }

// export type SessionStateMachine = StateMachine<
//   SessionContext,
//   SessionStateSchema,
//   SessionCommand
// >;

export type SessionEntity = z.infer<typeof SessionEntitySchema>;
const GameListStateValueSchema = z.enum(['Initializing', 'Loaded']);

export type GameListStateValue = z.infer<typeof GameListStateValueSchema>;

export type GameListStateSchema = StateSchemaFromStateValue<GameListStateValue>;

const GameListContextSchema = z.object({
  gameInstanceIds: z.array(SnowflakeIdSchema),
});
export type GameListContext = z.infer<typeof GameListContextSchema>;

const GameListCommandSchema = z.object({
  type: z.literal('REFRESH'),
});
export type GameListCommand = z.infer<typeof GameListCommandSchema>;

export type GameListMachine = StateMachine<
  GameListContext,
  GameListStateSchema,
  GameListCommand
>;

const NewRoomStateValueSchema = z.enum([
  'SelectGame',
  'EnterName',
  'Configure',
  'Complete',
]);

export type NewRoomStateValue = z.infer<typeof NewRoomStateValueSchema>;

export type NewRoomStateSchema = StateSchemaFromStateValue<NewRoomStateValue>;

const ChatStateValueSchema = z.enum(['Initializing', 'Loaded']);

export type ChatStateValue = z.infer<typeof ChatStateValueSchema>;

export type ChatStateSchema = StateSchemaFromStateValue<ChatStateValue>;

const ChatContextSchema = z.object({
  roomSlug: z.string(),
});
export type ChatContext = z.infer<typeof ChatContextSchema>;

const ChatCommandSchema = z.union([
  z.object({
    type: z.literal('TYPE'),
  }),
  z.object({
    type: z.literal('SEND'),
    message: z.string(),
  }),
]);
export type ChatCommand = z.infer<typeof ChatCommandSchema>;

const NewRoomContextSchema = z.object({
  roomSlug: z.string().optional(),
  gameId: GameIdSchema.optional(),
  gameConfiguration: GameConfigurationSchema.optional(),
});
export type NewRoomContext = z.infer<typeof NewRoomContextSchema>;

const NewRoomCommandSchema = z.union([
  z.object({
    type: z.literal('SELECT_GAME'),
    gameId: GameIdSchema,
  }),
  z.object({
    type: z.literal('SUBMIT_NAME'),
    name: z.string(),
  }),
  z.object({
    type: z.literal('CONFIGURE_GAME'),
    configuration: GameConfigurationSchema,
  }),
]);
export type NewRoomCommand = z.infer<typeof NewRoomCommandSchema>;

export type NewRoomMachine = StateMachine<
  NewRoomContext,
  NewRoomStateSchema,
  NewRoomCommand
>;

// export type NewRoomState = State<
//   NewRoomContext,
//   NewRoomCommand,
//   NewRoomStateSchema,
//   | { value: 'EnterName'; context: NewRoomContext }
//   | { value: 'SelectingGame'; context: NewRoomContext }
// >;
export type NewRoomService = InterpreterFrom<NewRoomMachine>;

const LayoutIslandSchema = z.enum(['MainScene', 'MainPanel', 'Chat']);
export type LayoutIsland = z.infer<typeof LayoutIslandSchema>;

export const LayoutPropsSchema = z.object({
  focusArea: LayoutIslandSchema.optional(),
});
export type LayoutProps = z.infer<typeof LayoutPropsSchema>;

const ConnectionEntityPropsSchema = z.object({
  schema: ConnectionSchemaTypeLiteral,
  sessionId: SnowflakeIdSchema.optional(),
  userId: SnowflakeIdSchema.optional(),
  authTokens: AuthTokensSchema.optional(),
  deviceId: SnowflakeIdSchema.optional(),
  currentRoomSlug: SlugSchema.optional(),
  connectedRoomSlugs: z.array(SlugSchema),
  activeRoomSlugs: z.array(SlugSchema),
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
  gameListService: z
    .object({
      context: GameListContextSchema,
      value: GameListStateValueSchema,
    })
    .optional(),
  instanceId: z.string().uuid().optional(),
});
export type ConnectionEntityProps = z.infer<typeof ConnectionEntityPropsSchema>;

type Service = {
  context: unknown;
  value: unknown;
  event: unknown;
};

type IsService<T, K> = T extends Service ? K : never;

export type EntityServices<T extends Entity> = {
  [K in keyof T as IsService<T[K], K>]: T[K];
};

export type EntityServiceKeys<TEntity extends Entity> =
  keyof EntityServices<TEntity>;

const ConnectionHeartbeatCommandSchema = z.object({
  type: z.literal('HEARTBEAT'),
});

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

const ConnectionNavigateCommandSchema = z.object({
  type: z.literal('NAVIGATE'),
  route: RoutePropsSchema,
});

const BaseConnectionCommandSchema = z.union([
  ConnectionInitializeCommandSchema,
  ConnectionHeartbeatCommandSchema,
  ConnectionNavigateCommandSchema,
]);

const ConnectionCommandSchema = z.union([
  BaseConnectionCommandSchema,
  NewRoomCommandSchema,
]);
export type ConnectionCommand = z.infer<typeof ConnectionCommandSchema>;

// export type ConnectionStateMachine = StateMachine<
//   ConnectionContext,
//   ConnectionStateSchema,
//   ConnectionCommand
// >;

// EntityBaseSchema.ex

const ConnectionEntitySchema = EntityBaseSchema(
  ConnectionEntityPropsSchema,
  ConnectionCommandSchema,
  ConnectionStateValueSchema
  // ConnectionContextSchema
);

// export const ConnectionEntitySchema = EntityBaseSchema.extend({
//   state: ConnectionStateValueSchema,
//   // send
//   // subscribe
// });
//   ConnectionEntityPropsSchema,
//   ConnectionCommandSchema,
//   ConnectionContextSchema,
//   ConnectionStateValueSchema
// );
export type ConnectionEntity = z.infer<typeof ConnectionEntitySchema>;

export const EntitySchema = z.union([
  ConnectionEntitySchema,
  SessionEntitySchema,
]);
export type Entity = z.infer<typeof EntitySchema>;
export type EntityEvent = Parameters<Parameters<Entity['subscribe']>[0]>[0];

export const EntityCommandSchema = z.union([
  ConnectionCommandSchema,
  SessionCommandSchema,
]);

export const EntitySchemas = {
  // user: UserEntitySchema,
  // room: RoomEntitySchema,
  session: SessionEntitySchema,
  connection: ConnectionEntitySchema,
};

// export function isEntity(entity: unknown): entity is Entity {
//   return EntitySchema.safeParse(entity).success;
// }

export const ClientEventSchema = z.object({
  id: SnowflakeIdSchema,
  senderId: SnowflakeIdSchema,
  command: z.union([RoomCommandSchema, UserCommandSchema]),
});

export type ClientEvent = z.infer<typeof ClientEventSchema>;

// const ConnectionEntityDeltaSchema = EntityPropChangeDeltaSchema(
//   ConnectionEntityPropsSchema
// );
// const RoomEntityDeltaSchema = EntityPropChangeDeltaSchema(
//   RoomEntityPropsSchema
// );
// const SessionEntityDeltaSchema = EntityPropChangeDeltaSchema(
//   SessionEntityPropsSchema
// );
// export const UserEntityDeltaSchema = EntityPropChangeDeltaSchema(
//   UserEntityPropsSchema
// );

// export const EntityPropsSchema = z.union([
//   RoomEntityPropsSchema,
//   // UserEntityPropsSchema,
//   // SessionEntityPropsSchema,
//   ConnectionEntityPropsSchema,
// ]);

// RoomEntityPropsSchema;

// type ConnectionEntityDelta = z.infer<typeof ConnectionEntityDeltaSchema>;
// type UserEntityDelta = z.infer<typeof UserEntityDeltaSchema>;
// type RoomEntityDelta = z.infer<typeof RoomEntityDeltaSchema>;
// type SessionEntityDelta = z.infer<typeof SessionEntityDeltaSchema>;

// export type EntityDelta =
//   | ConnectionEntityDelta
//   | UserEntityDelta
//   | RoomEntityDelta
//   | SessionEntityDelta;

// export type EntityDelta =
//   | {
//       type: 'session';
//       delta: SessionEntityDelta;
//     }
//   | {
//       type: 'room';
//       delta: RoomEntityDelta;
//     }
//   | {
//       type: 'connection';
//       delta: ConnectionEntityDelta;
//     }
//   | {
//       type: 'user';
//       delta: UserEntityDelta;
//     };

// export type EntityDeltaMap = IndexByType<EntityDelta>;

// type EntityChangeDelta<TEntity extends Entity> = {
//   property: keyof TEntity;
//   value: TEntity[keyof TEntity];
//   prevValue: TEntity[keyof TEntity];
// };

export type EntityMachine =
  | {
      type: 'connection';
      machine: ConnectionMachine;
    }
  | {
      type: 'user';
      machine: UserMachine;
    }
  // | {
  //     type: 'room';
  //     machine: RoomMachine;
  //   }
  | {
      type: 'session';
      machine: SessionMachine;
    };

export type EntityMachineMap = IndexByType<EntityMachine>;
