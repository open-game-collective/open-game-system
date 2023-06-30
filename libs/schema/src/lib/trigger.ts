import { createMachine } from 'xstate';
import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import {
  BroadcastMessageServiceLiteral,
  ChannelEventTypeSchema,
  CommandTriggerTypeLiteral,
  EntitySchemaLiteralsSchema,
  EventTriggerTypeLiteral,
  MatchesGuardLiteral,
  ScheduledTriggerTypeLiteral,
  SendMessageServiceLiteral,
  TemplateDataTypeLiteralSchema,
  TriggerEntityTemplateDataTypeLiteral,
  TriggerEventSubjectTemplateDataTypeLiteral,
  TriggerEventTemplateDataTypeLiteral,
  TriggerMetadataTemplateDataTypeLiteral,
  TriggerSchemaTypeLiteral,
  WebhookTriggerTypeLiteral,
  WorkflowEventTemplateDataTypeLiteral,
} from '../literals';

export const TemplateVariableDataPathSchema = z.object({
  templateDataType: TemplateDataTypeLiteralSchema,
  path: z.string(),
});

const CommandHandlerSchema = z.object({
  command: z.string(),
});

const TemplateHandlerSchema = z.object({
  onChange: z.record(CommandHandlerSchema).optional(),
  onConfirm: z.record(CommandHandlerSchema).optional(),
  onSubmit: z.record(CommandHandlerSchema).optional(),
  onPress: z.record(CommandHandlerSchema).optional(),
});

const MessageTemplateMetadataSchema = z.object({
  markup: z.string(),
  variables: z.array(z.lazy(() => WorkflowVariableSchema)),
  handlers: TemplateHandlerSchema,
});

export const SendMessageMetadatataSchema = z.object({
  serviceType: SendMessageServiceLiteral,
  template: MessageTemplateMetadataSchema,
  channelId: TemplateVariableDataPathSchema,
  senderId: TemplateVariableDataPathSchema,
  recipientId: TemplateVariableDataPathSchema,
});

export const BroadcastMessageMetadataataSchema = z.object({
  serviceType: BroadcastMessageServiceLiteral,
  template: MessageTemplateMetadataSchema,
  channelId: SnowflakeIdSchema,
  senderId: SnowflakeIdSchema,
});

export const TriggerServiceMetadataDataSchema = z.discriminatedUnion(
  'serviceType',
  [SendMessageMetadatataSchema, BroadcastMessageMetadataataSchema]
);

const StartCommandSchema = z.object({
  type: z.literal('START'),
  connectionEntityId: SnowflakeIdSchema,
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
  connectionEntityId: SnowflakeIdSchema,
});

const TriggerEntityPropsSchema = z.object({
  schema: TriggerSchemaTypeLiteral,
  config: z.lazy(() => TriggerConfigSchema),
  input: z.record(z.any()),
  // input: z.any().required(),
});

export const TriggerStateValueSchema = z.object({
  Status: z.enum(['Unitialized', 'Paused', 'Running', 'Complete']),
});

export const TriggerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const TriggerEntitySchema = EntityBaseSchema(
  TriggerEntityPropsSchema,
  TriggerCommandSchema,
  TriggerStateValueSchema
);

export const TriggerContextSchema = z.object({
  foo: z.string(),
});

const EventMatchersSchema = z.object({
  type: ChannelEventTypeSchema,
});
const EntityMatchersSchema = z.object({
  schema: EntitySchemaLiteralsSchema,
});

// dummy action probably not used
const ConsoleLogActionSchema = z.object({
  actionType: z.literal('ConsoleLog'),
  message: z.string(),
});

const TriggerActionsSchema = z.discriminatedUnion('actionType', [
  ConsoleLogActionSchema,
]);

const EventTriggerInputSchema = z.object({
  event: z.any(), // todo verify it has type
  entity: z.any(), // todo verity it has schema
  metadata: z.any(),
  triggerType: EventTriggerTypeLiteral,
});

const ScheduledTriggerInputSchema = z.object({
  metadata: z.any(),
  triggerType: ScheduledTriggerTypeLiteral,
});

const WebhookTriggerInputSchema = z.object({
  metadata: z.any(),
  triggerType: WebhookTriggerTypeLiteral,
});

const CommmandTriggerInputSchema = z.object({
  metadata: z.any(),
  triggerType: CommandTriggerTypeLiteral,
});

export const TriggerInputSchema = z.discriminatedUnion('triggerType', [
  EventTriggerInputSchema,
  ScheduledTriggerInputSchema,
  CommmandTriggerInputSchema,
  WebhookTriggerInputSchema,
]);

export const WorkflowContextSchema = z.object({
  entity: TriggerEntitySchema,
  input: TriggerInputSchema,
});

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

export const WorkflowCommandSchema = z.discriminatedUnion('type', [
  InputChangeEventSchema,
  SubmitFormEventSchema,
]);

// const WorkflowConfigSchema = z.object({
//   machine: z.custom<Parameters<typeof createMachine>[0]>(),
//   actions: z.record(z.string(), TriggerActionsSchema),
//   guards: z.record(z.string(), TriggerGuardSchema),
//   services: z.record(z.string(), TriggerServiceMetadataDataSchema),
// });

export const MatchesGuardSchema = z.object({
  guardType: MatchesGuardLiteral,
  variable: z.lazy(() => WorkflowVariableSchema),
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

export const TriggerGuardSchema = z.discriminatedUnion('guardType', [
  MatchesGuardSchema,
]);

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

export const EventTriggerConfigSchema = z.object({
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

// export type EventTriggerConfigSchema = z.infer<typeof EventTriggerConfigSchema>;

const TriggerConfigSchema = z.discriminatedUnion('triggerType', [
  EventTriggerConfigSchema,
  WebhookTriggerConfigSchema,
  ScheduledTriggerConfigSchema,
]);

const TriggerEntityTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: TriggerEntityTemplateDataTypeLiteral,
});

const TriggerEventTemplateVariableSchema = z.object({
  key: z.string(),
  path: z.string(),
  templateDataType: TriggerEventTemplateDataTypeLiteral,
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

export const WorkflowVariableSchema = z.discriminatedUnion('templateDataType', [
  TriggerEntityTemplateVariableSchema,
  TriggerEventTemplateVariableSchema,
  TriggerEventSubjectTemplateVariableSchema,
  TriggerMetadataTemplateVariableSchema,
  WorkflowEventTemplateVariableSchema,
]);

// const MatchesGuardLiteral = z.literal('matches');

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

// todo add 'filtering' capabilities to these schemas, use firebase ref
// const GuardLiteralsSchema = MatchesGuardLiteral;

// const TriggerServiceTypeSchema = z.union([
//   SendMessageServiceLiteral,
//   BroadcastMessageServiceLiteral,
// ]);
// export type TriggerServiceType = z.infer<typeof TriggerServiceTypeSchema>;
