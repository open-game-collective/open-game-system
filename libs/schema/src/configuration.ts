import { z } from 'zod';
import {
  BananaTradersGameIdLiteral,
  CodebreakersGameIdLiteral,
  LittleVigilanteGameIdLiteral,
  StrikersGameIdLiteral,
} from './literals';

export const GameConfigurationSchema = z.any();

// const GameConfigurationSchema = z.discriminatedUnion('gameId', [
//   z.object({
//     gameId: LittleVigilanteGameIdLiteral,
//     data: LittleVigilanteGameConfigDataSchema,
//   }),
//   z.object({
//     gameId: CodebreakersGameIdLiteral,
//     data: CodebreakersGameConfigDataSchema,
//   }),
//   z.object({
//     gameId: BananaTradersGameIdLiteral,
//     data: BananTradersGameConfigDataSchema,
//   }),
//   z.object({
//     gameId: StrikersGameIdLiteral,
//     data: StrikersGameConfigDataSchema,
//   }),
// ]);
