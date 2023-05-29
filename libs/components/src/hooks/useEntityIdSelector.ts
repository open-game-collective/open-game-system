import { SnowflakeId, Entity } from "@explorers-club/schema";
import { useCreateEntityStore } from "./useCreateEntityStore";
import { useEntityStoreSelector } from "./useEntityStoreSelector";

export const useEntityIdSelector = <TResult>(
  id: SnowflakeId,
  selector: (entity: Entity) => TResult
) => {
  const entityStore = useCreateEntityStore((query) => query.id === id, [id]);
  return useEntityStoreSelector(entityStore, selector) as TResult | undefined;
};