import { ConnectionEntity, SnowflakeId } from '@explorers-club/schema';
import { useStore } from '@nanostores/react';
import { With } from 'miniplex';
import { useEntities } from 'miniplex/react';
import { FC, useState } from 'react';
import { Heading } from '../../atoms/Heading';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { worldStore } from '../../state/world';

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
