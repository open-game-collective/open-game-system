import {
  CodebreakersGameEntitySchema,
  CodebreakersPlayerEntitySchema,
} from '@schema/games/codebreakers';
import {
  StrikersGameCommandSchema,
  StrikersGameEntitySchema,
  StrikersPlayerEntitySchema,
  StrikersTurnEntitySchema,
} from '@schema/games/strikers';
import {
  BananaTradersGameEntitySchema,
  BananaTradersPlayerEntitySchema,
} from '@schema/games/traders';
import {
  LittleVigilanteGameEntitySchema,
  LittleVigilantePlayerEntitySchema,
} from '@schema/games/vigilantes';
import {
  ConnectionCommandSchema,
  ConnectionEntitySchema,
} from '@schema/lib/connection';
import { MessageChannelEntitySchema } from '@schema/lib/message-channel';
import { RoomCommandSchema, RoomEntitySchema } from '@schema/lib/room';
import { SessionCommandSchema, SessionEntitySchema } from '@schema/lib/session';
import { TriggerEntitySchema } from '@schema/lib/trigger';
import { UserEntitySchema } from '@schema/lib/user';
import { z } from 'zod';

export const EntityCommandSchema = z.union([
  ConnectionCommandSchema,
  SessionCommandSchema,
  RoomCommandSchema,
  // StrikersGameCommandSchema,
]);

export const EntitySchemas = {
  user: UserEntitySchema,
  room: RoomEntitySchema,
  session: SessionEntitySchema,
  connection: ConnectionEntitySchema,
  trigger: TriggerEntitySchema,
  message_channel: MessageChannelEntitySchema,
  banana_traders_game: BananaTradersGameEntitySchema,
  banana_traders_player: BananaTradersPlayerEntitySchema,
  codebreakers_game: CodebreakersGameEntitySchema,
  codebreakers_player: CodebreakersPlayerEntitySchema,
  little_vigilante_game: LittleVigilanteGameEntitySchema,
  little_vigilante_player: LittleVigilantePlayerEntitySchema,
  strikers_game: StrikersGameEntitySchema,
  strikers_player: StrikersPlayerEntitySchema,
  strikers_turn: StrikersTurnEntitySchema,
};

export const EntitySchema = z.discriminatedUnion('schema', [
  ConnectionEntitySchema,
  SessionEntitySchema,
  RoomEntitySchema,
  UserEntitySchema,
  TriggerEntitySchema,
  MessageChannelEntitySchema,
  StrikersGameEntitySchema,
  StrikersPlayerEntitySchema,
  //   BananaTradersGameEntitySchema,
  //   BananaTradersPlayerEntitySchema,
  //   CodebreakersGameEntitySchema,
  //   CodebreakersPlayerEntitySchema,
  //   LittleVigilanteGameEntitySchema,
  //   LittleVigilantePlayerEntitySchema,
]);

export const ChannelEntitySchema = z.discriminatedUnion('schema', [
  RoomEntitySchema,
]);

export const GameEntitySchema = z.discriminatedUnion('schema', [
  StrikersGameEntitySchema,
]);
