/* eslint-disable @typescript-eslint/ban-types */
import { Database } from '@explorers-club/database';
import { IndexByType, MakeRequired } from '@explorers-club/utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Operation } from 'fast-json-patch';
import { Observable } from 'rxjs';
import {
  AnyEventObject,
  AnyInterpreter,
  InterpreterFrom,
  StateMachine,
  StateSchema,
  StateValue,
  createMachine,
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

export type ChatServiceId = 'chat-service';

export type ServiceId = NewRoomServiceId | ChatServiceId;

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

// type RoomMessage = z.infer<typeof RoomMessageSchema>;

export const SnowflakeIdSchema = z.string();
export type SnowflakeId = z.infer<typeof SnowflakeIdSchema>;

export const UserIdSchema = SnowflakeIdSchema;
export type UserId = z.infer<typeof UserIdSchema>;
export const ECEpochTimestampSchema = z.number();
export type ECEpochTimestamp = z.infer<typeof ECEpochTimestampSchema>;

export const ClubNameSchema = z.string();

export const PlayerNameSchema = z.string();

const LittleVigilanteGameId = z.literal('little_vigilante');
const CodebreakersGameId = z.literal('codebreakers');
const BananaTradersGameId = z.literal('banana_traders');

const CodebreakersGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

const LittleVigilanteGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

const BananTradersGameConfigDataSchema = z.object({
  numPlayers: z.number().min(4).max(4),
});

const GameConfigurationSchema = z.discriminatedUnion('gameId', [
  z.object({
    gameId: LittleVigilanteGameId,
    data: LittleVigilanteGameConfigDataSchema,
  }),
  z.object({
    gameId: CodebreakersGameId,
    data: CodebreakersGameConfigDataSchema,
  }),
  z.object({
    gameId: BananaTradersGameId,
    data: BananTradersGameConfigDataSchema,
  }),
]);

const GameIdSchema = z.enum([
  'little_vigilante',
  'codebreakers',
  'banana_traders',
]);
export type GameId = z.infer<typeof GameIdSchema>;

const StateValueSchema: z.ZodType<StateValue> = z.union([
  z.string(),
  z.record(z.lazy(() => StateValueSchema)),
]);
export type AnyStateValue = z.infer<typeof StateValueSchema>;

// Entity Schema types
const UserSchemaTypeLiteral = z.literal('user');
const SessionSchemaTypeLiteral = z.literal('session');
const WorkflowSchemaTypeLiteral = z.literal('workflow');
const ConnectionSchemaTypeLiteral = z.literal('connection');
const RoomSchemaTypeLiteral = z.literal('room');
const MessageChannelSchemaTypeLiteral = z.literal('message_channel');
const BananaTradersGameSchemaTypeLiteral = z.literal('banana_traders_game');
const BananaTradersPlayerSchemaTypeLiteral = z.literal('banana_traders_player');
const LittleVigilanteGameSchemaTypeLiteral = z.literal('little_vigilante_game');
const LittleVigilantePlayerSchemaTypeLiteral = z.literal(
  'little_vigilante_player'
);
const CodebreakersGameSchemaTypeLiteral = z.literal('codebreakers_game');
const CodebreakersPlayerSchemaTypeLiteral = z.literal('codebreakers_player');
const TriggerSchemaTypeLiteral = z.literal('trigger');
const ChannelWorkflowLiteral = z.literal('channel_workflow');

const TriggerEventTemplateDataTypeLiteral = z.literal('trigger_event');
const TriggerEntityTemplateDataTypeLiteral = z.literal('trigger_entity');
const TriggerEventSubjectTemplateDataTypeLiteral = z.literal(
  'trigger_event_subject'
);
const TriggerMetadataTemplateDataTypeLiteral = z.literal('trigger_metadata');
const WorkflowEventTemplateDataTypeLiteral = z.literal('workflow_event');

export const TemplateDataTypeLiteralSchema = z.union([
  TriggerEventTemplateDataTypeLiteral,
  TriggerEntityTemplateDataTypeLiteral,
  TriggerEventSubjectTemplateDataTypeLiteral,
  TriggerMetadataTemplateDataTypeLiteral,
  WorkflowEventTemplateDataTypeLiteral,
]);

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

// Message Schemas
// const LittleVigilanteMessageDataSchema = z.object({
//   type: z.literal('PLAIN'),
//   content: z.string(),
// });

// type LittleVigilanteMessageData = z.infer<
//   typeof LittleVigilanteMessageDataSchema
// >;

// const LittleVigilanteMessageSchema = z.object({
//   type: LittleVigilanteGameSchemaTypeLiteral,
//   data: LittleVigilanteMessageDataSchema,
// });

// const CodebreakersMessageDataSchema = z.object({
//   type: z.literal('PLAIN'),
//   content: z.string(),
// });

// const CodebreakersMessageSchema = z.object({
//   type: CodebreakersGameSchemaTypeLiteral,
//   data: CodebreakersMessageDataSchema,
// });

// type CodebreakersMessage = z.infer<typeof CodebreakersMessageSchema>;

// type CodebreakersMessageData = z.infer<typeof CodebreakersMessageSchema>;

// const BananaTradersMessageDataSchema = z.object({
//   type: z.literal('PLAIN'),
//   content: z.string(),
// });

// type BananaTradersMessageData = z.infer<typeof BananaTradersMessageDataSchema>;

// const BananaTradersMessageSchema = z.object({
//   type: BananaTradersGameSchemaTypeLiteral,
//   data: BananaTradersMessageDataSchema,
// });

// type BananaTradersMessage = z.infer<typeof BananaTradersMessageSchema>;

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

export type EntityTypeMap = {
  connection: ConnectionEntity;
  session: SessionEntity;
  room: RoomEntity;
  user: UserEntity;
  message_channel: MessageChannelEntity;
  // workflow: WorkflowEntity;
  codebreakers_game: CodebreakersGameEntity;
  codebreakers_player: CodebreakersPlayerEntity;
  banana_traders_game: BananaTradersGameEntity;
  banana_traders_player: BananaTradersPlayerEntity;
  little_vigilante_game: LittleVigilanteGameEntity;
  little_vigilante_player: LittleVigilantePlayerEntity;
  trigger: TriggerEntity;
};

const EntitySchemaLiteralsSchema = z.union([
  ConnectionSchemaTypeLiteral,
  SessionSchemaTypeLiteral,
  RoomSchemaTypeLiteral,
  UserSchemaTypeLiteral,
  MessageChannelSchemaTypeLiteral,
  WorkflowSchemaTypeLiteral,
  TriggerSchemaTypeLiteral,
]);

export type EntitySchemaType = keyof typeof EntitySchemas;

// export type EntitySchemaType = z.infer<typeof EntitySchemaLiteralsSchema>;

const LogEventTypeLiteral = z.literal('LOG');
const MessageEventTypeLiteral = z.literal('MESSAGE');
const JoinEventTypeLiteral = z.literal('JOIN');
const LeaveEventTypeLiteral = z.literal('LEAVE');

// const RoomChannelTypeLiteral = z.literal('room_channel');
// const DirectChannelTypeLiteral = z.literal('direct_channel');
// const GroupChannelTypeLiteral = z.literal('group_channel');
// const LittleVigilanteChannelTypeLiteral = z.literal('little_vigilante_channel');
// const BananaTradersChannelTypeLiteral = z.literal('banana_traders_channel');
// const CodebreakersChannelTypeLiteral = z.literal('codebreakers_channel');

// const ChannelTypeSchema = z.union([
//   RoomChannelTypeLiteral,
//   DirectChannelTypeLiteral,
//   GroupChannelTypeLiteral,
//   LittleVigilanteChannelTypeLiteral,
//   BananaTradersChannelTypeLiteral,
//   CodebreakersChannelTypeLiteral
// ]);

// export type ChannelType = z.infer<typeof ChannelTypeSchema>;

// export const MessageTypeSchema = z.union([
//   PlainMessageTypeLiteral,
//   JoinMessageTypeLiteral,
//   LeaveMessageTypeLiteral,
// ]);
// export type MessageType = z.infer<typeof MessageTypeSchema>;

// Define a generic schema for the store
// const StoreSchema = <State, Event extends { type: string }>(
//   stateSchema: z.ZodSchema<State>,
//   eventSchema: z.ZodSchema<Event>
// ) => {
//   return z.object({
//     id: z.string(),
//     subscribe: z
//       .function()
//       .args(z.function().args().returns(z.void()))
//       .returns(z.function().returns(z.void())),
//     send: z.function().args(eventSchema).returns(z.void()),
//     getSnapshot: z.function().returns(stateSchema),
//   });
// };

const CommandHandlerSchema = z.object({
  command: z.string(),
});

const TemplateHandlerSchema = z.object({
  onChange: z.record(CommandHandlerSchema).optional(),
  onConfirm: z.record(CommandHandlerSchema).optional(),
  onSubmit: z.record(CommandHandlerSchema).optional(),
  onPress: z.record(CommandHandlerSchema).optional(),
});

const ChannelWorkflowContextSchema = z.object({
  workflowId: z.string().uuid(),
  entities: z.object({
    user: SnowflakeIdSchema,
    channel: SnowflakeIdSchema,
  }),
});
export type ChannelWorkflowContext = z.infer<
  typeof ChannelWorkflowContextSchema
>;

// export type ChannelTriggerContext = {
//   userId: SnowflakeId;
//   channelId: SnowflakeId;
// };

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

// export const EventBaseSchema = z.object({
//   type: z.string(),
// });

const EventBaseSchema = <
  TType extends string,
  TEventProps extends z.ZodRawShape
>(
  typeLiteral: z.ZodLiteral<TType>,
  eventPropsSchema: z.ZodObject<TEventProps>
) =>
  eventPropsSchema.merge(
    z.object({
      id: SnowflakeIdSchema,
      type: typeLiteral,
      channelId: SnowflakeIdSchema,
    })
  );

const LogEventSchema = EventBaseSchema(
  LogEventTypeLiteral,
  z.object({
    level: z.enum(['DEBUG', 'INFO', 'ERROR']),
    content: z.string(),
  })
);

export type LogEvent = z.infer<typeof LogEventSchema>;

const MessageEventSchema = EventBaseSchema(
  MessageEventTypeLiteral,
  z.object({
    sender: SnowflakeIdSchema,
    content: z.string(),
  })
);
export type MessageEvent = z.infer<typeof MessageEventSchema>;

const JoinEventSchema = EventBaseSchema(
  JoinEventTypeLiteral,
  z.object({
    subject: SnowflakeIdSchema,
  })
);
export type JoinEvent = z.infer<typeof JoinEventSchema>;

const LeaveEventSchema = EventBaseSchema(
  LeaveEventTypeLiteral,
  z.object({
    subject: SnowflakeIdSchema,
  })
);
export type LeaveEvent = z.infer<typeof LeaveEventSchema>;

const ChannelEventSchema = z.union([
  LogEventSchema,
  MessageEventSchema,
  JoinEventSchema,
  LeaveEventSchema,
]);

export type ChannelEvent = z.infer<typeof ChannelEventSchema>;

export type CreateEventProps<TEvent extends ChannelEvent> = Omit<
  TEvent,
  'id' | 'channelId'
>;

// // Define a custom Zod schema for the send function
const SendFunctionSchema = <TCommand extends AnyEventObject>(
  commandSchema: z.ZodSchema<TCommand>
) => z.function().args(commandSchema).returns(z.void());

const CallbackFunctionSchema = <TCommand extends AnyEventObject>(
  commandSchema: z.ZodSchema<TCommand>
) => z.function().args(EntityEventSchema(commandSchema)).returns(z.void());

export type InitialEntityProps<TEntity extends Entity> = Omit<
  TEntity,
  | 'id'
  | 'subscribe'
  | 'send'
  | 'states'
  | 'command'
  | 'context'
  | 'children'
  | 'channel'
>;

// export type EntityDataKey = Omit<keyof InitialEntityProps<Entity>, 'schema'>;

// const StatesFrom = // TODO implement

// const ContextFrom = <TTypeState extends Typestate<any>>(typeStateSchema: z.ZodSchema<TTypeState>) => {
//   return typeStateSchema.
// }

const EntityBaseSchema = <
  TEntityProps extends z.ZodRawShape,
  TCommand extends AnyEventObject,
  TStates extends z.ZodRawShape,
  TEvent extends AnyEventObject
>(
  entityPropsSchema: z.ZodObject<TEntityProps>,
  commandSchema: z.ZodSchema<TCommand>,
  stateSchema: z.ZodObject<TStates>,
  eventSchema: z.ZodSchema<TEvent>
) =>
  entityPropsSchema.merge(
    z.object({
      id: SnowflakeIdSchema,
      send: SendFunctionSchema(commandSchema),
      states: stateSchema,
      command: commandSchema,
      channel: z.custom<Observable<typeof eventSchema>>(),
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

export type ChatInterpreter = InterpreterFrom<ChatMachine>;

export type ConnectionContext = {
  supabaseClient?: SupabaseClient<Database>;
  chatServiceRef?: ChatInterpreter;
};

export type InitializedConnectionContext = MakeRequired<
  ConnectionContext,
  'supabaseClient'
>;

export type InitializedConnectionEntity = MakeRequired<
  ConnectionEntity,
  'sessionId' | 'authTokens' | 'deviceId'
>;

export type ConnectionTypeState =
  | {
      value: 'Initialized';
      context: InitializedConnectionContext;
    }
  | {
      value: 'Unitialized';
      context: ConnectionContext;
    };

export const RouteNameSchema = z.enum([
  'Home',
  'NewRoom',
  'Room',
  'Login',
  'NotFound',
  'Uninitialized',
]);

export type RouteName = z.infer<typeof RouteNameSchema>;

const GeolocationStateSchema = z.enum([
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

export type MessageChannelStateSchema =
  StateSchemaFromStateValue<MessageChannelStateValue>;

export type RoomStateSchema = StateSchemaFromStateValue<RoomStateValue>;

const MessageChannelContextSchema = z.object({
  foo: z.string(),
});
export type MessageChannelContext = z.infer<typeof MessageChannelContextSchema>;

export type MessageChannelMachine = StateMachine<
  MessageChannelContext,
  MessageChannelStateSchema,
  MessageChannelCommand
>;

export type RoomMachine = StateMachine<
  RoomContext,
  RoomStateSchema,
  RoomCommand
>;

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

export type TriggerStateSchema = StateSchemaFromStateValue<TriggerStateValue>;

export type TriggerMachine = StateMachine<
  TriggerContext,
  TriggerStateSchema,
  TriggerCommand
>;

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

// const EntityMessageEventSchema = <TMessage extends AnyEventObject>(
//   messageSchema: z.ZodSchema<TMessage>
// ) =>
//   z.object({
//     type: z.literal('MESSAGE'),
//     message: messageSchema,
//   });

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

// ------- Triggers & Workflows -----------
// const TriggerBaseSchema = <TTriggerProps extends z.ZodRawShape>(
//   triggerPropsSchema: z.ZodObject<TTriggerProps>
// ) =>
//   triggerPropsSchema.merge(
//     z.object({
//       metadata: z.record(z.any()),
//     })
//   );

const TriggerDataSchema = z.discriminatedUnion('triggerType', [
  z.object({
    triggerType: z.literal('room_trigger'),
    entityIds: z.object({
      room: SnowflakeIdSchema,
      session: SnowflakeIdSchema,
    }),
  }),
  z.object({
    triggerType: z.literal('command_trigger'),
  }),
  z.object({
    triggerType: z.literal('webhook_trigger'),
    metadata: z.any(),
  }),
]);

export type TriggerData = z.infer<typeof TriggerDataSchema>;

// const RoomTriggerDataSchema = TriggerBaseSchema(
//   z.object({
//     triggerType: z.literal('room_trigger'),
//     entityIds: z.object({
//       room: SnowflakeIdSchema,
//       session: SnowflakeIdSchema,
//     }),
//   })
// );
// const CommandTriggerDataSchema = TriggerBaseSchema(
//   z.object({
//     triggerType: z.literal('command_trigger'),
//   })
// );
// const WebhookTriggerDataSchema = TriggerBaseSchema(
//   z.object({
//     triggerType: z.literal('webhook_trigger'),
//   })
// );
// const ScheduledTriggerDataSchema = TriggerBaseSchema(
//   z.object({
//     triggerType: z.literal('scheduled_trigger'),
//   })
// );

// const TriggerDataSchema = z.union([
//   RoomTriggerDataSchema,
//   CommandTriggerDataSchema,
//   WebhookTriggerDataSchema,
//   ScheduledTriggerDataSchema,
// ]);

// export type TriggerData = z.infer<typeof TriggerDataSchema>;

// // ------------ Trigger Entity Definition ------------
// const TriggerContextSchema = z.object({
//   foo: z.string(),
// });

// export type TriggerContext = z.infer<typeof TriggerContextSchema>;

// const TriggerEntityPropsSchema = z.object({
//   schema: TriggerSchemaTypeLiteral,
//   workflowIds: z.array(SnowflakeIdSchema),
//   // data: TriggerDataSchema,
// });

// const TriggerCommandSchema = z.object({
//   type: z.literal('hi'),
// });
// export type TriggerCommand = z.infer<typeof TriggerCommandSchema>;

// const TriggerStateValueSchema = z.object({
//   Online: z.enum(['True', 'False']),
//   Connected: z.enum(['True', 'False']),
// });

// type TriggerStateValue = z.infer<typeof TriggerStateValueSchema>;
// type TriggerStateSchema = StateSchemaFromStateValue<TriggerStateValue>;

// export type TriggerMachine = StateMachine<
//   TriggerContext,
//   TriggerStateSchema,
//   TriggerCommand
// >;
// export type TriggerInterpreter = InterpreterFrom<TriggerMachine>;

// export const TriggerEntitySchema = EntityBaseSchema(
//   TriggerEntityPropsSchema,
//   TriggerCommandSchema,
//   TriggerStateValueSchema
// );
// export type TriggerEntity = z.infer<typeof TriggerEntitySchema>;

// ------------ Trigger Entity ------------
// const TriggerContextSchema = z.object({
//   foo: z.string(),
// });
// export type TriggerContext = z.infer<typeof TriggerContextSchema>;

// const TriggerEntityPropsSchema = z.object({
//   schema: TriggerSchemaTypeLiteral,
//   userId: UserIdSchema,
//   name: z.string(),
// });

// const TriggerCommandSchema = z.union([
//   z.object({
//     type: z.literal('RECONNECT'),
//   }),
//   z.object({
//     type: z.literal('DISCONNECT'),
//   }),
// ]);
// export type TriggerCommand = z.infer<typeof TriggerCommandSchema>;

// const TriggerStateValueSchema = z.object({
//   Active: z.enum(['True', 'False']),
// });
// export type TriggerStateValue = z.infer<typeof TriggerStateValueSchema>;

// export const TriggerEntitySchema = EntityBaseSchema(
//   TriggerEntityPropsSchema,
//   TriggerCommandSchema,
//   TriggerStateValueSchema
// );

// export type TriggerEntity = z.infer<typeof TriggerEntitySchema>;

// ------------ Workflow Entity Definition ------------
// const WorkflowContextSchema = z.object({
//   foo: z.string(),
// });

// export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;

// const WorkflowCommandSchema = z.object({
//   foo: z.string(),
// });

const SubmitFormEventSchema = z.object({
  type: z.literal('SUBMIT_FORM'),
  key: z.string(),
  formData: z.record(z.string()),
});

const InputChangeEventSchema = z.object({
  type: z.literal('INPUT_CHANGE'),
  key: z.string(),
  value: z.string(),
});

const WorkflowCommandSchema = z.discriminatedUnion('type', [
  InputChangeEventSchema,
  SubmitFormEventSchema,
]);

export type WorkflowCommand = z.infer<typeof WorkflowCommandSchema>;

// const SendMessageInvokeMetaSchema = z.object({

// });

// const WorkflowEntityPropsSchema = z.object({
//   schema: WorkflowSchemaTypeLiteral,
// });

// const WorkflowCommandSchema = z.object({
//   type: z.literal('foo'),
//   triggerId: SnowflakeIdSchema,
//   config: z.custom<AnyStateMachine>(),
// });
// export type WorkflowCommand = z.infer<typeof WorkflowCommandSchema>;

// const WorkflowStateValueSchema = z.object({
//   Running: z.enum(['True', 'False']),
//   Complete: z.enum(['True', 'False']),
// });

// type WorkflowStateValue = z.infer<typeof WorkflowStateValueSchema>;
// type WorkflowStateSchema = StateSchemaFromStateValue<WorkflowStateValue>;

// export type WorkflowMachine = StateMachine<
//   WorkflowContext,
//   WorkflowStateSchema,
//   WorkflowCommand
// >;
// export type WorkflowInterpreter = InterpreterFrom<WorkflowMachine>;

// export const WorkflowEntitySchema = EntityBaseSchema(
//   WorkflowEntityPropsSchema,
//   WorkflowCommandSchema,
//   WorkflowStateValueSchema,
//   MessageEventSchema
// );
// export type WorkflowEntity = z.infer<typeof WorkflowEntitySchema>;

// ------------ User Entity Definition ------------
const UserContextSchema = z.object({
  foo: z.string(),
});

export type UserContext = z.infer<typeof UserContextSchema>;

export const UserInitializePropsSchema = z.object({
  connectionId: SnowflakeIdSchema,
  userId: SnowflakeIdSchema,
});

const UserEntityPropsSchema = z.object({
  schema: UserSchemaTypeLiteral,
  profileId: SnowflakeIdSchema.optional(),
  name: PlayerNameSchema.optional(),
  discriminator: z.number().default(0),
  serialNumber: z.number(),
});

export interface UserStateSchema extends StateSchema<UserContext> {
  states: {
    Online: {
      states: {
        [K in UserStateValue['Online']]: {};
      };
    };
  };
}

const UpdateNameCommandSchema = z.object({
  type: z.literal('UPDATE_NAME'),
  name: SlugSchema,
});

const CreateProfileCommandSchema = z.object({
  type: z.literal('UPDATE_PROFILE'),
  profileId: SnowflakeIdSchema,
});

const UserCommandSchema = z.union([
  UpdateNameCommandSchema,
  CreateProfileCommandSchema,
]);
export type UserCommand = z.infer<typeof UserCommandSchema>;

export type UserMachine = StateMachine<
  UserContext,
  UserStateSchema,
  UserCommand
>;
export type UserInterpreter = InterpreterFrom<UserMachine>;

const UserStateValueSchema = z.object({
  Online: z.enum(['True', 'False']),
  Connected: z.enum(['True', 'False']),
});

type UserStateValue = z.infer<typeof UserStateValueSchema>;

export const UserEntitySchema = EntityBaseSchema(
  UserEntityPropsSchema,
  UserCommandSchema,
  UserStateValueSchema,
  LogEventSchema
);
export type UserEntity = z.infer<typeof UserEntitySchema>;

// ------------ Room Entity ------------
const RoomContextSchema = z.object({
  workflows: z.map(z.string(), z.custom<AnyInterpreter>()),
});
export type RoomContext = z.infer<typeof RoomContextSchema>;

const StartCommandSchema = z.object({
  type: z.literal('START'),
});

const ConnectCommandSchema = z.object({
  type: z.literal('CONNECT'),
  connectionEntityId: SnowflakeIdSchema,
});

const JoinCommandSchema = z.object({
  type: z.literal('JOIN'),
  connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
});

const RoomCommandSchema = z.union([
  ConnectCommandSchema,
  JoinCommandSchema,
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type RoomCommand = z.infer<typeof RoomCommandSchema>;

// const LeaveEventSchema = z.object({
//   type: LeaveEventTypeLiteral,
//   subject: SnowflakeIdSchema,
// });

// export type LeaveEvent = z.infer<typeof LeaveEventSchema>;

const RoomEntityPropsSchema = z.object({
  schema: RoomSchemaTypeLiteral,
  hostConnectionEntityId: SnowflakeIdSchema,
  connectedEntityIds: z.array(SnowflakeIdSchema),
  slug: SlugSchema,
  gameId: GameIdSchema.optional(),
  configuration: GameConfigurationSchema.optional(),
});

// // ------------ Session Entity ------------
const SessionContextSchema = z.object({
  foo: z.string(),
});
export type SessionContext = z.infer<typeof SessionContextSchema>;

const SessionEntityPropsSchema = z.object({
  schema: SessionSchemaTypeLiteral,
  userId: UserIdSchema,
  name: z.string(),
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
  SessionStateValueSchema,
  LogEventSchema
);

export type SessionEntity = z.infer<typeof SessionEntitySchema>;

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

type LittleVigilanteChannelMachine = StateMachine<any, any, any>;
type BananaTradersChannelMachine = StateMachine<any, any, any>;
type RoomChannelMachine = StateMachine<any, any, any>;
type DirectChannelMachine = StateMachine<any, any, any>;
type GroupChannelMachine = StateMachine<any, any, any>;

type ChannelMachine =
  | LittleVigilanteChannelMachine
  | BananaTradersChannelMachine
  | RoomChannelMachine
  | DirectChannelMachine
  | GroupChannelMachine;

const ChatContextSchema = z.object({
  channelEntityIds: z.record(SnowflakeIdSchema, SnowflakeIdSchema),
});
export type ChatContext = z.infer<typeof ChatContextSchema>;

const JoinChannelCommandSchema = z.object({
  type: z.literal('JOIN_CHANNEL'),
  channelId: SnowflakeIdSchema,
});

const LeaveChannelCommandSchema = z.object({
  type: z.literal('LEAVE_CHANNEL'),
  channelId: SnowflakeIdSchema,
});

const ChatCommandSchema = z.union([
  JoinChannelCommandSchema,
  LeaveChannelCommandSchema,
]);
export type ChatCommand = z.infer<typeof ChatCommandSchema>;

const NewRoomContextSchema = z.object({
  roomSlug: z.string().optional(),
  gameId: GameIdSchema.optional(),
  gameConfiguration: GameConfigurationSchema.optional(),
});
export type NewRoomContext = z.infer<typeof NewRoomContextSchema>;

const ConfigureCommandSchema = z.object({
  type: z.literal('CONFIGURE_GAME'),
  configuration: GameConfigurationSchema,
});
const SubmitNameCommandSchema = z.object({
  type: z.literal('SUBMIT_NAME'),
  name: z.string(),
});
const SelectGameCommandSchema = z.object({
  type: z.literal('SELECT_GAME'),
  gameId: GameIdSchema,
});

const NewRoomCommandSchema = z.union([
  SelectGameCommandSchema,
  SubmitNameCommandSchema,
  ConfigureCommandSchema,
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
export type ConnectionEntitPro = z.infer<typeof ConnectionEntityPropsSchema>;

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

export type ConnectionMachine = StateMachine<
  ConnectionContext,
  ConnectionStateSchema,
  ConnectionCommand
>;

const BaseConnectionCommandSchema = z.union([
  ConnectionInitializeCommandSchema,
  ConnectionHeartbeatCommandSchema,
  ConnectionNavigateCommandSchema,
]);

const ConnectionCommandSchema = z.union([
  BaseConnectionCommandSchema,
  NewRoomCommandSchema,
  UpdateGeolocationPositionCommandSchema,
]);
export type ConnectionCommand = z.infer<typeof ConnectionCommandSchema>;

// export type ConnectionStateMachine = StateMachine<
//   ConnectionContext,
//   ConnectionStateSchema,
//   ConnectionCommand
// >;

// EntityBaseSchema.ex
// const ConnectionMessageSchema = z.object({
//   id: SnowflakeIdSchema,
//   type: z.literal('PLAIN_MESSAGE'),
//   senderEntityId: SnowflakeIdSchema,
//   message: z.string(),
// });

// export type ConnectionMessage = z.infer<typeof ConnectionMessageSchema>;

const ConnectionEntitySchema = EntityBaseSchema(
  ConnectionEntityPropsSchema,
  ConnectionCommandSchema,
  ConnectionStateValueSchema,
  LogEventSchema
);

// const EntityPropsSchema = z.object({
//   schema: ConnectionSchemaTypeLiteral,
//   sessionId: SnowflakeIdSchema.optional(),
//   authTokens: AuthTokensSchema.optional(),
//   deviceId: SnowflakeIdSchema.optional(),
//   currentRoomSlug: SlugSchema.optional(),
//   connectedRoomSlugs: z.array(SlugSchema),
//   activeRoomSlugs: z.array(SlugSchema),
//   newRoomService: z
//     .object({
//       context: NewRoomContextSchema,
//       value: NewRoomStateValueSchema,
//     })
//     .optional(),
//   // roomListService: z
//   //   .object({
//   //     context: RoomListContextSchema,
//   //     value: RoomListStateValueSchema,
//   //   })
//   //   .optional(),
//   instanceId: z.string().uuid().optional(),
// });

export type ConnectionEntity = z.infer<typeof ConnectionEntitySchema>;

const RoomStateValueSchema = z.object({
  Scene: z.enum(['Lobby', 'Loading', 'Game']),
  Active: z.enum(['No', 'Yes']), // Yes if there is at least 1 player currently connected
});

type RoomStateValue = z.infer<typeof RoomStateValueSchema>;

const RoomMessageDataSchema = z.object({
  sender: SnowflakeIdSchema,
  type: MessageEventTypeLiteral,
  content: z.string(),
});
export type RoomMessageData = z.infer<typeof RoomMessageDataSchema>;

const RoomEventSchema = z.discriminatedUnion('type', [
  MessageEventSchema,
  JoinEventSchema,
  LeaveEventSchema,
]);

export type RoomEvent = z.infer<typeof RoomEventSchema>;

const RoomEntitySchema = EntityBaseSchema(
  RoomEntityPropsSchema,
  RoomCommandSchema,
  RoomStateValueSchema,
  RoomEventSchema
);

export type RoomEntity = z.infer<typeof RoomEntitySchema>;

// const DirectMessageDataSchema = z.object({
//   type: PlainMessageTemplateSchema,
//   content: z.string(),
// });

// const DirectMessageSchema = z.object({
//   type: DirectMessageTypeLiteral,
//   data: DirectMessageDataSchema,
// });

// const GroupMessageDataSchema = z.object({
//   type: z.literal('PLAIN'),
//   content: z.string(),
// });

// const GroupMessageSchema = z.object({
//   type: GroupMessageTypeLiteral,
//   data: GroupMessageDataSchema,
// });

// const RoomMessageSchema = z.object({
//   type: RoomMessageTypeLiteral,
//   data: RoomMessageDataSchema,
// });

// const MessageDataSchema = z.union([
//   GroupMessageDataSchema,
//   DirectMessageDataSchema,
//   RoomMessageSchema,
//   BananaTradersMessageDataSchema,
//   LittleVigilanteMessageDataSchema,
//   CodebreakersMessageDataSchema,
// ]);
// export type MessageData = z.infer<typeof MessageDataSchema>;

// const PlainMessageSchema = z.object({
//   type: PlainMessageTypeLiteral,
//   sender: SnowflakeIdSchema,
//   content: z.string(),
// });

// const LeaveMessageSchema = z.object({
//   type: LeaveMessageTypeLiteral,
//   sender: SnowflakeIdSchema,
//   subject: SnowflakeIdSchema,
// });
// const

// const ChannelEventSchema = z.union([
//   MessageEventSchema,
//   JoinEventSchema,
//   LeaveEventSchema,
// ]);
// export type ChannelEvent = z.infer<typeof ChannelEventSchema>;

const ChannelEventTypeSchema = z.union([
  LogEventTypeLiteral,
  JoinEventTypeLiteral,
  MessageEventTypeLiteral,
  LeaveEventTypeLiteral,
]);
// type ChannelEventType = z.infer<typeof ChannelEventTypeSchema>;

const PlainMessageTemplateSchema = z.object({
  messageType: MessageEventTypeLiteral,
  contentTemplate: z.string(),
});

const MessageTemplateSchema = PlainMessageTemplateSchema;

export type MessageTemplate = z.infer<typeof MessageTemplateSchema>;

const MessageChannelEntityPropsSchema = z.object({
  schema: MessageChannelSchemaTypeLiteral,
  messages: z.array(ChannelEventSchema),
  connectionId: SnowflakeIdSchema,
  parentId: SnowflakeIdSchema,
  tsOffset: z.number().optional(),
});

const TypingCommandSchema = z.object({
  type: z.literal('TYPE'),
});

const MessageChannelCommandSchema = TypingCommandSchema;
export type MessageChannelCommand = z.infer<typeof MessageChannelCommandSchema>;

const MessageChannelStateValueSchema = z.object({
  Initialized: z.enum(['Running', 'Error']), // todo
});

type MessageChannelStateValue = z.infer<typeof MessageChannelStateValueSchema>;

const MessageChannelEntitySchema = EntityBaseSchema(
  MessageChannelEntityPropsSchema,
  MessageChannelCommandSchema,
  MessageChannelStateValueSchema,
  LogEventSchema
);

export type MessageChannelEntity = z.infer<typeof MessageChannelEntitySchema>;

const CodebreakersEventSchema = MessageEventSchema;

const CodebreakersGameEntityPropSchema = z.object({
  schema: CodebreakersGameSchemaTypeLiteral,
  gameId: CodebreakersGameId,
  playerEntityIds: z.array(SnowflakeIdSchema),
  roomEntityId: SnowflakeIdSchema,
});

const CodebreakersGameStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export type CodebreakersGameStateValue = z.infer<
  typeof CodebreakersGameStateValueSchema
>;

const CodebreakersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type CodebreakersGameCommand = z.infer<
  typeof CodebreakersGameCommandSchema
>;

const CodebreakersGameEntitySchema = EntityBaseSchema(
  CodebreakersGameEntityPropSchema,
  CodebreakersGameCommandSchema,
  CodebreakersGameStateValueSchema,
  CodebreakersEventSchema
);

type CodebreakersGameEntity = z.infer<typeof CodebreakersGameEntitySchema>;

export type CodebreakersGameStateSchema =
  StateSchemaFromStateValue<CodebreakersGameStateValue>;

const CodebreakersGameContextSchema = z.object({
  foo: z.string(),
});
export type CodebreakersGameContext = z.infer<
  typeof CodebreakersGameContextSchema
>;

export type CodebreakersGameMachine = StateMachine<
  CodebreakersGameContext,
  CodebreakersGameStateSchema,
  CodebreakersGameCommand
>;

// const CodebreakersPlayerMessageSchema = z.object({
//   type: z.literal('PLAIN_MESSAGE'),
//   id: SnowflakeIdSchema,
//   senderEntityId: SnowflakeIdSchema,
//   message: z.string(),
// });

// type CodebreakersPlayerMessage = z.infer<
//   typeof CodebreakersPlayerMessageSchema
// >;

const CodebreakersPlayerEntityPropSchema = z.object({
  schema: CodebreakersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
});

const CodebreakersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
export type CodebreakersPlayerStateValue = z.infer<
  typeof CodebreakersPlayerStateValueSchema
>;

const CodebreakersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type CodebreakersPlayerCommand = z.infer<
  typeof CodebreakersPlayerCommandSchema
>;

const CodebreakersPlayerEntitySchema = EntityBaseSchema(
  CodebreakersPlayerEntityPropSchema,
  CodebreakersPlayerCommandSchema,
  CodebreakersPlayerStateValueSchema,
  LogEventSchema
);
type CodebreakersPlayerEntity = z.infer<typeof CodebreakersPlayerEntitySchema>;

export type CodebreakersPlayerStateSchema =
  StateSchemaFromStateValue<CodebreakersPlayerStateValue>;

const CodebreakersPlayerContextSchema = z.object({
  foo: z.string(),
});
export type CodebreakersPlayerContext = z.infer<
  typeof CodebreakersPlayerContextSchema
>;

export type CodebreakersPlayerMachine = StateMachine<
  CodebreakersPlayerContext,
  CodebreakersPlayerStateSchema,
  CodebreakersPlayerCommand
>;

const TriggerEntityPropSchema = z.object({
  // id: z.string(),
  // event: EventMatchersSchema,
  // entity: EntityMatchersSchema,
  // workflowConfig: z.custom<AnyStateMachine>(),
  // workflowType: WorkflowTypeLiteralSchema,

  // event: EventMatchersSchema,
  // entity: EntityMatchersSchema,
  schema: TriggerSchemaTypeLiteral,
  // data: TriggerDataSchema,
  config: z.lazy(() => TriggerConfigSchema),
});

const TriggerStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
});

export type TriggerStateValue = z.infer<typeof TriggerStateValueSchema>;

const TriggerCommandSchema = z.union([StartCommandSchema, LeaveCommandSchema]);

export type TriggerCommand = z.infer<typeof TriggerCommandSchema>;

const TriggerEntitySchema = EntityBaseSchema(
  TriggerEntityPropSchema,
  TriggerCommandSchema,
  TriggerStateValueSchema,
  MessageEventSchema
);

export type TriggerEntity = z.infer<typeof TriggerEntitySchema>;

const TriggerContextSchema = z.object({
  foo: z.string(),
});
export type TriggerContext = z.infer<typeof TriggerContextSchema>;

const BananaTradersGameEntityPropSchema = z.object({
  schema: BananaTradersGameSchemaTypeLiteral,
  gameId: BananaTradersGameId,
  playerEntityIds: z.array(SnowflakeIdSchema),
  roomEntityId: SnowflakeIdSchema,
});

const BananaTradersGameStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
});

export type BananaTradersGameStateValue = z.infer<
  typeof BananaTradersGameStateValueSchema
>;

const BananaTradersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type BananaTradersGameCommand = z.infer<
  typeof BananaTradersGameCommandSchema
>;

const BananaTradersGameEntitySchema = EntityBaseSchema(
  BananaTradersGameEntityPropSchema,
  BananaTradersGameCommandSchema,
  BananaTradersGameStateValueSchema,
  MessageEventSchema
);

type BananaTradersGameEntity = z.infer<typeof BananaTradersGameEntitySchema>;

export type BananaTradersGameStateSchema =
  StateSchemaFromStateValue<BananaTradersGameStateValue>;

const BananaTradersGameContextSchema = z.object({
  foo: z.string(),
});
export type BananaTradersGameContext = z.infer<
  typeof BananaTradersGameContextSchema
>;

export type BananaTradersGameMachine = StateMachine<
  BananaTradersGameContext,
  BananaTradersGameStateSchema,
  BananaTradersGameCommand
>;

const BananaTradersPlayerEntityPropSchema = z.object({
  schema: BananaTradersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
  channel: z.custom<Observable<MessageEvent>>(),
});

const BananaTradersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
export type BananaTradersPlayerStateValue = z.infer<
  typeof BananaTradersPlayerStateValueSchema
>;

const BananaTradersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type BananaTradersPlayerCommand = z.infer<
  typeof BananaTradersPlayerCommandSchema
>;

const BananaTradersPlayerEntitySchema = EntityBaseSchema(
  BananaTradersPlayerEntityPropSchema,
  BananaTradersPlayerCommandSchema,
  BananaTradersPlayerStateValueSchema,
  LogEventSchema
);

export type BananaTradersPlayerStateSchema =
  StateSchemaFromStateValue<BananaTradersPlayerStateValue>;

const BananaTradersPlayerContextSchema = z.object({
  foo: z.string(),
});
export type BananaTradersPlayerContext = z.infer<
  typeof BananaTradersPlayerContextSchema
>;
type BananaTradersPlayerEntity = z.infer<
  typeof BananaTradersPlayerEntitySchema
>;

export type BananaTradersPlayerMachine = StateMachine<
  BananaTradersPlayerContext,
  BananaTradersPlayerStateSchema,
  BananaTradersPlayerCommand
>;

const LittleVigilanteGameMessageSchema = z.object({
  id: SnowflakeIdSchema,
  type: z.literal('PLAIN_MESSAGE'),
  senderEntityId: SnowflakeIdSchema,
  message: z.string(),
});

const LittleVigilanteGameEntityPropSchema = z.object({
  schema: LittleVigilanteGameSchemaTypeLiteral,
  gameId: LittleVigilanteGameId,
  playerEntityIds: z.array(SnowflakeIdSchema),
  roomEntityId: SnowflakeIdSchema,
  channel: z.custom<Observable<MessageEvent>>(),
});

const LittleVigilanteGameStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export type LittleVigilanteGameStateValue = z.infer<
  typeof LittleVigilanteGameStateValueSchema
>;

const LittleVigilanteGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type LittleVigilanteGameCommand = z.infer<
  typeof LittleVigilanteGameCommandSchema
>;

const LittleVigilanteGameEntitySchema = EntityBaseSchema(
  LittleVigilanteGameEntityPropSchema,
  LittleVigilanteGameCommandSchema,
  LittleVigilanteGameStateValueSchema,
  LogEventSchema
);
type LittleVigilanteGameEntity = z.infer<
  typeof LittleVigilanteGameEntitySchema
>;

export type LittleVigilanteGameStateSchema =
  StateSchemaFromStateValue<LittleVigilanteGameStateValue>;

const LittleVigilanteGameContextSchema = z.object({
  foo: z.string(),
});
export type LittleVigilanteGameContext = z.infer<
  typeof LittleVigilanteGameContextSchema
>;

export type LittleVigilanteGameMachine = StateMachine<
  LittleVigilanteGameContext,
  LittleVigilanteGameStateSchema,
  LittleVigilanteGameCommand
>;

// type LittleVigilantePlayerMessage = z.infer<
//   typeof LittleVigilanteMessageSchema
// >;

const LittleVigilantePlayerEntityPropSchema = z.object({
  schema: LittleVigilantePlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: UserIdSchema,
});

const LittleVigilantePlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});
export type LittleVigilantePlayerStateValue = z.infer<
  typeof LittleVigilantePlayerStateValueSchema
>;

const LittleVigilantePlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export type LittleVigilantePlayerCommand = z.infer<
  typeof LittleVigilantePlayerCommandSchema
>;

const LittleVigilantePlayerEntitySchema = EntityBaseSchema(
  LittleVigilantePlayerEntityPropSchema,
  LittleVigilantePlayerCommandSchema,
  LittleVigilantePlayerStateValueSchema,
  LogEventSchema
);
type LittleVigilantePlayerEntity = z.infer<
  typeof LittleVigilantePlayerEntitySchema
>;

export type LittleVigilantePlayerStateSchema =
  StateSchemaFromStateValue<LittleVigilantePlayerStateValue>;

const LittleVigilantePlayerContextSchema = z.object({
  foo: z.string(),
});
export type LittleVigilantePlayerContext = z.infer<
  typeof LittleVigilantePlayerContextSchema
>;

export type LittleVigilantePlayerMachine = StateMachine<
  LittleVigilantePlayerContext,
  LittleVigilantePlayerStateSchema,
  LittleVigilantePlayerCommand
>;

export const EntitySchema = z.union([
  ConnectionEntitySchema,
  SessionEntitySchema,
  RoomEntitySchema,
  UserEntitySchema,
  // WorkflowEntitySchema,
  TriggerEntitySchema,
  MessageChannelEntitySchema,
  BananaTradersGameEntitySchema,
  BananaTradersPlayerEntitySchema,
  CodebreakersGameEntitySchema,
  CodebreakersPlayerEntitySchema,
  LittleVigilanteGameEntitySchema,
  LittleVigilantePlayerEntitySchema,
  // TriggerEntitySchema,
]);

export type Entity = z.infer<typeof EntitySchema>;
export type EntityEvent = Parameters<Parameters<Entity['subscribe']>[0]>[0];

export const EntityCommandSchema = z.union([
  ConnectionCommandSchema,
  SessionCommandSchema,
  RoomCommandSchema,
]);

export const EntitySchemas = {
  user: UserEntitySchema,
  room: RoomEntitySchema,
  session: SessionEntitySchema,
  connection: ConnectionEntitySchema,
  // workflow: WorkflowEntitySchema,
  trigger: TriggerEntitySchema,
  message_channel: MessageChannelEntitySchema,
  banana_traders_game: BananaTradersGameEntitySchema,
  banana_traders_player: BananaTradersPlayerEntitySchema,
  codebreakers_game: CodebreakersGameEntitySchema,
  codebreakers_player: CodebreakersPlayerEntitySchema,
  little_vigilante_game: LittleVigilanteGameEntitySchema,
  little_vigilante_player: LittleVigilantePlayerEntitySchema,
};

export const ClientEventSchema = z.object({
  id: SnowflakeIdSchema,
  senderId: SnowflakeIdSchema,
  command: z.union([RoomCommandSchema, UserCommandSchema]),
});

export type ClientEvent = z.infer<typeof ClientEventSchema>;

export type EntityMachine =
  | {
      type: 'connection';
      machine: ConnectionMachine;
    }
  | {
      type: 'user';
      machine: UserMachine;
    }
  | {
      type: 'room';
      machine: RoomMachine;
    }
  // | {
  //     type: 'workflow';
  //     machine: WorkflowMachine;
  //   }
  | {
      type: 'message_channel';
      machine: MessageChannelMachine;
    }
  | {
      type: 'trigger';
      machine: TriggerMachine;
    }
  | {
      type: 'codebreakers_game';
      machine: CodebreakersGameMachine;
    }
  | {
      type: 'codebreakers_player';
      machine: CodebreakersPlayerMachine;
    }
  | {
      type: 'banana_traders_game';
      machine: BananaTradersGameMachine;
    }
  | {
      type: 'banana_traders_player';
      machine: BananaTradersPlayerMachine;
    }
  | {
      type: 'little_vigilante_game';
      machine: LittleVigilanteGameMachine;
    }
  | {
      type: 'little_vigilante_player';
      machine: LittleVigilantePlayerMachine;
    }
  | {
      type: 'session';
      machine: SessionMachine;
    };

export type EntityMachineMap = IndexByType<EntityMachine>;

export type PersistentProps = {
  refreshToken?: string;
  accessToken?: string;
  deviceId?: string;
};

export type CallbackFromEntity<TEntity extends Entity> = Parameters<
  TEntity['subscribe']
>[0];

export type EventFromEntity<TEntity extends Entity> = Parameters<
  CallbackFromEntity<TEntity>
>[0];

type EntityChangeDelta<TEntity extends Entity> = {
  property: keyof TEntity;
  value: TEntity[keyof TEntity];
  prevValue: TEntity[keyof TEntity];
};

interface EntityPropChangeEvent<TEntity extends Entity> {
  type: 'CHANGE';
  data: TEntity;
  delta: EntityChangeDelta<TEntity>;
}

type EntityIndexInitEvent<TEntity extends Entity> = {
  type: 'INIT';
  data: TEntity[];
};

type EntityIndexAddEvent<TEntity extends Entity> = {
  type: 'ADD';
  data: TEntity;
};

type EntityIndexRemoveEvent<TEntity extends Entity> = {
  type: 'REMOVE';
  data: TEntity;
};

export type EntityIndexEvent<TEntity extends Entity> =
  | EntityPropChangeEvent<TEntity>
  | EntityIndexInitEvent<TEntity>
  | EntityIndexAddEvent<TEntity>
  | EntityIndexRemoveEvent<TEntity>;

const TriggerEventTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: TriggerEventTemplateDataTypeLiteral,
});

const TriggerEntityTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: TriggerEntityTemplateDataTypeLiteral,
});

const TriggerEventSubjectTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: TriggerEventSubjectTemplateDataTypeLiteral,
});

const TriggerMetadataTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: TriggerMetadataTemplateDataTypeLiteral,
});

const WorkflowEventTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: WorkflowEventTemplateDataTypeLiteral,
});

const TemplateVariableSchema = z.discriminatedUnion('templateDataType', [
  TriggerEntityTemplateVariableSchema,
  TriggerEventTemplateVariableSchema,
  TriggerMetadataTemplateVariableSchema,
  TriggerEventSubjectTemplateVariableSchema,
  WorkflowEventTemplateVariableSchema,
]);

export type TemplateVariable = z.infer<typeof TemplateVariableSchema>;

const MatchesGuardLiteral = z.literal('matches');

const MatchesGuardSchema = z.object({
  guardType: MatchesGuardLiteral,
  variable: TemplateVariableSchema,
  operator: z.enum([
    '<',
    '<==',
    '==',
    '>',
    '>=',
    '!=',
    'array-contains',
    'array-contains-any',
    'in',
    'not-in',
  ]),
  value: z.union([z.number(), z.string()]),
});
export type MatchesGuard = z.infer<typeof MatchesGuardSchema>;

// const SendMessageDataSchema = z.object({
//   template: z.string(),
//   variables: z.array(TemplateVariableSchema),
//   handlers: TemplateHandlerSchema,
//   // entities: z.record(z.string()),
// });

const MessageTemplateMetadataSchema = z.object({
  template: z.string(),
  variables: z.array(TemplateVariableSchema),
  handlers: TemplateHandlerSchema,
  // entities: z.record(z.string()),
});

// export type SendMessageData = z.infer<typeof SendMessageDataSchema>;

// const AssertInputInvokeMetaSchema = z.object({
//   value: z.any(),
//   templateDataType: TemplateDataTypeLiteralSchema,
//   path: z.string(),
// });

// export type AssertInputInvokeMeta = z.infer<typeof SendMessageInvokeMetaSchema>;

// export type AssertInputValueInvokeMeta = z.infer<
//   typeof SetMetadataInvokeMetaSchema
// >;

// const SetMetadataInvokeMetaSchema = z.object({
//   key: z.string(),
//   eventPath: z.string(),
// });

// export type SetMetadataInvokeMeta = z.infer<typeof SetMetadataInvokeMetaSchema>;

// const ChannelWorkflowInvokeMeta = z.object({
//   workflowType: ChannelWorkflowLiteral,
//   sendMessage: SendMessageDataSchema,
// });

// const WorkflowInvokeMetaSchema = z.discriminatedUnion('workflowType', [
//   ChannelWorkflowInvokeMeta,
// ]);
// export type WorkflowInvokeMeta = z.infer<typeof WorkflowInvokeMetaSchema>;

const WorkflowInputConfigSchema = z.discriminatedUnion('templateDataType', [
  TriggerEntityTemplateVariableSchema,
  TriggerEventTemplateVariableSchema,
]);

export type WorkflowInputConfig = z.infer<typeof WorkflowInputConfigSchema>;

const WorkflowTypeLiteralSchema = ChannelWorkflowLiteral;

const EventTriggerTypeLiteral = z.literal('event');
const EntityTriggerTypeLiteral = z.literal('entity');
const IndexTriggerTypeLiteral = z.literal('index');
const CommandTriggerTypeLiteral = z.literal('command');
const WebhookTriggerTypeLiteral = z.literal('webhook');
const ScheduledTriggerTypeLiteral = z.literal('scheduled');

export const TriggerTypeLiteralSchema = z.union([
  EventTriggerTypeLiteral,
  EntityTriggerTypeLiteral,
  IndexTriggerTypeLiteral,
  CommandTriggerTypeLiteral,
  WebhookTriggerTypeLiteral,
]);

// todo add 'filtering' capabilities to these schemas, use firebase ref
const EventMatchersSchema = z.object({
  type: ChannelEventTypeSchema,
});
const EntityMatchersSchema = z.object({
  schema: EntitySchemaLiteralsSchema,
});

const GuardLiteralsSchema = MatchesGuardLiteral;

const SendMessageServiceLiteral = z.literal('sendMessage');
const BroadcastMessageServiceLiteral = z.literal('broadcastMessage');

const TriggerServiceTypeSchema = z.union([
  SendMessageServiceLiteral,
  BroadcastMessageServiceLiteral,
]);
export type TriggerServiceType = z.infer<typeof TriggerServiceTypeSchema>;

const SendMessageMetadataataSchema = z.object({
  serviceType: SendMessageServiceLiteral,
  data: MessageTemplateMetadataSchema,
});
export type SendMessageMetadata = z.infer<typeof SendMessageMetadataataSchema>;

const BroadcastMessageMetadataataSchema = z.object({
  serviceType: BroadcastMessageServiceLiteral,
  data: MessageTemplateMetadataSchema,
});

export type BroadcastMessageMetadata = z.infer<
  typeof BroadcastMessageMetadataataSchema
>;

const TriggerServiceMetadataDataSchema = z.discriminatedUnion('serviceType', [
  SendMessageMetadataataSchema,
  BroadcastMessageMetadataataSchema,
]);
export type TriggerServiceMetadata = z.infer<
  typeof TriggerServiceMetadataDataSchema
>;

const TriggerGuardSchema = z.discriminatedUnion('guardType', [
  MatchesGuardSchema,
]);

// dummy action probably not used
const ConsoleLogActionSchema = z.object({
  actionType: z.literal('ConsoleLog'),
  message: z.string(),
});

const TriggerActionsSchema = z.discriminatedUnion('actionType', [
  ConsoleLogActionSchema,
]);

const EventTriggerConfigSchema = z.object({
  id: SnowflakeIdSchema,
  event: EventMatchersSchema,
  entity: EntityMatchersSchema,
  triggerType: EventTriggerTypeLiteral,
  workflowConfig: z.object({
    machine: z.custom<Parameters<typeof createMachine>[0]>(),
    actions: z.record(z.string(), TriggerActionsSchema).optional(),
    guards: z.record(z.string(), TriggerGuardSchema).optional(),
    services: z.record(z.string(), TriggerServiceMetadataDataSchema).optional(),
  }),
});

export type EventTriggerConfigSchema = z.infer<typeof EventTriggerConfigSchema>;

const WorkflowConfigSchema = z.object({
  machine: z.custom<Parameters<typeof createMachine>[0]>(),
  actions: z.record(z.string(), TriggerActionsSchema),
  guards: z.record(z.string(), TriggerGuardSchema),
  services: z.record(z.string(), TriggerServiceMetadataDataSchema),
});

const ScheduledTriggerConfigSchema = z.object({
  id: SnowflakeIdSchema,
  triggerType: ScheduledTriggerTypeLiteral,
  workflowConfig: z.object({
    machine: z.custom<Parameters<typeof createMachine>[0]>(),
    actions: z.record(z.string(), TriggerActionsSchema),
    guards: z.record(z.string(), TriggerGuardSchema),
    services: z.record(z.string(), TriggerServiceMetadataDataSchema),
  }),
});

const WebhookTriggerConfigSchema = z.object({
  id: SnowflakeIdSchema,
  triggerType: WebhookTriggerTypeLiteral,
  workflowConfig: z.object({
    machine: z.custom<Parameters<typeof createMachine>[0]>(),
    actions: z.record(z.string(), TriggerActionsSchema),
    guards: z.record(z.string(), TriggerGuardSchema),
    services: z.record(z.string(), TriggerServiceMetadataDataSchema),
  }),
});

// const ServicesMapSchema = z.object({
//   sendMessage: z.function()
// })

const TriggerConfigSchema = z.discriminatedUnion('triggerType', [
  EventTriggerConfigSchema,
  WebhookTriggerConfigSchema,
  ScheduledTriggerConfigSchema,
]);

export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

// const WorkflowInputSchema = z.object({
//   event: ChannelEventSchema,
//   entity: EntitySchema,
//   eventSubject: EntitySchema,
//   metadata: z.record(z.any()),
// });

// export type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

const WorkflowContextSchema = z.object({
  entity: TriggerEntitySchema,
});

export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;
