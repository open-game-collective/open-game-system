import { ConnectionEntity, SnowflakeId } from '@explorers-club/schema';
import { useStore } from '@nanostores/react';
import { With } from 'miniplex';
import { useEntities } from '@miniplex/react';
import {
  FC,
  FormEventHandler,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Heading } from '../../atoms/Heading';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { worldStore } from '../../state/world';
import { Flex } from '../../atoms/Flex';
import { Button } from '../../atoms/Button';
import { Label } from '../../atoms/Label';
import { Text } from '../../atoms/Text';
import { TextField } from '../../atoms/TextField';
import { InitializedConnectionEntityContext } from '../../context/Entity';

type NewRoomServiceEntity = With<ConnectionEntity, 'newRoomService'>;

export const NewRoomFlow = () => {
  const world = useStore(worldStore);
  const [archetype] = useState(
    world.with<NewRoomServiceEntity>('newRoomService')
  );
  const bucket = useEntities(archetype);

  // logic assumes newRoomService exists on only one entity in the world
  // (our connection entity)
  const entity = bucket.entities.length && bucket.entities[0];
  if (!entity) {
    return <div>Loading</div>;
  }

  return <NewRoomFlowComponent entityId={entity.id} />;
};

const NewRoomFlowComponent: FC<{ entityId: SnowflakeId }> = ({ entityId }) => {
  const stateValue = useEntitySelector<NewRoomServiceEntity>(
    entityId,
    (state) => state.newRoomService.value
  );

  return (
    <>
      {stateValue === 'EnterName' && <EnterName />}
      {stateValue === 'SelectingGame' && <SelectGame />}
      {stateValue === 'ConfirmDetails' && <ConfirmDetails />}
    </>
  );
};

const EnterName = () => {
  const connectionEntity = useContext(InitializedConnectionEntityContext);
  const nameRef = useRef<HTMLInputElement>(null);
  const handleSubmitName: FormEventHandler = useCallback(
    (event) => {
      event.preventDefault();

      const value = nameRef.current?.value;
      if (!value || value === '') {
        return;
      }

      // connectionEntity.send({
      //   type: 'SUBMIT_NAME',
      //   name: nameRef.current?.value,
      // });
    },
    [nameRef, connectionEntity]
  );

  const handlePressLogin = useCallback(() => {
    console.log('login');
  }, [connectionEntity]);

  return (
    <Flex>
      <Heading>Enter your name</Heading>
      <Text>
        Already have an account?{' '}
        <Button onClick={handlePressLogin}>Login</Button>
      </Text>
      <form onSubmit={handleSubmitName}>
        <Label htmlFor="name">Name</Label>
        <TextField name="name" type="text" ref={nameRef} />
        <Button size="3" fullWidth>
          Submit
        </Button>
      </form>
    </Flex>
  );
};

const SelectGame = () => {
  return <Heading>Select Game</Heading>;
};

const ConfirmDetails = () => {
  return <Heading>Confirm Details</Heading>;
};
