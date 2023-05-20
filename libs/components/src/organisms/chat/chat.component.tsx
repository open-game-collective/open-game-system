import { useStore } from "@nanostores/react";
import { worldStore } from '../../state/world';
import { With } from "miniplex";
import { ConnectionEntity } from "@explorers-club/schema";
import { useState } from "react";
import { useEntities } from "@miniplex/react";

type ChatServiceEntity = With<ConnectionEntity, 'chatService'>;

export const Chat = () => {
  const world = useStore(worldStore);
  const [archetype] = useState(
    world.with<ConnectionEntity>('chatService')
  );
  const bucket = useEntities(archetype);

  const entity = bucket.entities.length && bucket.entities[0];
  if (!entity) {
    return <div>Loading</div>;
  }

  return <div>Chat - </div>;
};
