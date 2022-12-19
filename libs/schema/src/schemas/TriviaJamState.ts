import { MapSchema, Schema, type } from '@colyseus/schema';
import { ClubPlayer } from './ClubState';

export class TriviaJamPlayer extends ClubPlayer {
  @type('number') score = 0;
}

export class TriviaJamState extends Schema {
  @type('string') hostUserId!: string;
  @type('string') currentQuestionEntryId: string | undefined;

  @type({ map: TriviaJamPlayer }) public players: MapSchema<TriviaJamPlayer> =
    new MapSchema<TriviaJamPlayer>();
}
