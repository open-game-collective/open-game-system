import {
  Entity,
  EntityMachine,
  EntityMachineMap,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { Subject } from 'rxjs';
import { createBananaTradersGameMachine } from './entities/banana-traders-game';
import { createBananaTradersPlayerMachine } from './entities/banana-traders-player';
import { createCodebreakersGameMachine } from './entities/codebreakers-game';
import { createCodebreakersPlayerMachine } from './entities/codebreakers-player';
import { createConnectionMachine } from './entities/connection';
import { createLittleVigilanteGameMachine } from './entities/little-vigilante-game';
import { createLittleVigilantePlayerMachine } from './entities/little-vigilante-player';
import { createRoomMachine } from './entities/room';
import { createSessionMachine } from './entities/session';
import { createUserMachine } from './entities/user';
import { createMessageChannelMachine } from './entities/messsage-channel';

type EntityMachineCreators = {
  [TSchemaType in keyof EntityMachineMap]: (props: {
    world: World<Entity>;
    entity: Entity;
  }) => Extract<EntityMachine, { type: TSchemaType }>['machine'];
};

export const machineMap: EntityMachineCreators = {
  connection: createConnectionMachine,
  session: createSessionMachine,
  room: createRoomMachine,
  user: createUserMachine,
  message_channel: createMessageChannelMachine,
  codebreakers_game: createCodebreakersGameMachine,
  codebreakers_player: createCodebreakersPlayerMachine,
  banana_traders_game: createBananaTradersGameMachine,
  banana_traders_player: createBananaTradersPlayerMachine,
  little_vigilante_game: createLittleVigilanteGameMachine,
  little_vigilante_player: createLittleVigilantePlayerMachine,
};

type EntityMachineTypes = keyof EntityMachineMap;
