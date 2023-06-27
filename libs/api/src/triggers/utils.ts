import {
  TemplateVariable,
  WorkflowCommand,
  WorkflowContext,
} from '@explorers-club/schema';
import { getValueFromPath } from '@explorers-club/utils';
import * as assert from 'assert';
import { entitiesById } from '../server/state';

export const getAllTempateVars = (
  context: WorkflowContext,
  workflowEvent: WorkflowCommand,
  variables: TemplateVariable[]
) => {
  const result: Record<TemplateVariable['key'], any> = {};
  for (const idx in variables) {
    const variable = variables[idx];
    const value = getTemplateVarValue(context, workflowEvent, variable);
    result[variable.key] = value;
  }

  return result;
};

export const getTemplateVarValue = (
  context: WorkflowContext,
  workflowEvent: WorkflowCommand,
  variable: TemplateVariable
) => {
  const { input } = context;
  const { entity, event, eventSubject } = context.input;
  if (variable.templateDataType === 'trigger_entity') {
    return getValueFromPath(input.entity, variable.path);
  } else if (variable.templateDataType === 'trigger_event') {
    return getValueFromPath(input.event, variable.path);
  } else if (variable.templateDataType === 'trigger_event_subject') {
    assert(
      'subjectId' in input.event,
      'expected subjectId in trigger_event_subject but none found'
    );
    const subject = entitiesById.get(input.event.subjectId as string);
    assert(
      subject,
      'expected subject but not found for ' + input.event.subjectId
    );
    return getValueFromPath(subject, variable.path);
  } else if (variable.templateDataType === 'trigger_metadata') {
    return getValueFromPath(input.metadata, variable.path);
  } else if (variable.templateDataType === 'workflow_event') {
    return getValueFromPath(workflowEvent, variable.path);
  } else {
    throw 'not implemented';
  }
};
