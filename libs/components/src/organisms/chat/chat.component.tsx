import { useContext } from 'react';
import { ChatContext } from './chat.context';

export const Chat = () => {
  const { roomEntity, connectionEntity } = useContext(ChatContext);
  console.log({ roomEntity, connectionEntity });
  // const world = useStore(worldStore);
  // const [archetype] = useState(
  //   world.with<ConnectionEntity>('chatService')
  // );
  // const bucket = useEntities(archetype);

  // const entity = bucket.entities.length && bucket.entities[0];
  // if (!entity) {
  //   return <div>Loading</div>;
  // }

  return <div>Chat - </div>;
};
