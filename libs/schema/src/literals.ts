import { z } from 'zod';

export const UserSchemaTypeLiteral = z.literal('user');
export const SessionSchemaTypeLiteral = z.literal('session');
export const WorkflowSchemaTypeLiteral = z.literal('workflow');
export const ConnectionSchemaTypeLiteral = z.literal('connection');
export const RoomSchemaTypeLiteral = z.literal('room');
export const MessageChannelSchemaTypeLiteral = z.literal('message_channel');
export const BananaTradersGameSchemaTypeLiteral = z.literal(
  'banana_traders_game'
);
export const StrikersGameSchemaTypeLiteral = z.literal('strikers_game');
export const StrikersTurnSchemaTypeLiteral = z.literal('strikers_turn');
export const StrikersEffectSchemaTypeLiteral = z.literal('strikers_effect');
export const StrikersPlayerSchemaTypeLiteral = z.literal('strikers_player');
export const BananaTradersPlayerSchemaTypeLiteral = z.literal(
  'banana_traders_player'
);
export const LittleVigilanteGameSchemaTypeLiteral = z.literal(
  'little_vigilante_game'
);
export const LittleVigilantePlayerSchemaTypeLiteral = z.literal(
  'little_vigilante_player'
);
export const CodebreakersGameSchemaTypeLiteral = z.literal('codebreakers_game');
export const CodebreakersPlayerSchemaTypeLiteral = z.literal(
  'codebreakers_player'
);
export const TriggerSchemaTypeLiteral = z.literal('trigger');
export const ChannelWorkflowLiteral = z.literal('channel_workflow');
export const TriggerEventTemplateDataTypeLiteral = z.literal('trigger_event');
export const TriggerEntityTemplateDataTypeLiteral = z.literal('trigger_entity');
export const TriggerEventSubjectTemplateDataTypeLiteral = z.literal(
  'trigger_event_subject'
);
export const TriggerMetadataTemplateDataTypeLiteral =
  z.literal('trigger_metadata');
export const WorkflowEventTemplateDataTypeLiteral = z.literal('workflow_event');

export const TemplateDataTypeLiteralSchema = z.union([
  TriggerEventTemplateDataTypeLiteral,
  TriggerEntityTemplateDataTypeLiteral,
  TriggerEventSubjectTemplateDataTypeLiteral,
  TriggerMetadataTemplateDataTypeLiteral,
  WorkflowEventTemplateDataTypeLiteral,
]);
export type TemplateDataType = z.infer<typeof TemplateDataTypeLiteralSchema>;

export const LittleVigilanteGameIdLiteral = z.literal('little_vigilante');
export const CodebreakersGameIdLiteral = z.literal('codebreakers');
export const BananaTradersGameIdLiteral = z.literal('banana_traders');
export const StrikersGameIdLiteral = z.literal('strikers');

export const GameIdLiteralSchema = z.union([
  LittleVigilanteGameIdLiteral,
  CodebreakersGameIdLiteral,
  BananaTradersGameIdLiteral,
  StrikersGameIdLiteral,
]);
export type GameId = z.infer<typeof GameIdLiteralSchema>;

export const LogEventTypeLiteral = z.literal('LOG');
export const MessageEventTypeLiteral = z.literal('MESSAGE');
export const UpdateMessageEventTypeLiteral = z.literal('UPDATE_MESSAGE');
export const JoinEventTypeLiteral = z.literal('JOIN');
export const ConnectEventTypeLiteral = z.literal('CONNECT');
export const DisconnectEventTypeLiteral = z.literal('DISCONNECT');
export const LeaveEventTypeLiteral = z.literal('LEAVE');
export const DebugEventTypeLiteral = z.literal('DEBUG');

export const ChannelEventTypeSchema = z.union([
  LogEventTypeLiteral,
  JoinEventTypeLiteral,
  MessageEventTypeLiteral,
  LeaveEventTypeLiteral,
]);

export const EventTriggerTypeLiteral = z.literal('event');
// export const EntityTriggerTypeLiteral = z.literal('entity');
// export const IndexTriggerTypeLiteral = z.literal('index');
export const CommandTriggerTypeLiteral = z.literal('command');
export const WebhookTriggerTypeLiteral = z.literal('webhook');
export const ScheduledTriggerTypeLiteral = z.literal('scheduled');

export const TriggerTypeLiteralSchema = z.union([
  EventTriggerTypeLiteral,
  // EntityTriggerTypeLiteral,
  // IndexTriggerTypeLiteral,
  CommandTriggerTypeLiteral,
  WebhookTriggerTypeLiteral,
]);

export const EntitySchemaLiteralsSchema = z.union([
  ConnectionSchemaTypeLiteral,
  SessionSchemaTypeLiteral,
  RoomSchemaTypeLiteral,
  UserSchemaTypeLiteral,
  MessageChannelSchemaTypeLiteral,
  WorkflowSchemaTypeLiteral,
  TriggerSchemaTypeLiteral,
]);

export const SendMessageServiceLiteral = z.literal('sendMessage');
export const BroadcastMessageServiceLiteral = z.literal('broadcastMessage');
export const MatchesGuardLiteral = z.literal('matches');

export const TriggerServiceTypeSchema = z.union([
  SendMessageServiceLiteral,
  BroadcastMessageServiceLiteral,
]);
