import { AnyEventObject } from 'xstate';
import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import { Operation } from 'fast-json-patch';

export const EntityBaseSchema = <
  TEntityProps extends z.ZodRawShape,
  TCommand extends AnyEventObject,
  TStates extends z.ZodRawShape
  // TEvent extends AnyEventObject
>(
  entityPropsSchema: z.ZodObject<TEntityProps>,
  commandSchema: z.ZodSchema<TCommand>,
  stateSchema: z.ZodObject<TStates>
  // eventSchema: z.ZodSchema<TEvent>
) =>
  entityPropsSchema.merge(
    z.object({
      id: SnowflakeIdSchema,
      send: SendFunctionSchema(commandSchema),
      states: stateSchema,
      // command: commandSchema,
      // channel: z.custom<Observable<typeof eventSchema>>(),
      subscribe: z
        .function()
        .args(CallbackFunctionSchema(commandSchema))
        .returns(z.function().returns(z.void())), // The subscribe function returns an unsubscribe function
    })
  );

const SendFunctionSchema = <TCommand extends AnyEventObject>(
  commandSchema: z.ZodSchema<TCommand>
) => z.function().args(commandSchema).returns(z.void());

const CallbackFunctionSchema = <TCommand extends AnyEventObject>(
  commandSchema: z.ZodSchema<TCommand>
) => z.function().args(EntityEventSchema(commandSchema)).returns(z.void());

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
