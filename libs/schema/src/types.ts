import { MakeOptional, MakeRequired } from '@explorers-club/utils';
import { Operation } from 'fast-json-patch';
import { IndexByType, InterpreterFrom, StateMachine } from 'xstate';
import { z } from 'zod';
import {
  ConnectionAccessTokenPropsSchema,
  RouteNameSchema,
  RoutePropsSchema,
  SnowflakeIdSchema,
  StateSchemaFromStateValue,
} from './common';
import {
  ChannelEntitySchema,
  EntityCommandSchema,
  EntitySchema,
  EntitySchemas,
  GameEntitySchema,
} from './entity';
import { ChannelEventSchema, MessageEventSchema } from './events/channel';
import { ClientEventSchema } from './events/client';
import { LobbyGameConfigSchema } from './game-configuration';
import {
  StrikersCardSchema,
  StrikersGameConfigDataSchema,
  StrikersRosterPositionSchema,
} from './game-configuration/strikers';
import {
  CodebreakersGameCommandSchema,
  CodebreakersGameContextSchema,
  CodebreakersGameEntitySchema,
  CodebreakersGameStateValueSchema,
  CodebreakersPlayerCommandSchema,
  CodebreakersPlayerContextSchema,
  CodebreakersPlayerEntitySchema,
  CodebreakersPlayerStateValueSchema,
} from './games/codebreakers';
import {
  StrikersGameCommandSchema,
  StrikersGameContextSchema,
  StrikersGameEntitySchema,
  StrikersGameStateValueSchema,
  // StrikersLineupCommandSchema,
  StrikersTeamSchema,
  StrikersLineupContextSchema,
  StrikersPlayerCommandSchema,
  StrikersPlayerContextSchema,
  StrikersPlayerEntitySchema,
  StrikersPlayerStateValueSchema,
  StrikersTurnCommandSchema,
  StrikersTurnContextSchema,
  StrikersTurnEntitySchema,
  StrikersTurnStateValueSchema,
  StrikersBoardStateSchema,
  StrikersBoardCardSchema,
} from './games/strikers';
import {
  BananaTradersGameCommandSchema,
  BananaTradersGameContextSchema,
  BananaTradersGameEntitySchema,
  BananaTradersGameStateValueSchema,
  BananaTradersPlayerCommandSchema,
  BananaTradersPlayerContextSchema,
  BananaTradersPlayerEntitySchema,
  BananaTradersPlayerStateValueSchema,
} from './games/traders';
import {
  LittleVigilanteGameCommandSchema,
  LittleVigilanteGameContextSchema,
  LittleVigilanteGameEntitySchema,
  LittleVigilanteGameStateValueSchema,
  LittleVigilantePlayerCommandSchema,
  LittleVigilantePlayerContextSchema,
  LittleVigilantePlayerEntitySchema,
  LittleVigilantePlayerStateValueSchema,
} from './games/vigilantes';
import {
  ConnectionCommandSchema,
  ConnectionEntitySchema,
  ConnectionStateValueSchema,
} from './lib/connection';
import {
  MessageChannelCommandSchema,
  MessageChannelContextSchema,
  MessageChannelEntitySchema,
  MessageChannelStateValueSchema,
  MessageTemplateSchema,
} from './lib/message-channel';
import {
  ConnectEventSchema,
  DebugEventSchema,
  DisconnectEventSchema,
  JoinEventSchema,
  LeaveEventSchema,
  LogEventSchema,
  RoomCommandSchema,
  RoomContextSchema,
  RoomEntitySchema,
  RoomEventSchema,
  RoomStateValueSchema,
} from './lib/room';
import {
  SessionCommandSchema,
  SessionContextSchema,
  SessionEntitySchema,
  SessionStateValueSchema,
} from './lib/session';
import {
  BroadcastMessageMetadataataSchema,
  EventTriggerConfigSchema,
  SendMessageMetadatataSchema,
  TemplateVariableDataPathSchema,
  TriggerCommandSchema,
  TriggerContextSchema,
  TriggerEntitySchema,
  TriggerInputSchema,
  TriggerServiceMetadataDataSchema,
  TriggerStateValueSchema,
  WorkflowCommandSchema,
  WorkflowContextSchema,
  WorkflowVariableSchema,
} from './lib/trigger';
import {
  UserCommandSchema,
  UserContextSchema,
  UserEntitySchema,
  UserStateValueSchema,
} from './lib/user';
import {
  TemplateDataTypeLiteralSchema,
  TriggerServiceTypeSchema,
} from './literals';
import {
  NewRoomCommandSchema,
  NewRoomContextSchema,
  NewRoomStateValueSchema,
} from './services';
import {
  ChatCommandSchema,
  ChatContextSchema,
  ChatStateValueSchema,
} from './services/chat';

export type ChatContext = z.infer<typeof ChatContextSchema>;
export type ChatCommand = z.infer<typeof ChatCommandSchema>;
export type ChatStateValue = z.infer<typeof ChatStateValueSchema>;
export type ChatStateSchema = StateSchemaFromStateValue<ChatStateValue>;
export type ChatMachine = StateMachine<
  ChatContext,
  ChatStateSchema,
  ChatCommand
>;
export type ChatInterpreter = InterpreterFrom<ChatMachine>;

export type ConnectionContext = {
  reconnectCount: number;
  chatServiceRef?: ChatInterpreter;
};
// export type InitializedConnectionContext = MakeRequired<
//   ConnectionContext,
//   'chatServiceRef'
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
export type ConnectionCommand = z.infer<typeof ConnectionCommandSchema>;
export type ConnectionEntity = z.infer<typeof ConnectionEntitySchema>;
export type InitializedConnectionEntity = MakeRequired<
  ConnectionEntity,
  'sessionId' | 'deviceId' | 'currentUrl'
>;
export type ConnectionStateValue = z.infer<typeof ConnectionStateValueSchema>;
export type ConnectionStateSchema =
  StateSchemaFromStateValue<ConnectionStateValue>;
export type ConnectionMachine = StateMachine<
  ConnectionContext,
  ConnectionStateSchema,
  WithSenderId<ConnectionCommand>
>;

export type UserEntity = z.infer<typeof UserEntitySchema>;
export type UserCommand = z.infer<typeof UserCommandSchema>;
export type UserStateSchema = StateSchemaFromStateValue<UserStateValue>;
export type UserContext = z.infer<typeof UserContextSchema>;
export type UserMachine = StateMachine<
  UserContext,
  UserStateSchema,
  UserCommand
>;
export type UserInterpreter = InterpreterFrom<UserMachine>;
export type UserStateValue = z.infer<typeof UserStateValueSchema>;

export type SessionEntity = z.infer<typeof SessionEntitySchema>;
export type SessionCommand = z.infer<typeof SessionCommandSchema>;
export type SessionContext = z.infer<typeof SessionContextSchema>;
export type SessionStateValue = z.infer<typeof SessionStateValueSchema>;
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

export type RoomEntity = z.infer<typeof RoomEntitySchema>;
export type RoomCommand = z.infer<typeof RoomCommandSchema>;
export type RoomContext = z.infer<typeof RoomContextSchema>;
export type RoomEvent = z.infer<typeof RoomEventSchema>;
export type RoomStateValue = z.infer<typeof RoomStateValueSchema>;
export type RoomStateSchema = StateSchemaFromStateValue<RoomStateValue>;
export type RoomMachine = StateMachine<
  RoomContext,
  RoomStateSchema,
  WithSenderId<RoomCommand>
>;

export type MessageChannelStateSchema =
  StateSchemaFromStateValue<MessageChannelStateValue>;
export type MessageTemplate = z.infer<typeof MessageTemplateSchema>;
export type MessageChannelCommand = z.infer<typeof MessageChannelCommandSchema>;
type MessageChannelStateValue = z.infer<typeof MessageChannelStateValueSchema>;
export type MessageChannelEntity = z.infer<typeof MessageChannelEntitySchema>;
export type MessageChannelContext = z.infer<typeof MessageChannelContextSchema>;
export type MessageChannelMachine = StateMachine<
  MessageChannelContext,
  MessageChannelStateSchema,
  MessageChannelCommand
>;

export type SendMessageMetadata = z.infer<typeof SendMessageMetadatataSchema>;
export type BroadcastMessageMetadata = z.infer<
  typeof BroadcastMessageMetadataataSchema
>;
export type TriggerServiceMetadata = z.infer<
  typeof TriggerServiceMetadataDataSchema
>;
export type TemplateVariableDataPath = z.infer<
  typeof TemplateVariableDataPathSchema
>;

export type EventTriggerConfigSchema = z.infer<typeof EventTriggerConfigSchema>;
export type TemplateDataType = z.infer<typeof TemplateDataTypeLiteralSchema>;
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;
export type WorkflowCommand = z.infer<typeof WorkflowCommandSchema>;
export type WorkflowVariable = z.infer<typeof WorkflowVariableSchema>;
export type TriggerServiceType = z.infer<typeof TriggerServiceTypeSchema>;
export type TriggerEntity = z.infer<typeof TriggerEntitySchema>;
export type TriggerStateValue = z.infer<typeof TriggerStateValueSchema>;
export type TriggerStateSchema = StateSchemaFromStateValue<TriggerStateValue>;
export type TriggerCommand = z.infer<typeof TriggerCommandSchema>;
export type TriggerContext = z.infer<typeof TriggerContextSchema>;
export type TriggerInput = z.infer<typeof TriggerInputSchema>;
export type TriggerMachine = StateMachine<
  TriggerContext,
  TriggerStateSchema,
  TriggerCommand
>;

export type LeaveEvent = z.infer<typeof LeaveEventSchema>;
export type JoinEvent = z.infer<typeof JoinEventSchema>;
export type ConnectEvent = z.infer<typeof ConnectEventSchema>;
export type DisconnectEvent = z.infer<typeof DisconnectEventSchema>;
export type MessageEvent = z.infer<typeof MessageEventSchema>;
export type LogEvent = z.infer<typeof LogEventSchema>;
export type DebugEvent = z.infer<typeof DebugEventSchema>;
export type ChannelEvent = z.infer<typeof ChannelEventSchema>;
export type SnowflakeId = z.infer<typeof SnowflakeIdSchema>;

export type Entity = z.infer<typeof EntitySchema>;
export type EntityEvent = Parameters<Parameters<Entity['subscribe']>[0]>[0];
export type EntitySchemaType = keyof typeof EntitySchemas;

export type ChannelEntity = z.infer<typeof ChannelEntitySchema>;
export type GameEntity = z.infer<typeof GameEntitySchema>;

export interface Service {
  context: unknown;
  value: unknown;
  event: unknown;
}

type IsService<T, K> = T extends Service ? K : never;

export type EntityServices<T extends Entity> = {
  [K in keyof T as IsService<T[K], K>]: T[K];
};

export type EntityServiceKeys<TEntity extends Entity> =
  keyof EntityServices<TEntity>;

export type EntityTypeMap = {
  connection: ConnectionEntity;
  session: SessionEntity;
  room: RoomEntity;
  user: UserEntity;
  message_channel: MessageChannelEntity;
  codebreakers_game: CodebreakersGameEntity;
  codebreakers_player: CodebreakersPlayerEntity;
  banana_traders_game: BananaTradersPlayerEntity;
  banana_traders_player: BananaTradersPlayerEntity;
  little_vigilante_game: LittleVigilanteGameEntity;
  little_vigilante_player: LittleVigilantePlayerEntity;
  trigger: TriggerEntity;
};

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
    }
  | {
      type: 'strikers_game';
      machine: StrikersGameMachine;
    }
  | {
      type: 'strikers_turn';
      machine: StrikersTurnMachine;
    }
  | {
      type: 'strikers_player';
      machine: StrikersPlayerMachine;
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

// type EntityChangeDelta<TEntity extends Entity> = {
//   property: keyof TEntity;
//   value: TEntity[keyof TEntity];
//   prevValue: TEntity[keyof TEntity];
// };

interface EntityChangeEvent<TEntity extends Entity> {
  type: 'CHANGE';
  data: TEntity;
  patches: Operation[];
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
  | EntityChangeEvent<TEntity>
  | EntityIndexInitEvent<TEntity>
  | EntityIndexAddEvent<TEntity>
  | EntityIndexRemoveEvent<TEntity>;

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

export type InitialEntityProps<TEntity extends Entity> = Omit<
  MakeOptional<TEntity, 'id'>,
  | 'subscribe'
  | 'send'
  | 'states'
  | 'command'
  | 'context'
  | 'children'
  | 'channel'
>;

type SE = InitialEntityProps<StrikersGameEntity>;

export type CreateEventProps<TEvent extends ChannelEvent> = Omit<
  TEvent,
  'id' | 'channelId'
>;

export type NewRoomContext = z.infer<typeof NewRoomContextSchema>;
export type NewRoomCommand = z.infer<typeof NewRoomCommandSchema>;
export type NewRoomStateValue = z.infer<typeof NewRoomStateValueSchema>;
export type NewRoomStateSchema = StateSchemaFromStateValue<NewRoomStateValue>;
export type NewRoomMachine = StateMachine<
  NewRoomContext,
  NewRoomStateSchema,
  NewRoomCommand
>;

export type NewRoomService = InterpreterFrom<NewRoomMachine>;

export type NewRoomServiceId = 'new-room-service';

export type ChatServiceId = 'chat-service';

export type ServiceId = NewRoomServiceId | ChatServiceId;

export type LittleVigilanteGameStateValue = z.infer<
  typeof LittleVigilanteGameStateValueSchema
>;

export type LittleVigilanteGameCommand = z.infer<
  typeof LittleVigilanteGameCommandSchema
>;

export type LittleVigilanteGameEntity = z.infer<
  typeof LittleVigilanteGameEntitySchema
>;

export type LittleVigilanteGameStateSchema =
  StateSchemaFromStateValue<LittleVigilanteGameStateValue>;
export type LittleVigilanteGameContext = z.infer<
  typeof LittleVigilanteGameContextSchema
>;

export type LittleVigilanteGameMachine = StateMachine<
  LittleVigilanteGameContext,
  LittleVigilanteGameStateSchema,
  LittleVigilanteGameCommand
>;
export type LittleVigilantePlayerStateValue = z.infer<
  typeof LittleVigilantePlayerStateValueSchema
>;
export type LittleVigilantePlayerCommand = z.infer<
  typeof LittleVigilantePlayerCommandSchema
>;

export type LittleVigilantePlayerEntity = z.infer<
  typeof LittleVigilantePlayerEntitySchema
>;

export type LittleVigilantePlayerStateSchema =
  StateSchemaFromStateValue<LittleVigilantePlayerStateValue>;

export type LittleVigilantePlayerContext = z.infer<
  typeof LittleVigilantePlayerContextSchema
>;

export type LittleVigilantePlayerMachine = StateMachine<
  LittleVigilantePlayerContext,
  LittleVigilantePlayerStateSchema,
  LittleVigilantePlayerCommand
>;
export type CodebreakersGameStateValue = z.infer<
  typeof CodebreakersGameStateValueSchema
>;
export type CodebreakersGameCommand = z.infer<
  typeof CodebreakersGameCommandSchema
>;
export type CodebreakersGameEntity = z.infer<
  typeof CodebreakersGameEntitySchema
>;

export type CodebreakersGameStateSchema =
  StateSchemaFromStateValue<CodebreakersGameStateValue>;

export type CodebreakersGameContext = z.infer<
  typeof CodebreakersGameContextSchema
>;

export type CodebreakersGameMachine = StateMachine<
  CodebreakersGameContext,
  CodebreakersGameStateSchema,
  CodebreakersGameCommand
>;
export type CodebreakersPlayerStateValue = z.infer<
  typeof CodebreakersPlayerStateValueSchema
>;
export type CodebreakersPlayerCommand = z.infer<
  typeof CodebreakersPlayerCommandSchema
>;
export type CodebreakersPlayerEntity = z.infer<
  typeof CodebreakersPlayerEntitySchema
>;

export type CodebreakersPlayerStateSchema =
  StateSchemaFromStateValue<CodebreakersPlayerStateValue>;

export type CodebreakersPlayerContext = z.infer<
  typeof CodebreakersPlayerContextSchema
>;

export type CodebreakersPlayerMachine = StateMachine<
  CodebreakersPlayerContext,
  CodebreakersPlayerStateSchema,
  CodebreakersPlayerCommand
>;

export type BananaTradersPlayerStateSchema =
  StateSchemaFromStateValue<BananaTradersPlayerStateValue>;

export type BananaTradersPlayerContext = z.infer<
  typeof BananaTradersPlayerContextSchema
>;

export type BananaTradersPlayerEntity = z.infer<
  typeof BananaTradersPlayerEntitySchema
>;

export type BananaTradersPlayer = z.infer<
  typeof BananaTradersPlayerEntitySchema
>;

export type BananaTradersPlayerMachine = StateMachine<
  BananaTradersPlayerContext,
  BananaTradersPlayerStateSchema,
  BananaTradersPlayerCommand
>;

export type BananaTradersPlayerStateValue = z.infer<
  typeof BananaTradersPlayerStateValueSchema
>;

export type BananaTradersPlayerCommand = z.infer<
  typeof BananaTradersPlayerCommandSchema
>;

export type BananaTradersGameContext = z.infer<
  typeof BananaTradersGameContextSchema
>;

export type BananaTradersGameMachine = StateMachine<
  BananaTradersGameContext,
  BananaTradersGameStateSchema,
  BananaTradersGameCommand
>;

export type BananaTradersGameEntity = z.infer<
  typeof BananaTradersGameEntitySchema
>;

export type BananaTradersGameStateSchema =
  StateSchemaFromStateValue<BananaTradersGameStateValue>;

export type BananaTradersGameCommand = z.infer<
  typeof BananaTradersGameCommandSchema
>;

export type BananaTradersGameStateValue = z.infer<
  typeof BananaTradersGameStateValueSchema
>;

export type StrikersGameEntity = z.infer<typeof StrikersGameEntitySchema>;
export type StrikersGameStateValue = z.infer<
  typeof StrikersGameStateValueSchema
>;
export type StrikersGameCommand = z.infer<typeof StrikersGameCommandSchema>;
export type StrikersGameStateSchema =
  StateSchemaFromStateValue<StrikersGameStateValue>;
export type StrikersGameContext = z.infer<typeof StrikersGameContextSchema>;
export type StrikersGameMachine = StateMachine<
  StrikersGameContext,
  StrikersGameStateSchema,
  WithSenderId<StrikersGameCommand>
>;
export type StrikersGameConfigData = z.infer<
  typeof StrikersGameConfigDataSchema
>;
export type StrikersTeam = z.infer<typeof StrikersTeamSchema>;
export type StrikersBoard = z.infer<typeof StrikersBoardStateSchema>;
export type StrikersBoardCard = z.infer<typeof StrikersBoardCardSchema>;
export type StrikersPlayerPosition = z.infer<
  typeof StrikersRosterPositionSchema
>;
export type StrikersCard = z.infer<typeof StrikersCardSchema>;
// export type StrikersLineupCommand = z.infer<typeof StrikersLineupCommandSchema>;
export type StrikersLineupContext = z.infer<typeof StrikersLineupContextSchema>;

export type StrikersPlayerEntity = z.infer<typeof StrikersPlayerEntitySchema>;
export type StrikersPlayerStateValue = z.infer<
  typeof StrikersPlayerStateValueSchema
>;
export type StrikersPlayerCommand = z.infer<typeof StrikersPlayerCommandSchema>;
export type StrikersPlayerStateSchema =
  StateSchemaFromStateValue<StrikersPlayerStateValue>;
export type StrikersPlayerContext = z.infer<typeof StrikersPlayerContextSchema>;
export type StrikersPlayerMachine = StateMachine<
  StrikersPlayerContext,
  StrikersPlayerStateSchema,
  WithSenderId<StrikersPlayerCommand>
>;

export type StrikersTurnEntity = z.infer<typeof StrikersTurnEntitySchema>;
export type StrikersTurnStateValue = z.infer<
  typeof StrikersTurnStateValueSchema
>;
export type StrikersTurnCommand = z.infer<typeof StrikersTurnCommandSchema>;
export type StrikersTurnStateSchema =
  StateSchemaFromStateValue<StrikersTurnStateValue>;
export type StrikersTurnContext = z.infer<typeof StrikersTurnContextSchema>;
export type StrikersTurnMachine = StateMachine<
  StrikersTurnContext,
  StrikersTurnStateSchema,
  WithSenderId<StrikersTurnCommand>
>;

export type EntityCommand = z.infer<typeof EntityCommandSchema>;
export type WithSenderId<TCommand extends EntityCommand> = TCommand & {
  senderId: SnowflakeId;
};

export type RouteProps = z.infer<typeof RoutePropsSchema>;
export type RouteName = z.infer<typeof RouteNameSchema>;

export type ConnectionAccessTokenProps = z.infer<
  typeof ConnectionAccessTokenPropsSchema
>;

export type LobbyGameConfig = z.infer<typeof LobbyGameConfigSchema>;
