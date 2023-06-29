import {
  ConnectionEntity,
  CreateEventProps,
  Entity,
  InitializedConnectionEntity,
  JoinEvent,
  RoomCommand,
  RoomContext,
  RoomEntity,
  RoomEvent,
} from '@explorers-club/schema';
import { assert } from '@explorers-club/utils';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { sessionsById } from '../server/indexes';
import { entitiesById } from '../server/state';
import { waitForCondition } from '../world';
// import { generateSnowflakeId } from '../ids';

export const createRoomMachine = ({
  world,
  entity,
  channel,
}: {
  world: World;
  entity: Entity;
  channel: ReplaySubject<any>;
}) => {
  const roomEntity = entity as RoomEntity;
  const roomChannel = channel as ReplaySubject<CreateEventProps<RoomEvent>>;

  return createMachine({
    id: 'RoomMachine',
    type: 'parallel',
    context: {
      workflows: new Map(),
    },
    schema: {
      context: {} as RoomContext,
      events: {} as RoomCommand,
    },
    on: {
      CONNECT: {
        actions: async (_, event) => {
          const connectionEntity = (await waitForCondition<ConnectionEntity>(
            world,
            entitiesById,
            event.connectionEntityId,
            (entity) => entity.states.Initialized === 'True'
          )) as InitializedConnectionEntity;
          const sessionEntity = sessionsById.get(connectionEntity.sessionId);
          assert(
            sessionEntity,
            'expected sessionEntity but not found for sessionId' +
              connectionEntity.sessionId
          );

          if (
            !roomEntity.connectedEntityIds.includes(event.connectionEntityId)
          ) {
            roomEntity.connectedEntityIds = [
              ...roomEntity.connectedEntityIds,
              event.connectionEntityId,
            ];

            const joinEvent = {
              type: 'JOIN',
              subjectId: sessionEntity.id,
            } as CreateEventProps<JoinEvent>;
            roomChannel.next(joinEvent);

            // If this is the first time this user has been in this channel,
            // run the workflow
            // const newMemberWorkflow = createMachine({
            //   id: 'NewMachineWorkflow',
            //   initial: 'FirstMessage',
            //   schema: {
            //     context: {} as ChannelWorkflowContext,
            //     events: {} as { type: 'SUBMIT_NAME'; form: { name: string } },
            //   },
            //   // this is customizable
            //   states: {
            //     FirstMessage: {
            //       always: [
            //         {
            //           target: 'Done',
            //           cond: 'hasNameSet',
            //         },
            //       ],
            //       invoke: {
            //         src: 'sendMessage',
            //         onDone: 'WaitingForResponse',
            //       },
            //     },
            //     WaitingForResponse: {
            //       on: {
            //         SUBMIT_NAME: {
            //           target: 'ThirdMessage',
            //           actions: (context, event) => {
            //             console.log('SUBMIT_NAME', context, event);
            //           },
            //         },
            //       },
            //     },
            //     ThirdMessage: {
            //       invoke: {
            //         src: 'sendMessage',
            //         onDone: 'WaitingForName',
            //       },
            //     },
            //     WaitingForName: {
            //       on: {
            //         // INPUT_NAME: {
            //         //   target: 'Done',
            //         // },
            //       },
            //     },
            //     Done: {
            //       type: 'final',
            //     },
            //   },
            // })
            //   .withContext({
            //     workflowId: generateUUID(),
            //     entityIds: {
            //       session: sessionEntity.id,
            //       room: roomEntity.id,
            //     },
            //   })
            //   .withConfig({
            //     actions: {},
            //     guards: {
            //       hasNameSet: (context, event) => {
            //         return false;
            //       },
            //     },
            //     services: {
            //       sendMessage: async (context, event, invokeMeta) => {
            //         // const channelEntity = channelEntitiesById.get(
            //         //   context.entities.channel
            //         // );
            //         // const user = usersById.get(context.entities.user);
            //         // console.log({
            //         //   channelEntity,
            //         //   user,
            //         //   entities: context.entities,
            //         // });

            //         const entityMap = {
            //           session: sessionsById.get(context.entityIds.session),
            //           room: channelEntitiesById.get(context.entityIds.room),
            //         };
            //         type EntityKey = keyof typeof entityMap;
            //         assert(
            //           entityMap.session,
            //           'expected user entity when sending message'
            //         );
            //         assert(
            //           entityMap.room,
            //           'expected room entity when sending message'
            //         );

            //         const vars = sendMessageParams.variables;
            //         type Key = keyof typeof vars;

            //         const bindings = {} as Record<>;
            //         for (const key in vars) {
            //           const variable = vars[key as Key];
            //           const entity = entityMap[variable.entity as EntityKey];
            //           const value = getValueFromPath(entity, variable.path);
            //         }

            //         return '';
            //       },
            //     },
            //   });

            // const service = interpret(newMemberWorkflow);
            // service.start();
          }
        },
      },
    },
    states: {
      Scene: {
        initial: 'Lobby',
        states: {
          Lobby: {},
          Loading: {},
          Game: {},
        },
      },
      Active: {
        initial: 'No',
        states: {
          No: {},
          Yes: {},
        },
      },
    },
  });
};
