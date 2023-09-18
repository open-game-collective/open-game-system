import { StrikersGameConfigDataSchema } from '@schema/game-configuration/strikers';
import { Operation } from 'fast-json-patch';
import { defineHex, HexCoordinates, Orientation } from 'honeycomb-grid';
import { z } from 'zod';
import { SnowflakeIdSchema } from '../common';
import { EntityBaseSchema } from '../entity/base';
import {
  LogEventTypeLiteral,
  MessageEventTypeLiteral,
  StrikersEffectSchemaTypeLiteral,
  StrikersGameIdLiteral,
  StrikersGameSchemaTypeLiteral,
  StrikersPlayerSchemaTypeLiteral,
  StrikersTurnSchemaTypeLiteral,
  UpdateMessageEventTypeLiteral,
} from '../literals';
import { EventBaseSchema } from '@schema/events/base';
import {
  MultipleChoiceBlockSchema,
  PlainMessageBlockSchema,
  StartGameBlockSchema,
} from '@schema/lib/room';
import {
  ConfirmCommandSchema,
  MultipleChoiceSelectCommandSchema,
} from '@schema/commands';
import { Observable } from 'rxjs';
import { StrikersGameEvent } from '..';

// Define literals for each formation name
const Formation442Literal = z.literal('4-4-2');
const Formation433Literal = z.literal('4-3-3');
const Formation352Literal = z.literal('3-5-2');
const Formation4231Literal = z.literal('4-2-3-1');
const Formation343Literal = z.literal('3-4-3');
const Formation4141Literal = z.literal('4-1-4-1');
const Formation4511Literal = z.literal('4-5-1');
const Formation532Literal = z.literal('5-3-2');
const Formation541Literal = z.literal('5-4-1');
const Formation4321Literal = z.literal('4-3-2-1');

const StrikersShootActionLiteral = z.literal('SHOOT');
const StrikersMoveActionLiteral = z.literal('MOVE');
const StrikersPassActionLiteral = z.literal('PASS');

export const StrikersTileCoordinateSchema = z.custom<string>((val: any) => {
  // Use a regex to test the validity of the string format
  // This regex matches a single letter (A-Z) followed by a number (1-20)
  return /^[A-Z](?:[1-9]|1[0-9]|2[0-9]|3[0-6])$/.test(val as string);
}, 'Invalid StrikersTileCoordinate format. It should be A-Z for columns and 1-20 for rows. Example: A1, C10, Z20.');
export type StrikersTileCoordinate = z.infer<
  typeof StrikersTileCoordinateSchema
>;

export const StrikersActionSchema = z.union([
  StrikersShootActionLiteral,
  StrikersMoveActionLiteral,
  StrikersPassActionLiteral,
]);
export type StrikersAction = z.infer<typeof StrikersActionSchema>;

// Combine them into a union
export const FormationLiteral = z.union([
  Formation442Literal,
  Formation433Literal,
  Formation352Literal,
  Formation4231Literal,
  Formation343Literal,
  Formation4141Literal,
  Formation4511Literal,
  Formation532Literal,
  Formation541Literal,
  Formation4321Literal,
]);
export type Formation = z.infer<typeof FormationLiteral>;

const PositionSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  position: z.string(),
});

// Define FormationData schema
const FormationDataSchema = z.object({
  name: FormationLiteral,
  positions: z.array(PositionSchema),
});

// Define schema for all formations
const AllFormationsSchema = z.array(FormationDataSchema);

export const LineupContextSchema = z.object({
  messageIdsByPlayerId: z.record(SnowflakeIdSchema),
  formationsByPlayerId: z.record(FormationLiteral),
  finishedPlayerIds: z.array(SnowflakeIdSchema),
});

export type LineupContext = z.infer<typeof LineupContextSchema>;

export const LineupCommandSchema = z.union([
  ConfirmCommandSchema,
  MultipleChoiceSelectCommandSchema,
]);
export type LineupCommand = z.infer<typeof LineupCommandSchema>;

export const LineupStateValueSchema = z.enum([
  'SelectGame',
  'EnterName',
  'Configure',
  'Complete',
]);

const CardIdSchema = z.string();

/**
 * Indiciates which side of the field the team starts on
 * i.e. a team starts on side A and shoots towards the goal on side B.
 *
 * From a players perspective, A is on the left, B is on the right
 */
export const StrikersFieldSideSchema = z.enum(['A', 'B']);
export const StrikersTeamSideSchema = z.enum(['home', 'away']);

export const TilePositionSchema = z.custom<HexCoordinates>();

const StaminaSchema = z.number();

const TurnStartedBlockSchema = z.object({
  type: z.literal('TurnStarted'),
  turnId: SnowflakeIdSchema,
  timestamp: z.date(),
});

export const StrikersMessageContentBlockSchema = z.union([
  TurnStartedBlockSchema,
  StartGameBlockSchema,
  MultipleChoiceBlockSchema,
  PlainMessageBlockSchema,
]);

const StrikersSelectActionEventSchema = EventBaseSchema(
  z.literal('SELECT_ACTION'),
  z.object({
    action: StrikersActionSchema,
  })
);

const StrikersSelectMoveTargetEventSchema = EventBaseSchema(
  z.literal('SELECT_MOVE_TARGET'),
  z.object({
    target: StrikersTileCoordinateSchema,
  })
);

const StrikersSelectCardEventSchema = EventBaseSchema(
  z.literal('SELECT_CARD'),
  z.object({
    cardId: CardIdSchema,
  })
);
export type StrikersSelectCardEvent = z.infer<
  typeof StrikersSelectCardEventSchema
>;

export const StrikersGameMessageEventSchema = EventBaseSchema(
  MessageEventTypeLiteral,
  z.object({
    contents: z.array(StrikersMessageContentBlockSchema),
  })
);

export const StrikersGameEventSchema = z.discriminatedUnion('type', [
  StrikersGameMessageEventSchema,
  StrikersSelectActionEventSchema,
  StrikersSelectCardEventSchema,
  StrikersSelectMoveTargetEventSchema,
]);

export const StrikersGameStateSchema = z.object({
  ballPosition: TilePositionSchema.optional(),
  possession: StrikersFieldSideSchema.optional(),
  tilePositionsByCardId: z.record(CardIdSchema, TilePositionSchema),
  sideACardIds: z.array(CardIdSchema),
  sideBCardIds: z.array(CardIdSchema),
  staminaByCardId: z.record(CardIdSchema, StaminaSchema),
});

const StrikersChannelSchema =
  z.custom<Observable<z.infer<typeof StrikersGameEventSchema>>>();

const StrikersGameEntityPropSchema = z.object({
  schema: StrikersGameSchemaTypeLiteral,
  gameId: StrikersGameIdLiteral,
  config: StrikersGameConfigDataSchema,
  gameState: StrikersGameStateSchema,
  channel: StrikersChannelSchema,
  turnsIds: z.array(SnowflakeIdSchema),
  lineupService: z
    .object({
      context: LineupContextSchema,
      value: LineupStateValueSchema,
    })
    .optional(),
});

const PlayPeriodStateEnum = z.enum(['NormalTime', 'StoppageTime', 'Complete']);

const FirstHalfSchema = z.object({
  FirstHalf: PlayPeriodStateEnum,
});
const HalfTimeSchema = z.object({
  Halftime: z.object({}),
});
const SecondHalfSchema = z.object({
  SecondHalf: PlayPeriodStateEnum,
});

export const StrikersGameStateValueSchema = z.object({
  RunStatus: z.enum(['Paused', 'Running', 'Resuming', 'Error']),
  PlayStatus: z.union([
    z.literal('Lineup'),
    z.object({
      Regulation: z.union([FirstHalfSchema, HalfTimeSchema, SecondHalfSchema]),
    }),
    z.literal('ExtraTime'),
  ]),
});

const StartCommandSchema = z.object({
  type: z.literal('START'),
});

const LeaveCommandSchema = z.object({
  type: z.literal('LEAVE'),
});

export const StrikersGameCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
  ConfirmCommandSchema,
  MultipleChoiceSelectCommandSchema,
]);

// export const ConnectionCommandSchema = z.union([
//   BaseConnectionCommandSchema,
//   NewRoomCommandSchema,
//   // todo other commands here, workflows, etc
// ]);

export const StrikersGameEntitySchema = EntityBaseSchema(
  StrikersGameEntityPropSchema,
  StrikersGameCommandSchema,
  StrikersGameStateValueSchema
);

export const StrikersGameContextSchema = z.object({
  foo: z.string(),
});

// Actions
// Short pass - a pass traveling to a player within 1-2 spaces of the current player. Cannot travel through defenders. Success threshold 5.
// Long pass - a pass traveling to a player within 3-4 spaces of the current player. Cannot travel through defenders. Success threshold: 10.
// Lob pass - a pass traveling over a defender to a player 2-4 spaces away. Success threshold: 10.
// Through pass - a pass travelling along a line to a space. Success threshold is 3x the number of spaces it must travel. (allowing spaces to theoretically move 6 spaces).
// Marking - if a player is within one space of another player, they can "mark" that player for 5 turns, following thei rmovements but not using endurance tokens.
// Header - on a corner kick, the player that receives the ball can try a header. Threshold: 16.
// Corner kick - when a corner kick is triggered, teams are allowed to 1 by 1 place their players near the goal. One player is selected to kick. A roll is determined to see if it goes in the center hex as planned. 13-20 puts you in that spot, otherwise 1-12 each puts you in a different hex around that middle hex
const D20RollSchema = z.number().min(1).max(20);

const ModifierSchema = z.discriminatedUnion('modifierType', [
  z.object({
    modifierType: z.literal('POSSESSION_TACKLE_BONUS'),
    appliedTo: CardIdSchema,
    value: z.number(),
  }),
]);

const StrikersTackleAttemptSchema = z.object({
  type: z.literal('TACKLE_ATTEMPT'),
  initiatingCardId: CardIdSchema,
  defensiveCardId: CardIdSchema,
  offensiveCardId: CardIdSchema,
  modifiers: z.array(ModifierSchema),
  roll: D20RollSchema,
  success: z.boolean(),
});

const StrikersGainPossessionSchema = z.object({
  type: z.literal('GAIN_POSESSION'),
  cardId: CardIdSchema,
});

// const StrikersEffectsSchema = z.discriminatedUnion('type', [
//   StrikersTackleAttemptSchema,
//   StrikersGainPossessionSchema,
// ]);

// const MoveActionResultSchema = z.object({
//   actionType: z.literal('MOVE'),
//   cardId: CardIdSchema,
//   target: TilePositionSchema,
//   gamePatches: z.array(z.custom<Operation>()), // stores changes to the board state
// });

// const ShootActionResultSchema = z.object({
//   actionType: z.literal('SHOOT'),
//   playerId: SnowflakeIdSchema,
//   cardId: CardIdSchema,
//   gamePatches: z.array(z.custom<Operation>()), // stores changes to the board state
// });

// const InterceptAttemptSchema = z.object({
//   type: z.literal('INTERCEPT_ATTEMPT'),
//   initiatingCardId: CardIdSchema,
//   defensiveCardId: CardIdSchema,
//   offensiveCardId: CardIdSchema,
//   modifiers: z.array(ModifierSchema),
//   roll: D20RollSchema,
//   success: z.boolean(),
// });

// const StrikersPassTriggerSchema = InterceptAttemptSchema;

// const PassActionResultSchema = z.object({
//   actionType: z.literal('PASS'),
//   playerId: SnowflakeIdSchema,
//   cardId: CardIdSchema,
//   triggers: z.array(StrikersPassTriggerSchema),
//   gamePatches: z.array(z.custom<Operation>()), // stores changes to the board state
// });

// const ActionResultSchema = z.discriminatedUnion('actionType', [
//   MoveActionResultSchema,
//   ShootActionResultSchema,
//   PassActionResultSchema,
// ]);

const EffectIdSchema = z.string().uuid();

const ActionEffectLiteral = z.literal('ACTION');
const TriggeredEffectLiteral = z.literal('TRIGGERED');
const CardEffectLiteral = z.literal('CARD');

const EffectSchemaBase = z.object({
  id: EffectIdSchema,
  patches: z.array(z.custom<Operation>()),
  state: z.enum(['in_progress', 'resolved']),
  category: z.union([
    ActionEffectLiteral,
    TriggeredEffectLiteral,
    CardEffectLiteral,
  ]),
  parentId: EffectIdSchema.optional(),
  children: z.array(EffectIdSchema),
});

const ActionEffectTypeLiteral = z.literal('ACTION');
const RollEffectTypeLiteral = z.literal('ROLL');
// const PossessionEffectTypeLiteral = z.literal("POSSESSION");

export const StrikersMoveActionEffectDataSchema = z.object({
  type: z.literal('MOVE'),
  cardId: CardIdSchema,
  fromPosition: TilePositionSchema,
  toPosition: TilePositionSchema,
});
// const MoveActionEffectSchema =
//   StrikersMoveActionEffectDataSchema.merge(EffectSchemaBase);
export const StrikersPassActionEffectDataSchema = z.object({
  type: z.literal('PASS'),
  fromCardId: CardIdSchema,
  fromPosition: TilePositionSchema,
  toPosition: TilePositionSchema,
  toCardId: CardIdSchema.optional(),
});

export const StrikersShootActionEffectDataSchema = z.object({
  type: z.literal('SHOOT'),
  fromCardId: CardIdSchema,
  fromPosition: TilePositionSchema,
});

const InterceptAttemptEffectDataSchema = z.object({
  type: z.literal('INTERCEPT_ATTEMPT'),
  category: TriggeredEffectLiteral,
  initiatingCardId: CardIdSchema,
  defensiveCardId: CardIdSchema,
  offensiveCardId: CardIdSchema,
  modifiers: z.array(ModifierSchema),
  roll: D20RollSchema,
  success: z.boolean(),
});
// const InterceptAttemptEffectSchema =
//   InterceptAttemptEffectDataSchema.merge(EffectSchemaBase);

const TackleAttemptEffectDataSchema = z.object({
  type: z.literal('TACKLE_ATTEMPT'),
  category: TriggeredEffectLiteral,
  attackingCardId: CardIdSchema,
  possessingCardId: CardIdSchema,
  modifiers: z.array(ModifierSchema),
  roll: D20RollSchema,
  success: z.boolean(),
});
// const TackleAttemptEffectSchema =
//   TackleAttemptEffectDataSchema.merge(EffectSchemaBase);

// const GainPossessionEffectSchema = EffectSchemaBase.extend({
//   type: PossessionEffectTypeLiteral,
//   rollType: z.literal('TACKLE_ATTEMPT'),
//   attackingCardId: CardIdSchema,
//   possessingCardId: CardIdSchema,
//   modifiers: z.array(ModifierSchema),
//   roll: D20RollSchema,
//   success: z.boolean(),
// });

/**
 * A turn contains a list of "effects".
 * Effects are anything that happen in the game that
 * can mutate the game state.
 * 
 * Each effect captures it's own list of patch operations
 * that its has on the game state, with time stamps. This
 * will enable game replay and rewinding of game state.
 * 
 * The types of actions are:
 * 
 * 1. ACTION     (move/pass/shoot)
 * 2. ROLL       (tackle attempt, interception attempt, save attempt, etc.)
 * 3. CARD       (play a manager card)
//  * 4. POSSESSION (move on to ball space) maybe?
 */
// export const StrikersTurnEffectSchema = z.discriminatedUnion('type', [
//   MoveActionEffectSchema,
//   InterceptAttemptEffectSchema,
//   TackleAttemptEffectSchema,
// ]);

export const StrikersEffectDataSchema = z.discriminatedUnion('type', [
  StrikersMoveActionEffectDataSchema,
  StrikersPassActionEffectDataSchema,
  StrikersShootActionEffectDataSchema,
  InterceptAttemptEffectDataSchema,
  TackleAttemptEffectDataSchema,
]);

const StrikersTurnEntityPropsSchema = z.object({
  schema: StrikersTurnSchemaTypeLiteral,
  stagedGameState: StrikersGameStateSchema,
  startedAt: z.date(),
  gameEntityId: SnowflakeIdSchema,
  side: StrikersFieldSideSchema,
  playerId: SnowflakeIdSchema,
  totalActionCount: z.number(),
  modifiers: z.array(ModifierSchema),
  effectsIds: z.array(SnowflakeIdSchema),
});

const StrikersEffectEntityPropsSchema = z.object({
  schema: StrikersEffectSchemaTypeLiteral,
  patches: z.array(z.custom<Operation>()),
  category: z.union([
    ActionEffectLiteral,
    TriggeredEffectLiteral,
    CardEffectLiteral,
  ]),
  parentId: EffectIdSchema.optional(),
  children: z.array(EffectIdSchema),
  data: StrikersEffectDataSchema,
});

export const StrikersTurnStateValueSchema = z.object({
  Status: z.union([
    z.object({
      Actions: z.union([
        z.literal('SendingSelectActionMessage'),
        z.object({
          InputtingAction: z.union([
            z.literal('Unselected'),
            z.object({
              Moving: z.union([
                z.literal('SendingSelectPlayerMessage'),
                z.object({
                  InputtingPlayer: z.union([
                    z.literal('Unselected'),
                    z.object({
                      PlayerSelected: z.union([
                        z.literal('SendingTargetSelectMessage'),
                        z.literal('InputtingTarget'),
                        z.literal('Ready'),
                        z.literal('Complete'),
                      ]),
                    }),
                    z.literal('Complete'),
                  ]),
                }),
                z.literal('Complete'),
              ]),
              Passing: z.union([
                z.literal('SendingTargetSelectMessage'),
                z.literal('InputtingTarget'),
                z.literal('Ready'),
                z.literal('Complete'),
              ]),
              Shooting: z.union([z.literal('Ready'), z.literal('Complete')]),
            }),
            z.literal('Complete'),
          ]),
        }),
        z.literal('Complete'),
      ]),
    }),
    z.literal('Complete'),
  ]),
});

const StrikersMoveActionCommandSchema = z.object({
  type: z.literal('MOVE'),
  cardId: z.string().uuid(),
  target: TilePositionSchema,
});

const StrikersPassActionCommandSchema = z.object({
  type: z.literal('PASS'),
  target: TilePositionSchema,
});

const StrikersShootActionCommandSchema = z.object({
  type: z.literal('SHOOT'),
  target: TilePositionSchema,
});

const StrikersRollCommandSchema = z.object({
  type: z.literal('ROLL'),
});

export const StrikersTurnCommandSchema = z.discriminatedUnion('type', [
  // StrikersMoveActionCommandSchema,
  // StrikersPassActionCommandSchema,
  // StrikersShootActionCommandSchema,
  ConfirmCommandSchema,
  MultipleChoiceSelectCommandSchema,
  // StrikersRollCommandSchema,
]);

export const StrikersTurnEntitySchema = EntityBaseSchema(
  StrikersTurnEntityPropsSchema,
  StrikersTurnCommandSchema,
  StrikersTurnStateValueSchema
);

export const StrikersEffectCommandSchema = z.discriminatedUnion('type', [
  StrikersRollCommandSchema,
]);

export const StrikersEffectStateValueSchema = z.object({
  Status: z.enum(['InProgress', 'WaitingForInput', 'Resolved']),
});

export const StrikersEffectEntitySchema = EntityBaseSchema(
  StrikersEffectEntityPropsSchema,
  StrikersEffectCommandSchema,
  StrikersEffectStateValueSchema
);

export const StrikersEffectContextSchema = z.object({
  foo: z.string(),
});

export const StrikersTurnContextSchema = z.object({
  actionMessageIds: z.array(z.string()),
  selectedCardId: CardIdSchema.optional(),
  selectedTarget: StrikersTileCoordinateSchema.optional(),
});

const StrikersPlayerEntityPropSchema = z.object({
  schema: StrikersPlayerSchemaTypeLiteral,
  gameEntityId: SnowflakeIdSchema,
  userId: SnowflakeIdSchema,
  // channel: z.custom<Observable<MessageEvent>>(),
});

export const StrikersPlayerStateValueSchema = z.object({
  Active: z.enum(['True', 'False']),
});

export const StrikersPlayerCommandSchema = z.union([
  StartCommandSchema,
  LeaveCommandSchema,
]);

export const StrikersPlayerEntitySchema = EntityBaseSchema(
  StrikersPlayerEntityPropSchema,
  StrikersPlayerCommandSchema,
  StrikersPlayerStateValueSchema
);

export const StrikersPlayerContextSchema = z.object({
  foo: z.string(),
});
