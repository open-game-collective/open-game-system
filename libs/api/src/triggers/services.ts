import {
  BroadcastMessageMetadata,
  SendMessageMetadata,
  SnowflakeId,
  TemplateDataType,
  TemplateVariableDataPath,
  TriggerServiceMetadata,
  TriggerServiceType,
  WorkflowCommand,
  WorkflowContext,
  WorkflowVariable,
} from '@explorers-club/schema';
import { assert, getValueFromPath } from '@explorers-club/utils';
import { InvokeCreator } from 'xstate';
import { entitiesById } from '../server/state';

type TriggerService = (
  context: WorkflowContext,
  event: WorkflowCommand,
  metadata: TriggerServiceMetadata
) => InvokeCreator<WorkflowContext, WorkflowCommand>;

export const triggerServices = {
  sendMessage: (
    context: WorkflowContext,
    event: WorkflowCommand,
    metadata: SendMessageMetadata
  ) => {
    const data: Partial<Record<TemplateDataType, any>> = {
      trigger_metadata: context.input.metadata,
      workflow_event: event,
    };

    if (context.input.triggerType === 'event') {
      data.trigger_entity = context.input.entity;
      data.trigger_event = context.input.event;

      if ('subjectId' in context.input.event) {
        const { subjectId } = context.input.event;
        const subject = entitiesById.get(subjectId);
        assert(subject, 'failed to find subject for subjectId ' + subjectId);
        data.trigger_event_subject = subject;
      }
    } else if (context.input.triggerType === 'command') {
      // add command data to data blob here...
    } else if (context.input.triggerType === 'scheduled') {
      // add scheduled data to data blob here...
    } else if (context.input.triggerType === 'webhook') {
      // add webhook data to data blob here...
    }

    const channelId = getTemplateVariableValue(data, metadata.channelId);
    assert(channelId, 'expected channelId in sendMessage');
    const senderId = getTemplateVariableValue(data, metadata.senderId);
    assert(senderId, 'expected senderId in sendMessage');
    const recipientId = getTemplateVariableValue(data, metadata.recipientId);
    assert(recipientId, 'expected senderId in sendMessage');

    // get all the template variables
    const templateVariables: {
      channelId: SnowflakeId;
      senderId: SnowflakeId;
      recipientId: SnowflakeId;
    } & Partial<Record<string, any>> = {
      channelId,
      senderId,
      recipientId,
    };
    metadata.template.variables.forEach((templateVar) => {
      templateVariables[templateVar.key] = 1 as any;
    });
    console.log({ data, metadata, templateVariables });

    // set up the handlers
    // any time there is an
    // metadata.template.handlers.

    // send the message
  },
  broadcastMessage: (
    context: WorkflowContext,
    event: WorkflowCommand,
    metadata: BroadcastMessageMetadata
  ) => {
    console.log('broadcast MESSAGE WITH DATA!', metadata);
  },
} as unknown as Record<TriggerServiceType, TriggerService>;

const getTemplateVariableValue = (
  data: Partial<Record<TemplateDataType, any>>,
  dataPath: TemplateVariableDataPath
) => {
  switch (dataPath.templateDataType) {
    case 'trigger_entity':
      return getValueFromPath(data.trigger_entity, dataPath.path);
    case 'trigger_event':
      return getValueFromPath(data.trigger_event, dataPath.path);
    case 'trigger_metadata':
      return getValueFromPath(data.trigger_metadata, dataPath.path);
    case 'trigger_event_subject':
      return getValueFromPath(data.trigger_event_subject, dataPath.path);
    case 'workflow_event':
      return getValueFromPath(data.workflow_event, dataPath.path);
    default:
      throw 'not implemented';
  }
  return '';
};
