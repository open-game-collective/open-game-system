import {
  BroadcastMessageMetadata,
  SendMessageMetadata,
  TriggerServiceMetadata,
  TriggerServiceType,
  WorkflowCommand,
  WorkflowContext,
} from '@explorers-club/schema';
import { InvokeCreator } from 'xstate';

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
    console.log('SEND MESSAGE WITH DATA!', metadata, context);
  },
  broadcastMessage: (
    context: WorkflowContext,
    event: WorkflowCommand,
    metadata: BroadcastMessageMetadata
  ) => {
    console.log('broadcast MESSAGE WITH DATA!', metadata);
  },
} as unknown as Record<TriggerServiceType, TriggerService>;
