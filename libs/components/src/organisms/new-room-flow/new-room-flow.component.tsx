import { Heading } from '../../atoms/Heading';
import { useStore } from '@nanostores/react';
import { entitiesByIdStore, worldStore } from '../../state/world';
import { useSelector } from '@xstate/react';
import { FC, useState, useSyncExternalStore } from 'react';
import {
  ConnectionEntity,
  Entity,
  NewRoomState,
  SnowflakeId,
} from '@explorers-club/schema';
import { With } from 'miniplex';
import { useEntities } from 'miniplex/react';
import { Selector } from 'reselect';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import { isDeepStrictEqual } from 'util';

type NewRoomServiceEntity = With<ConnectionEntity, 'newRoomService'>;

export const NewRoomFlow = () => {
  const world = useStore(worldStore);
  // const [query] = useState(world.archetype<NewRoomState>("newRoomState"));
  const [archetype] = useState(
    world.with<NewRoomServiceEntity>('newRoomService')
  );
  const bucket = useEntities(archetype);

  const entity = bucket.entities.length && bucket.entities[0];
  if (!entity) {
    return <div>Loading</div>;
  }

  return <NewRoomFlowComponent entityId={entity.id} />;

  // console.log(entity.newRoomState.value);
};

const useEntitySelector = <T extends Entity, R = ReturnType<(arg: T) => any>>(
  id: SnowflakeId,
  selector: (state: T) => R
): R => {
  const entitiesById = useStore(entitiesByIdStore);
  const entity = entitiesById.get(id) as T | undefined;
  if (!entity) {
    throw new Error('entity missing: ' + entity);
  }
  let value = selector(entity) as R;
  const getSnapshot = () => {
    return value;
  };

  const subscribe = (onStoreChange: () => void) => {
    const unsub = entity.subscribe((event) => {
      const nextValue = selector(entity) as R;
      if (value !== nextValue) {
        value = nextValue;
        onStoreChange();
      }
    });

    return () => {
      unsub();
    };
  };

  return useSyncExternalStore(subscribe, getSnapshot) as R;
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
  return <Heading>Enter Name</Heading>;
};

const SelectGame = () => {
  return <Heading>Select Game</Heading>;
};

const ConfirmDetails = () => {
  return <Heading>Confirm Details</Heading>;
};
