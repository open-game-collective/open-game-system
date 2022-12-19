import { TriviaJamRoomComponent } from './trivia-jam-room.component';
import { Room } from 'colyseus.js';
import { TriviaJamState } from '@explorers-club/schema-types/TriviaJamState';
import { FC, useMemo } from 'react';
import { TriviaJamRoomContext } from './trivia-jam-room.context';
import { useInterpret } from '@xstate/react';
import { triviaJamRoomMachine } from './trivia-jam-room.machine';

interface Props {
  room: Room<TriviaJamState>;
  myUserId: string;
}

export const TriviaJamRoom: FC<Props> = ({ room, myUserId }) => {
  const machine = useMemo(
    () => triviaJamRoomMachine.withContext({ room }),
    [room]
  );
  const service = useInterpret(machine);

  return (
    <TriviaJamRoomContext.Provider value={{ service, myUserId }}>
      <TriviaJamRoomComponent />
    </TriviaJamRoomContext.Provider>
  );
};
