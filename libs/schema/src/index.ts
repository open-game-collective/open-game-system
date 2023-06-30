// export * from './common';
// export * from './services';
export * from './types';

// const Hex = defineHex({ dimensions: 50, orientation: Orientation.FLAT })
// const grid = new Grid(Hex, rectangle({ width: 5, height: 2 }))
// const t = grid.toJSON;

// const SlugSchema = z
//   .string()
//   .min(1)
//   .max(30)
//   .regex(/^[a-z0-9-]+$/);

// export const SnowflakeIdSchema = z.string();
// export type SnowflakeId = z.infer<typeof SnowflakeIdSchema>;

// export const ClubNameSchema = z.string();

// export const PlayerNameSchema = z.string();

// const GameConfigurationSchema = z.discriminatedUnion('gameId', [
//   z.object({
//     gameId: LittleVigilanteGameIdLiteral,
//     data: LittleVigilanteGameConfigDataSchema,
//   }),
//   z.object({
//     gameId: CodebreakersGameIdLiteral,
//     data: CodebreakersGameConfigDataSchema,
//   }),
//   z.object({
//     gameId: BananaTradersGameIdLiteral,
//     data: BananTradersGameConfigDataSchema,
//   }),
//   z.object({
//     gameId: StrikersGameIdLiteral,
//     data: StrikersGameConfigDataSchema,
//   }),
// ]);

// const StateValueSchema: z.ZodType<StateValue> = z.union([
//   z.string(),
//   z.record(z.lazy(() => StateValueSchema)),
// ]);
// export type AnyStateValue = z.infer<typeof StateValueSchema>;

// todo add others commands here

// Entity Schema types
// const UserSchemaTypeLiteral = z.literal('user');
// const SessionSchemaTypeLiteral = z.literal('session');
// const WorkflowSchemaTypeLiteral = z.literal('workflow');
// const ConnectionSchemaTypeLiteral = z.literal('connection');
// const RoomSchemaTypeLiteral = z.literal('room');
// const MessageChannelSchemaTypeLiteral = z.literal('message_channel');
// const BananaTradersGameSchemaTypeLiteral = z.literal('banana_traders_game');
// const StrikersGameSchemaTypeLiteral = z.literal('strikers_game');
// const StrikersTurnSchemaTypeLiteral = z.literal('strikers_turn');
// const StrikersPlayerSchemaTypeLiteral = z.literal('strikers_player');
// const BananaTradersPlayerSchemaTypeLiteral = z.literal('banana_traders_player');
// const LittleVigilanteGameSchemaTypeLiteral = z.literal('little_vigilante_game');
// const LittleVigilantePlayerSchemaTypeLiteral = z.literal(
//   'little_vigilante_player'
// );
// const CodebreakersGameSchemaTypeLiteral = z.literal('codebreakers_game');
// const CodebreakersPlayerSchemaTypeLiteral = z.literal('codebreakers_player');
// const TriggerSchemaTypeLiteral = z.literal('trigger');
// const ChannelWorkflowLiteral = z.literal('channel_workflow');

// const TriggerEventTemplateDataTypeLiteral = z.literal('trigger_event');
// const TriggerEntityTemplateDataTypeLiteral = z.literal('trigger_entity');
// export const TriggerEventSubjectTemplateDataTypeLiteral = z.literal(
//   'trigger_event_subject'
// );
// const TriggerMetadataTemplateDataTypeLiteral = z.literal('trigger_metadata');
// const WorkflowEventTemplateDataTypeLiteral = z.literal('workflow_event');

// export const TemplateDataTypeLiteralSchema = z.union([
//   TriggerEventTemplateDataTypeLiteral,
//   TriggerEntityTemplateDataTypeLiteral,
//   TriggerEventSubjectTemplateDataTypeLiteral,
//   TriggerMetadataTemplateDataTypeLiteral,
//   WorkflowEventTemplateDataTypeLiteral,
// ]);
// export type TemplateDataType = z.infer<typeof TemplateDataTypeLiteralSchema>;

// export const LoginInputSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(5),
// });

// const EntitySchemaLiteralsSchema = z.union([
//   ConnectionSchemaTypeLiteral,
//   SessionSchemaTypeLiteral,
//   RoomSchemaTypeLiteral,
//   UserSchemaTypeLiteral,
//   MessageChannelSchemaTypeLiteral,
//   WorkflowSchemaTypeLiteral,
//   TriggerSchemaTypeLiteral,
// ]);


// const LogEventTypeLiteral = z.literal('LOG');
// const MessageEventTypeLiteral = z.literal('MESSAGE');
// const JoinEventTypeLiteral = z.literal('JOIN');
// const LeaveEventTypeLiteral = z.literal('LEAVE');
// const DebugEventTypeLiteral = z.literal('DEBUG');

// const CommandHandlerSchema = z.object({
//   command: z.string(),
// });

// const TemplateHandlerSchema = z.object({
//   onChange: z.record(CommandHandlerSchema).optional(),
//   onConfirm: z.record(CommandHandlerSchema).optional(),
//   onSubmit: z.record(CommandHandlerSchema).optional(),
//   onPress: z.record(CommandHandlerSchema).optional(),
// });

// const ChannelWorkflowContextSchema = z.object({
//   workflowId: z.string().uuid(),
//   entities: z.object({
//     user: SnowflakeIdSchema,
//     channel: SnowflakeIdSchema,
//   }),
// });
// export type ChannelWorkflowContext = z.infer<
//   typeof ChannelWorkflowContextSchema
// >;

// Define separate Zod schemas for each event type
// const DisconnectEventSchema = z.object({ type: z.literal('DISCONNECT') });
// const ReconnectEventSchema = z.object({ type: z.literal('RECONNECT') });

// Create a union schema that combines the event schemas
// export const ConnectionEventSchema = z.union([
//   DisconnectEventSchema,
//   ReconnectEventSchema,
// ]);

// const EventBaseSchema = <
//   TType extends string,
//   TEventProps extends z.ZodRawShape
// >(
//   typeLiteral: z.ZodLiteral<TType>,
//   eventPropsSchema: z.ZodObject<TEventProps>
// ) =>
//   eventPropsSchema.merge(
//     z.object({
//       id: SnowflakeIdSchema,
//       type: typeLiteral,
//       channelId: SnowflakeIdSchema,
//     })
//   );

// const LogEventSchema = EventBaseSchema(
//   LogEventTypeLiteral,
//   z.object({
//     level: z.enum(['DEBUG', 'INFO', 'ERROR']),
//     content: z.string(),
//   })
// );

// export type LogEvent = z.infer<typeof LogEventSchema>;

// const MessageCommandSchema = z.object({
//   content: z.string(),
//   connectionEntityId: SnowflakeIdSchema,
// });
// export type MessageCommand = z.infer<typeof MessageCommandSchema>;

// const MessageEventSchema = EventBaseSchema(
//   MessageEventTypeLiteral,
//   z.object({
//     sender: SnowflakeIdSchema,
//     content: z.string(),
//   })
// );
// export type MessageEvent = z.infer<typeof MessageEventSchema>;

// // Define a custom Zod schema for the send function
// const SendFunctionSchema = <TCommand extends AnyEventObject>(
//   commandSchema: z.ZodSchema<TCommand>
// ) => z.function().args(commandSchema).returns(z.void());

// const CallbackFunctionSchema = <TCommand extends AnyEventObject>(
//   commandSchema: z.ZodSchema<TCommand>
// ) => z.function().args(EntityEventSchema(commandSchema)).returns(z.void());

// export type EntityDataKey = Omit<keyof InitialEntityProps<Entity>, 'schema'>;

// const StatesFrom = // TODO implement

// const ContextFrom = <TTypeState extends Typestate<any>>(typeStateSchema: z.ZodSchema<TTypeState>) => {
//   return typeStateSchema.
// }

// const AuthTokensSchema = z.object({
//   accessToken: z.string(),
//   refreshToken: z.string(),
// });
// export type AuthTokens = z.infer<typeof AuthTokensSchema>;

// export type ChatMachine = StateMachine<
//   ChatContext,
//   ChatStateSchema,
//   ChatCommand
// >;

// export type ChatInterpreter = InterpreterFrom<ChatMachine>;

// export type ConnectionContext = {
//   supabaseClient?: SupabaseClient<Database>;
//   chatServiceRef?: ChatInterpreter;
// };

// export type InitializedConnectionContext = MakeRequired<
//   ConnectionContext,
//   'supabaseClient'
// >;

// export type InitializedConnectionEntity = MakeRequired<
//   ConnectionEntity,
//   'sessionId' | 'authTokens' | 'deviceId'
// >;

// export type ConnectionTypeState =
//   | {
//       value: 'Initialized';
//       context: InitializedConnectionContext;
//     }
//   | {
//       value: 'Unitialized';
//       context: ConnectionContext;
//     };

// export const RouteNameSchema = z.enum([
//   'Home',
//   'NewRoom',
//   'Room',
//   'Login',
//   'NotFound',
//   'Uninitialized',
// ]);

// export type RouteName = z.infer<typeof RouteNameSchema>;

// const GeolocationStateSchema = z.enum([
//   'Initialized',
//   'Uninitialized',
//   'Error',
//   'Denied',
// ]);

// const ConnectionStateValueSchema = z.object({
//   Initialized: z.enum(['True', 'False', 'Initializing', 'Error']),
//   Route: RouteNameSchema,
//   Geolocation: GeolocationStateSchema,
// });

// type ConnectionStateValue = z.infer<typeof ConnectionStateValueSchema>;

// type EnumKeys<T> = T extends z.ZodEnum<infer R> ? Extract<R, string> : never;

// type NestedState<T> = T extends z.ZodObject<infer R>
//   ? {
//       [K in keyof R]: {
//         states: NestedStates<R[K]>;
//       };
//     }
//   : {
//       [P in EnumKeys<T>]: {};
//     };

// type NestedStates<T> = {
//   [K in keyof T]: NestedState<T[K]>;
// };

// type StateSchemaFromStateValue<T> = StateSchema & {
//   states: NestedStates<T>;
// };

// export type ConnectionStateSchema =
//   StateSchemaFromStateValue<ConnectionStateValue>;

// export type MessageChannelStateSchema =
//   StateSchemaFromStateValue<MessageChannelStateValue>;

// export type RoomStateSchema = StateSchemaFromStateValue<RoomStateValue>;

// const MessageChannelContextSchema = z.object({
//   foo: z.string(),
// });
// export type MessageChannelContext = z.infer<typeof MessageChannelContextSchema>;

// export type MessageChannelMachine = StateMachine<
//   MessageChannelContext,
//   MessageChannelStateSchema,
//   MessageChannelCommand
// >;

// export type RoomMachine = StateMachine<
//   RoomContext,
//   RoomStateSchema,
//   RoomCommand
// >;

// export type SessionTypeState = {
//   value: 'Active';
//   context: MakeRequired<SessionContext, 'foo'>;
// };

// export type SessionStateSchema = StateSchemaFromStateValue<SessionStateValue>;

// export type SessionMachine = StateMachine<
//   SessionContext,
//   SessionStateSchema,
//   SessionCommand
// >;

// const EntitySendTriggerEventSchema = <TEvent extends AnyEventObject>(
//   commandSchema: z.ZodSchema<TEvent>
// ) =>
//   z.object({
//     type: z.literal('SEND_TRIGGER'),
//     command: commandSchema,
//   });

// const EntitySendErrorEventSchema = <TEvent extends AnyEventObject>(
//   commandSchema: z.ZodSchema<TEvent>
// ) =>
//   z.object({
//     type: z.literal('SEND_ERROR'),
//     command: commandSchema,
//   });

// const EntitySendCompleteEventSchema = <TEvent extends AnyEventObject>(
//   commandSchema: z.ZodSchema<TEvent>
// ) =>
//   z.object({
//     type: z.literal('SEND_COMPLETE'),
//     command: commandSchema,
//   });

// const EntityTransitionStateEventSchema = z.object({
//   type: z.literal('TRANSITION'),
// });

// const EntityChangeEventSchema = z.object({
//   type: z.literal('CHANGE'),
//   patches: z.array(z.custom<Operation>()),
// });

// const EntityEventSchema = <TEvent extends AnyEventObject>(
//   commandSchema: z.ZodSchema<TEvent>
// ) =>
//   z.union([
//     EntitySendCompleteEventSchema(commandSchema),
//     EntitySendErrorEventSchema(commandSchema),
//     EntitySendTriggerEventSchema(commandSchema),
//     EntityChangeEventSchema,
//     EntityTransitionStateEventSchema,
//   ]);

// ------------ User Entity Definition ------------
// const UserContextSchema = z.object({
//   foo: z.string(),
// });

// export type UserContext = z.infer<typeof UserContextSchema>;

// export const UserInitializePropsSchema = z.object({
//   connectionId: SnowflakeIdSchema,
//   userId: SnowflakeIdSchema,
// });

// const UserEntityPropsSchema = z.object({
//   schema: UserSchemaTypeLiteral,
//   profileId: SnowflakeIdSchema.optional(),
//   name: PlayerNameSchema.optional(),
//   discriminator: z.number().default(0),
//   serialNumber: z.number(),
// });

// export interface UserStateSchema extends StateSchema<UserContext> {
//   states: {
//     Online: {
//       states: {
//         [K in UserStateValue['Online']]: {};
//       };
//     };
//   };
// }

// const UpdateNameCommandSchema = z.object({
//   type: z.literal('UPDATE_NAME'),
//   name: SlugSchema,
// });

// const CreateProfileCommandSchema = z.object({
//   type: z.literal('UPDATE_PROFILE'),
//   profileId: SnowflakeIdSchema,
// });

// const UserCommandSchema = z.union([
//   UpdateNameCommandSchema,
//   CreateProfileCommandSchema,
// ]);
// export type UserCommand = z.infer<typeof UserCommandSchema>;

// export type UserMachine = StateMachine<
//   UserContext,
//   UserStateSchema,
//   UserCommand
// >;
// export type UserInterpreter = InterpreterFrom<UserMachine>;

// const UserStateValueSchema = z.object({
//   Online: z.enum(['True', 'False']),
//   Connected: z.enum(['True', 'False']),
// });

// type UserStateValue = z.infer<typeof UserStateValueSchema>;

// export const UserEntitySchema = EntityBaseSchema(
//   UserEntityPropsSchema,
//   UserCommandSchema,
//   UserStateValueSchema
// );
// export type UserEntity = z.infer<typeof UserEntitySchema>;

// ------------ Room Entity ------------
// const RoomContextSchema = z.object({
//   workflows: z.map(z.string(), z.custom<AnyInterpreter>()),
// });
// export type RoomContext = z.infer<typeof RoomContextSchema>;

// const StartCommandSchema = z.object({
//   type: z.literal('START'),
//   connectionEntityId: SnowflakeIdSchema,
// });

// const ConnectCommandSchema = z.object({
//   type: z.literal('CONNECT'),
//   connectionEntityId: SnowflakeIdSchema,
// });

// const JoinCommandSchema = z.object({
//   type: z.literal('JOIN'),
//   connectionEntityId: SnowflakeIdSchema,
// });

// const LeaveCommandSchema = z.object({
//   type: z.literal('LEAVE'),
//   connectionEntityId: SnowflakeIdSchema,
// });

// const RoomCommandSchema = z.union([
//   ConnectCommandSchema,
//   JoinCommandSchema,
//   StartCommandSchema,
//   LeaveCommandSchema,
// ]);

// export type RoomCommand = z.infer<typeof RoomCommandSchema>;

// const RoomEntityPropsSchema = z.object({
//   schema: RoomSchemaTypeLiteral,
//   hostConnectionEntityId: SnowflakeIdSchema,
//   connectedEntityIds: z.array(SnowflakeIdSchema),
//   slug: SlugSchema,
//   gameId: GameIdLiteralSchema.optional(),
//   configuration: GameConfigurationSchema.optional(),
// });

// // ------------ Session Entity ------------
// const SessionContextSchema = z.object({
//   foo: z.string(),
// });
// export type SessionContext = z.infer<typeof SessionContextSchema>;

// const SessionEntityPropsSchema = z.object({
//   schema: SessionSchemaTypeLiteral,
//   userId: UserIdSchema,
//   name: z.string(),
// });

// const SessionCommandSchema = z.union([
//   z.object({
//     type: z.literal('RECONNECT'),
//   }),
//   z.object({
//     type: z.literal('DISCONNECT'),
//   }),
// ]);
// export type SessionCommand = z.infer<typeof SessionCommandSchema>;

// const SessionStateValueSchema = z.object({
//   Active: z.enum(['True', 'False']),
// });
// export type SessionStateValue = z.infer<typeof SessionStateValueSchema>;

// export const SessionEntitySchema = EntityBaseSchema(
//   SessionEntityPropsSchema,
//   SessionCommandSchema,
//   SessionStateValueSchema
// );

// export type SessionEntity = z.infer<typeof SessionEntitySchema>;

// const NewRoomStateValueSchema = z.enum([
//   'SelectGame',
//   'EnterName',
//   'Configure',
//   'Complete',
// ]);

// export type NewRoomStateValue = z.infer<typeof NewRoomStateValueSchema>;

// export type NewRoomStateSchema = StateSchemaFromStateValue<NewRoomStateValue>;

// type LittleVigilanteChannelMachine = StateMachine<any, any, any>;
// type BananaTradersChannelMachine = StateMachine<any, any, any>;
// type RoomChannelMachine = StateMachine<any, any, any>;
// type DirectChannelMachine = StateMachine<any, any, any>;
// type GroupChannelMachine = StateMachine<any, any, any>;

// type ChannelMachine =
//   | LittleVigilanteChannelMachine
//   | BananaTradersChannelMachine
//   | RoomChannelMachine
//   | DirectChannelMachine
//   | GroupChannelMachine;

// const ChatContextSchema = z.object({
//   channelEntityIds: z.record(SnowflakeIdSchema, SnowflakeIdSchema),
// });
// export type ChatContext = z.infer<typeof ChatContextSchema>;

// const JoinChannelCommandSchema = z.object({
//   type: z.literal('JOIN_CHANNEL'),
//   channelId: SnowflakeIdSchema,
// });

// const LeaveChannelCommandSchema = z.object({
//   type: z.literal('LEAVE_CHANNEL'),
//   channelId: SnowflakeIdSchema,
// });

// const ChatCommandSchema = z.union([
//   JoinChannelCommandSchema,
//   LeaveChannelCommandSchema,
// ]);
// export type ChatCommand = z.infer<typeof ChatCommandSchema>;

// const ConnectionEntityPropsSchema = z.object({
//   schema: ConnectionSchemaTypeLiteral,
//   sessionId: SnowflakeIdSchema.optional(),
//   authTokens: AuthTokensSchema.optional(),
//   deviceId: SnowflakeIdSchema.optional(),
//   currentRoomSlug: SlugSchema.optional(),
//   connectedRoomSlugs: z.array(SlugSchema),
//   activeRoomSlugs: z.array(SlugSchema),
//   currentGeolocation: z.custom<GeolocationPosition>().optional(),
//   chatService: z
//     .object({
//       context: ChatContextSchema,
//       value: ChatStateValueSchema,
//     })
//     .optional(),
//   newRoomService: z
//     .object({
//       context: NewRoomContextSchema,
//       value: NewRoomStateValueSchema,
//     })
//     .optional(),
//   instanceId: z.string().uuid().optional(),
// });
// type ConnectionEntitProps = z.infer<typeof ConnectionEntityPropsSchema>;

// const ConnectionHeartbeatCommandSchema = z.object({
//   type: z.literal('HEARTBEAT'),
// });

// export const HomeRoutePropsSchema = z.object({
//   name: z.literal('Home'),
// });

// export const LoginRoutePropsSchema = z.object({
//   name: z.literal('Login'),
// });

// export const NewRoomRoutePropsSchema = z.object({
//   name: z.literal('NewRoom'),
// });

// export const RoomRoutePropsSchema = z.object({
//   name: z.literal('Room'),
//   roomSlug: z.string(),
// });

// export const RoutePropsSchema = z.union([
//   HomeRoutePropsSchema,
//   NewRoomRoutePropsSchema,
//   RoomRoutePropsSchema,
//   LoginRoutePropsSchema,
// ]);
// export type RouteProps = z.infer<typeof RoutePropsSchema>;

// export const ConnectionInitializeInputSchema = z.object({
//   deviceId: SnowflakeIdSchema.optional().nullable(),
//   initialRouteProps: RoutePropsSchema,
//   authTokens: AuthTokensSchema.optional().nullable(),
// });

// const ConnectionNavigateCommandSchema = z.object({
//   type: z.literal('NAVIGATE'),
//   route: RoutePropsSchema,
// });

// const ConnectionInitializeCommandSchema =
//   ConnectionInitializeInputSchema.extend({
//     type: z.literal('INITIALIZE'),
//   });

// const UpdateGeolocationPositionCommandSchema = z.object({
//   type: z.literal('UPDATE_GEOLOCATION_POSITION'),
//   position: z.custom<GeolocationPosition>().optional(),
// });

// export type ConnectionMachine = StateMachine<
//   ConnectionContext,
//   ConnectionStateSchema,
//   ConnectionCommand
// >;

// const BaseConnectionCommandSchema = z.union([
//   ConnectionInitializeCommandSchema,
//   ConnectionHeartbeatCommandSchema,
//   ConnectionNavigateCommandSchema,
// ]);

// const ConnectionEntitySchema = EntityBaseSchema(
//   ConnectionEntityPropsSchema,
//   ConnectionCommandSchema,
//   ConnectionStateValueSchema
// );

// export type ConnectionEntity = z.infer<typeof ConnectionEntitySchema>;

// const RoomStateValueSchema = z.object({
//   Scene: z.enum(['Lobby', 'Loading', 'Game']),
//   Active: z.enum(['No', 'Yes']), // Yes if there is at least 1 player currently connected
// });

// type RoomStateValue = z.infer<typeof RoomStateValueSchema>;

// const RoomMessageDataSchema = z.object({
//   sender: SnowflakeIdSchema,
//   type: MessageEventTypeLiteral,
//   content: z.string(),
// });
// export type RoomMessageData = z.infer<typeof RoomMessageDataSchema>;

// const RoomEventSchema = z.discriminatedUnion('type', [
//   MessageEventSchema,
//   JoinEventSchema,
//   LeaveEventSchema,
// ]);

// export type RoomEvent = z.infer<typeof RoomEventSchema>;

// const RoomEntitySchema = EntityBaseSchema(
//   RoomEntityPropsSchema,
//   RoomCommandSchema,
//   RoomStateValueSchema
// );

// export type RoomEntity = z.infer<typeof RoomEntitySchema>;

// const ChannelEventTypeSchema = z.union([
//   LogEventTypeLiteral,
//   JoinEventTypeLiteral,
//   MessageEventTypeLiteral,
//   LeaveEventTypeLiteral,
// ]);

// const PlainMessageTemplateSchema = z.object({
//   messageType: MessageEventTypeLiteral,
//   contentTemplate: z.string(),
// });

// const MessageTemplateSchema = PlainMessageTemplateSchema;

// export type MessageTemplate = z.infer<typeof MessageTemplateSchema>;

// const MessageChannelEntityPropsSchema = z.object({
//   schema: MessageChannelSchemaTypeLiteral,
//   messages: z.array(ChannelEventSchema),
//   connectionId: SnowflakeIdSchema,
//   parentId: SnowflakeIdSchema,
//   tsOffset: z.number().optional(),
// });

// const TypingCommandSchema = z.object({
//   type: z.literal('TYPE'),
// });

// const MessageChannelCommandSchema = TypingCommandSchema;
// export type MessageChannelCommand = z.infer<typeof MessageChannelCommandSchema>;

// const MessageChannelStateValueSchema = z.object({
//   Initialized: z.enum(['Running', 'Error']), // todo
// });

// type MessageChannelStateValue = z.infer<typeof MessageChannelStateValueSchema>;

// const MessageChannelEntitySchema = EntityBaseSchema(
//   MessageChannelEntityPropsSchema,
//   MessageChannelCommandSchema,
//   MessageChannelStateValueSchema
// );

// export type MessageChannelEntity = z.infer<typeof MessageChannelEntitySchema>;

// const CodebreakersEventSchema = MessageEventSchema;

// const CodebreakersGameEntityPropSchema = z.object({
//   schema: CodebreakersGameSchemaTypeLiteral,
//   gameId: CodebreakersGameId,
//   playerEntityIds: z.array(SnowflakeIdSchema),
//   roomEntityId: SnowflakeIdSchema,
// });

// const CodebreakersGameStateValueSchema = z.object({
//   Active: z.enum(['True', 'False']),
// });

// export type CodebreakersGameStateValue = z.infer<
//   typeof CodebreakersGameStateValueSchema
// >;

// const CodebreakersGameCommandSchema = z.union([
//   StartCommandSchema,
//   LeaveCommandSchema,
// ]);

// export type CodebreakersGameCommand = z.infer<
//   typeof CodebreakersGameCommandSchema
// >;

// const CodebreakersGameEntitySchema = EntityBaseSchema(
//   CodebreakersGameEntityPropSchema,
//   CodebreakersGameCommandSchema,
//   CodebreakersGameStateValueSchema
// );

// type CodebreakersGameEntity = z.infer<typeof CodebreakersGameEntitySchema>;

// export type CodebreakersGameStateSchema =
//   StateSchemaFromStateValue<CodebreakersGameStateValue>;

// const CodebreakersGameContextSchema = z.object({
//   foo: z.string(),
// });
// export type CodebreakersGameContext = z.infer<
//   typeof CodebreakersGameContextSchema
// >;

// export type CodebreakersGameMachine = StateMachine<
//   CodebreakersGameContext,
//   CodebreakersGameStateSchema,
//   CodebreakersGameCommand
// >;

// const CodebreakersPlayerEntityPropSchema = z.object({
//   schema: CodebreakersPlayerSchemaTypeLiteral,
//   gameEntityId: SnowflakeIdSchema,
//   userId: UserIdSchema,
// });

// const CodebreakersPlayerStateValueSchema = z.object({
//   Active: z.enum(['True', 'False']),
// });
// export type CodebreakersPlayerStateValue = z.infer<
//   typeof CodebreakersPlayerStateValueSchema
// >;

// const CodebreakersPlayerCommandSchema = z.union([
//   StartCommandSchema,
//   LeaveCommandSchema,
// ]);

// export type CodebreakersPlayerCommand = z.infer<
//   typeof CodebreakersPlayerCommandSchema
// >;

// const CodebreakersPlayerEntitySchema = EntityBaseSchema(
//   CodebreakersPlayerEntityPropSchema,
//   CodebreakersPlayerCommandSchema,
//   CodebreakersPlayerStateValueSchema
// );
// type CodebreakersPlayerEntity = z.infer<typeof CodebreakersPlayerEntitySchema>;

// export type CodebreakersPlayerStateSchema =
//   StateSchemaFromStateValue<CodebreakersPlayerStateValue>;

// const CodebreakersPlayerContextSchema = z.object({
//   foo: z.string(),
// });
// export type CodebreakersPlayerContext = z.infer<
//   typeof CodebreakersPlayerContextSchema
// >;

// export type CodebreakersPlayerMachine = StateMachine<
//   CodebreakersPlayerContext,
//   CodebreakersPlayerStateSchema,
//   CodebreakersPlayerCommand
// >;

// const TriggerEntityPropSchema = z.object({
//   schema: TriggerSchemaTypeLiteral,
//   config: z.lazy(() => TriggerConfigSchema),
//   input: z.record(z.any()),
//   // input: z.any().required(),
// });

// const TriggerStateValueSchema = z.object({
//   Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
// });

// export type TriggerStateValue = z.infer<typeof TriggerStateValueSchema>;

// const TriggerCommandSchema = z.union([StartCommandSchema, LeaveCommandSchema]);

// export type TriggerCommand = z.infer<typeof TriggerCommandSchema>;

// const TriggerEntitySchema = EntityBaseSchema(
//   TriggerEntityPropSchema,
//   TriggerCommandSchema,
//   TriggerStateValueSchema
// );

// export type TriggerEntity = z.infer<typeof TriggerEntitySchema>;

// const TriggerContextSchema = z.object({
//   foo: z.string(),
// });
// export type TriggerContext = z.infer<typeof TriggerContextSchema>;

// export const EntitySchema = z.discriminatedUnion('schema', [
//   ConnectionEntitySchema,
//   SessionEntitySchema,
//   RoomEntitySchema,
//   UserEntitySchema,
//   TriggerEntitySchema,
//   MessageChannelEntitySchema,
//   BananaTradersGameEntitySchema,
//   BananaTradersPlayerEntitySchema,
//   CodebreakersGameEntitySchema,
//   CodebreakersPlayerEntitySchema,
//   LittleVigilanteGameEntitySchema,
//   LittleVigilantePlayerEntitySchema,
// ]);

// export const EntityCommandSchema = z.union([
//   ConnectionCommandSchema,
//   SessionCommandSchema,
//   RoomCommandSchema,
// ]);

// export const EntitySchemas = {
//   user: UserEntitySchema,
//   room: RoomEntitySchema,
//   session: SessionEntitySchema,
//   connection: ConnectionEntitySchema,
//   trigger: TriggerEntitySchema,
//   message_channel: MessageChannelEntitySchema,
//   banana_traders_game: BananaTradersGameEntitySchema,
//   banana_traders_player: BananaTradersPlayerEntitySchema,
//   codebreakers_game: CodebreakersGameEntitySchema,
//   codebreakers_player: CodebreakersPlayerEntitySchema,
//   little_vigilante_game: LittleVigilanteGameEntitySchema,
//   little_vigilante_player: LittleVigilantePlayerEntitySchema,
// };

// const TriggerEntityTemplateVariableSchema = z.object({
//   key: z.string(),
//   path: z.string(),
//   templateDataType: TriggerEntityTemplateDataTypeLiteral,
// });

// const TriggerEventTemplateVariableSchema = z.object({
//   key: z.string(),
//   path: z.string(),
//   templateDataType: TriggerEventTemplateDataTypeLiteral,
// });

// const TriggerEventSubjectTemplateVariableSchema = z.object({
//   key: z.string(),
//   path: z.string(),
//   templateDataType: TriggerEventSubjectTemplateDataTypeLiteral,
// });

// const TriggerMetadataTemplateVariableSchema = z.object({
//   key: z.string(),
//   path: z.string(),
//   templateDataType: TriggerMetadataTemplateDataTypeLiteral,
// });

// const WorkflowEventTemplateVariableSchema = z.object({
//   key: z.string(),
//   path: z.string(),
//   templateDataType: WorkflowEventTemplateDataTypeLiteral,
// });

// const WorkflowVariableSchema = z.discriminatedUnion('templateDataType', [
//   TriggerEntityTemplateVariableSchema,
//   TriggerEventTemplateVariableSchema,
//   TriggerEventSubjectTemplateVariableSchema,
//   TriggerMetadataTemplateVariableSchema,
//   WorkflowEventTemplateVariableSchema,
// ]);

// export type WorkflowVariable = z.infer<typeof WorkflowVariableSchema>;

// const MatchesGuardLiteral = z.literal('matches');

// const MatchesGuardSchema = z.object({
//   guardType: MatchesGuardLiteral,
//   variable: WorkflowVariableSchema,
//   operator: z.enum([
//     '<',
//     '<==',
//     '==',
//     '>',
//     '>=',
//     '!=',
//     'array-contains',
//     'array-contains-any',
//     'in',
//     'not-in',
//   ]),
//   value: z.union([z.number(), z.string()]),
// });
// export type MatchesGuard = z.infer<typeof MatchesGuardSchema>;

// const MessageTemplateMetadataSchema = z.object({
//   markup: z.string(),
//   variables: z.array(WorkflowVariableSchema),
//   handlers: TemplateHandlerSchema,
// });

// type WorkflowInput = z.infer<typeof WorkflowInputSchema>;

// const WorkflowTypeLiteralSchema = ChannelWorkflowLiteral;

// const WorkflowInputSchema = z.discriminatedUnion('triggerType', [
//   z.object({
//     triggerType: EventTriggerTypeLiteral,
//     entity: z.lazy(() => EntitySchema),
//     event: z.lazy(() => ChannelEventSchema),
//     metadata: z.record(z.string(), z.any()),
//   }),
//   z.object({
//     triggerType: WebhookTriggerTypeLiteral,
//     metadata: z.record(z.string(), z.any()),
//   }),
//   z.object({
//     triggerType: CommandTriggerTypeLiteral,
//     command: z.lazy(() => EntityCommandSchema),
//     entity: z.lazy(() => EntitySchema),
//     metadata: z.record(z.string(), z.any()),
//   }),
//   z.object({
//     triggerType: ScheduledTriggerTypeLiteral,
//     metadata: z.record(z.string(), z.any()),
//     // todo scheduleId and other info...
//   }),
// ]);

// // todo add 'filtering' capabilities to these schemas, use firebase ref
// const EventMatchersSchema = z.object({
//   type: ChannelEventTypeSchema,
// });
// const EntityMatchersSchema = z.object({
//   schema: EntitySchemaLiteralsSchema,
// });

// const GuardLiteralsSchema = MatchesGuardLiteral;

// const SendMessageServiceLiteral = z.literal('sendMessage');
// const BroadcastMessageServiceLiteral = z.literal('broadcastMessage');

// const TriggerServiceTypeSchema = z.union([
//   SendMessageServiceLiteral,
//   BroadcastMessageServiceLiteral,
// ]);
// export type TriggerServiceType = z.infer<typeof TriggerServiceTypeSchema>;

// const TemplateVariableDataPathSchema = z.object({
//   templateDataType: TemplateDataTypeLiteralSchema,
//   path: z.string(),
// });

// export type TemplateVariableDataPath = z.infer<
//   typeof TemplateVariableDataPathSchema
// >;

// const SendMessageMetadatataSchema = z.object({
//   serviceType: SendMessageServiceLiteral,
//   template: MessageTemplateMetadataSchema,
//   channelId: TemplateVariableDataPathSchema,
//   senderId: TemplateVariableDataPathSchema,
//   recipientId: TemplateVariableDataPathSchema,
// });
// export type SendMessageMetadata = z.infer<typeof SendMessageMetadatataSchema>;

// const BroadcastMessageMetadataataSchema = z.object({
//   serviceType: BroadcastMessageServiceLiteral,
//   template: MessageTemplateMetadataSchema,
//   channelId: SnowflakeIdSchema,
//   senderId: SnowflakeIdSchema,
// });

// export type BroadcastMessageMetadata = z.infer<
//   typeof BroadcastMessageMetadataataSchema
// >;

// const TriggerServiceMetadataDataSchema = z.discriminatedUnion('serviceType', [
//   SendMessageMetadatataSchema,
//   BroadcastMessageMetadataataSchema,
// ]);
// export type TriggerServiceMetadata = z.infer<
//   typeof TriggerServiceMetadataDataSchema
// >;

// const TriggerGuardSchema = z.discriminatedUnion('guardType', [
//   MatchesGuardSchema,
// ]);

// // dummy action probably not used
// const ConsoleLogActionSchema = z.object({
//   actionType: z.literal('ConsoleLog'),
//   message: z.string(),
// });

// const TriggerActionsSchema = z.discriminatedUnion('actionType', [
//   ConsoleLogActionSchema,
// ]);

// const EventTriggerInputSchema = z.object({
//   event: ChannelEventSchema,
//   entity: EntitySchema,
//   metadata: z.any(),
//   triggerType: EventTriggerTypeLiteral,
// });

// const ScheduledTriggerInputSchema = z.object({
//   metadata: z.any(),
//   triggerType: ScheduledTriggerTypeLiteral,
// });

// const WebhookTriggerInputSchema = z.object({
//   metadata: z.any(),
//   triggerType: WebhookTriggerTypeLiteral,
// });

// const CommmandTriggerInputSchema = z.object({
//   metadata: z.any(),
//   triggerType: CommandTriggerTypeLiteral,
// });

// export const TriggerInputSchema = z.discriminatedUnion('triggerType', [
//   EventTriggerInputSchema,
//   ScheduledTriggerInputSchema,
//   CommmandTriggerInputSchema,
//   WebhookTriggerInputSchema,
// ]);
// export type TriggerInput = z.infer<typeof TriggerInputSchema>;

// const EventTriggerConfigSchema = z.object({
//   id: SnowflakeIdSchema,
//   event: EventMatchersSchema,
//   entity: EntityMatchersSchema,
//   triggerType: EventTriggerTypeLiteral,
//   workflowConfig: z.object({
//     machine: z.custom<Parameters<typeof createMachine>[0]>(),
//     actions: z.record(z.string(), TriggerActionsSchema).optional(),
//     guards: z.record(z.string(), TriggerGuardSchema).optional(),
//     services: z.record(z.string(), TriggerServiceMetadataDataSchema).optional(),
//   }),
// });

// export type EventTriggerConfigSchema = z.infer<typeof EventTriggerConfigSchema>;

// // const WorkflowConfigSchema = z.object({
// //   machine: z.custom<Parameters<typeof createMachine>[0]>(),
// //   actions: z.record(z.string(), TriggerActionsSchema),
// //   guards: z.record(z.string(), TriggerGuardSchema),
// //   services: z.record(z.string(), TriggerServiceMetadataDataSchema),
// // });

// const ScheduledTriggerConfigSchema = z.object({
//   id: SnowflakeIdSchema,
//   triggerType: ScheduledTriggerTypeLiteral,
//   workflowConfig: z.object({
//     machine: z.custom<Parameters<typeof createMachine>[0]>(),
//     actions: z.record(z.string(), TriggerActionsSchema),
//     guards: z.record(z.string(), TriggerGuardSchema),
//     services: z.record(z.string(), TriggerServiceMetadataDataSchema),
//   }),
// });

// const WebhookTriggerConfigSchema = z.object({
//   id: SnowflakeIdSchema,
//   triggerType: WebhookTriggerTypeLiteral,
//   workflowConfig: z.object({
//     machine: z.custom<Parameters<typeof createMachine>[0]>(),
//     actions: z.record(z.string(), TriggerActionsSchema),
//     guards: z.record(z.string(), TriggerGuardSchema),
//     services: z.record(z.string(), TriggerServiceMetadataDataSchema),
//   }),
// });

// const TriggerConfigSchema = z.discriminatedUnion('triggerType', [
//   EventTriggerConfigSchema,
//   WebhookTriggerConfigSchema,
//   ScheduledTriggerConfigSchema,
// ]);

// export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

// const WorkflowContextSchema = z.object({
//   entity: TriggerEntitySchema,
//   input: TriggerInputSchema,
// });

// export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;
