import {
  ChannelEvent,
  CreateEventProps,
  Entity,
  EntityMachine,
  EntityMachineMap,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { createBananaTradersGameMachine } from './entities/banana-traders-game';
import { createBananaTradersPlayerMachine } from './entities/banana-traders-player';
import { createCodebreakersGameMachine } from './entities/codebreakers-game';
import { createCodebreakersPlayerMachine } from './entities/codebreakers-player';
import { createConnectionMachine } from './entities/connection';
import { createLittleVigilanteGameMachine } from './entities/little-vigilante-game';
import { createLittleVigilantePlayerMachine } from './entities/little-vigilante-player';
import { createMessageChannelMachine } from './entities/messsage-channel';
import { createRoomMachine } from './entities/room';
import { createSessionMachine } from './entities/session';
// import { createTriggerMachine } from './entities/trigger';
import { createTriggerMachine } from './entities/trigger';
import { createUserMachine } from './entities/user';
import { createStrikersGameMachine } from './entities/strikers-game';
import { createStrikersPlayerMachine } from './entities/strikers-player';
import { createStrikersTurnMachine } from './entities/strikers-turn';
// import { createWorkflowMachine } from './entities/workflow';

type EntityMachineCreators = {
  [TSchemaType in keyof EntityMachineMap]: <
    TEntity extends Entity,
    TChannel = TEntity extends { channel: infer C } ? C : never
  >(props: {
    world: World<Entity>;
    entity: TEntity;
    channel: ReplaySubject<CreateEventProps<ChannelEvent>>;
  }) => Extract<EntityMachine, { type: TSchemaType }>['machine'];
};

export const machineMap: EntityMachineCreators = {
  connection: createConnectionMachine,
  session: createSessionMachine,
  room: createRoomMachine,
  user: createUserMachine,
  // workflow: createWorkflowMachine,
  message_channel: createMessageChannelMachine,
  codebreakers_game: createCodebreakersGameMachine,
  codebreakers_player: createCodebreakersPlayerMachine,
  banana_traders_game: createBananaTradersGameMachine,
  banana_traders_player: createBananaTradersPlayerMachine,
  little_vigilante_game: createLittleVigilanteGameMachine,
  little_vigilante_player: createLittleVigilantePlayerMachine,
  strikers_game: createStrikersGameMachine,
  strikers_player: createStrikersPlayerMachine,
  strikers_turn: createStrikersTurnMachine,
  trigger: createTriggerMachine,
};

type EntityMachineTypes = keyof EntityMachineMap;
