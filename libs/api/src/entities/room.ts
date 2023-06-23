import {
  Entity,
  MessageData,
  RoomCommand,
  RoomContext,
  RoomEntity,
  RoomMessageData,
} from '@explorers-club/schema';
import { createMachine } from 'xstate';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { channel } from 'diagnostics_channel';

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
  const roomChannel = channel as ReplaySubject<RoomMessageData>;

  return createMachine({
    id: 'RoomMachine',
    type: 'parallel',
    schema: {
      context: {} as RoomContext,
      events: {} as RoomCommand,
    },
    on: {
      CONNECT: {
        actions: (_, event) => {
          if (
            !roomEntity.connectedEntityIds.includes(event.connectionEntityId)
          ) {
            roomEntity.connectedEntityIds = [
              ...roomEntity.connectedEntityIds,
              event.connectionEntityId,
            ];
            console.log('connect', event.connectionEntityId);

            roomChannel.next({
              type: 'PLAIN',
              content: `${event.connectionEntityId} has connected.`,
              sender: roomEntity.id,
            });

            // Get the welcome config
            // If the user hasn't been here before, run the welcome sequence

            // roomEntity.channel.next({
            //   type: 'PLAIN',
            //   content: `${event.connectionEntityId} has connected.`,
            // });
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
