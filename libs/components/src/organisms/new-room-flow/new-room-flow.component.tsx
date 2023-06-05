import type {
  ConnectionEntity,
  Entity,
  GameId,
  SnowflakeId,
} from '@explorers-club/schema';
import { useEntities } from '@miniplex/react';
import { useStore } from '@nanostores/react';
import { With } from 'miniplex';
import {
  FC,
  FormEventHandler,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button } from '../../atoms/Button';
import { Flex } from '../../atoms/Flex';
import { Heading } from '../../atoms/Heading';
import { Label } from '../../atoms/Label';
import { Text } from '../../atoms/Text';
import { TextField } from '../../atoms/TextField';
import { InitializedConnectionEntityContext } from '../../context/Entity';
import { ListRadioCard, RadioCardGroup } from '../../molecules/RadioCard';
import { useEntitySelector } from '../../hooks/useEntitySelector';

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

// export const newRoomServiceEntityStore =
//   createEntityStore<NewRoomServiceEntity>(
//     (entity) => entity.schema === 'connection' && !!entity.newRoomService
//   );

const NewRoomFlowComponent: FC<{ entityId: SnowflakeId }> = ({ entityId }) => {
  const entity = useContext(InitializedConnectionEntityContext);
  const currentState = useEntitySelector(entity, (entity) => {
    return entity.newRoomService?.value;
  });

  return (
    <>
      {currentState === 'SelectGame' && <SelectGame />}
      {currentState === 'Configure' && <Configure />}
      {currentState === 'EnterName' && <EnterName />}
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

      connectionEntity.send({
        type: 'SUBMIT_NAME',
        name: nameRef.current?.value,
      });
    },
    [nameRef, connectionEntity]
  );

  const handlePressLogin = useCallback(() => {
    connectionEntity.send({
      type: 'NAVIGATE',
      route: { name: 'Login' },
    });
  }, [connectionEntity]);

  return (
    <Flex direction="column" gap="2" css={{ p: '$3' }}>
      <Heading>Enter your name</Heading>
      <form onSubmit={handleSubmitName}>
        <Label htmlFor="name">Name</Label>
        <TextField name="name" type="text" ref={nameRef} />
        <Button size="3" fullWidth>
          Submit
        </Button>
      </form>
      <Text>
        Already have an account?{' '}
        <Button onClick={handlePressLogin}>Login</Button>
      </Text>
    </Flex>
  );
};

const SelectGame = () => {
  const selectionRef = useRef<GameId>();
  const connectionEntity = useContext(InitializedConnectionEntityContext);

  const handleChange = useCallback(
    (value: string) => {
      if (selectionRef.current) {
        return;
      }

      const gameId = value as GameId;

      selectionRef.current = gameId;

      connectionEntity.send({
        type: 'SELECT_GAME',
        gameId,
      });
    },
    [connectionEntity]
  );

  return (
    <Flex direction="column" css={{ p: '$3' }} gap="2">
      <Heading>Select Game</Heading>
      <RadioCardGroup onValueChange={handleChange}>
        <Flex direction="column" gap="3">
          <ListRadioCard
            value={'little_vigilante'}
            css={{ p: '$2', width: '100%' }}
          >
            <Text css={{ fontWeight: 'bold' }} size="5">
              Little Vigilante
            </Text>
          </ListRadioCard>
          <ListRadioCard
            value={'banana_traders'}
            css={{ p: '$2', width: '100%' }}
          >
            <Text css={{ fontWeight: 'bold' }} size="5">
              Traders
            </Text>
          </ListRadioCard>
          <ListRadioCard
            value={'codebreakers'}
            css={{ p: '$2', width: '100%' }}
          >
            <Text css={{ fontWeight: 'bold' }} size="5">
              Codebreakers
            </Text>
          </ListRadioCard>
        </Flex>
      </RadioCardGroup>
    </Flex>
  );
};

const Configure = () => {
  const connectionEntity = useContext(InitializedConnectionEntityContext);

  const handleSubmit: FormEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      event.currentTarget.setAttribute('disabled', 'true');
      connectionEntity.send({
        type: 'CONFIGURE_GAME',
        configuration: {
          gameId: 'banana_traders',
          data: {
            numPlayers: 4,
          },
        },
      });
    },
    [connectionEntity]
  );

  return (
    <Flex direction="column" css={{ p: '$3' }} gap="2">
      <Heading>Game Settings</Heading>
      <form onSubmit={handleSubmit}>
        <Button type="submit">Continue</Button>
      </form>
    </Flex>
  );
};
