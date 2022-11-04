import { AnyEventObject, AnyState } from 'xstate';
import { ActorManager } from './actor-manager';

export type ActorID = string;

export enum ActorType {
  PARTY_ACTOR = "PARTY_ACTOR",
  PLAYER_ACTOR = "PLAYER_ACTOR",
  TREEHOUSE_TRIVIA_ACTOR = "TREEHOUSE_TRIVIA_ACTOR",
  TREEHOUSE_TRIVIA_PLAYER_ACTOR = "TREEHOUSE_TRIVIA_PLAYER_ACTOR"
}

export const getActorId = (actorType: ActorType, uniqueId: string) => {
  switch (actorType) {
    case ActorType.PARTY_ACTOR:
      return `Party-${uniqueId}`
    case ActorType.PLAYER_ACTOR:
      return `PartyPlayer-${uniqueId}`
    case ActorType.TREEHOUSE_TRIVIA_ACTOR:
      return `TreehouseTrivia-${uniqueId}`
    case ActorType.TREEHOUSE_TRIVIA_PLAYER_ACTOR:
      return `TreehouseTriviaPlayer-${uniqueId}`
    default:
      throw new Error(`Non-existent actor type in switch: ${actorType}`);
  }
}

export enum ActorEventType {
  SEND = 'ACTOR_SEND',
  SPAWN = 'ACTOR_SPAWN',
  SYNC_ALL = 'ACTORS_SYNC_ALL',
}

export interface SharedActorRef {
  actorId: ActorID;
  actorType: ActorType;
}

export interface SharedActorEvent {
  actorId: ActorID;
  event: AnyEventObject;
}

export type SharedActor = SharedActorRef & {
  state: AnyState;
};

export type SerializedSharedActor = SharedActorRef & {
  stateJSON: string;
};

/**
 * Props that are passed when a "shared" machine is instantiated.
 */
export interface SharedMachineProps {
  actorId: ActorID;
  actorManager: ActorManager;
}
