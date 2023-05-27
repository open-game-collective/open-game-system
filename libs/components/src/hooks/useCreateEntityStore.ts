import { Entity } from "@explorers-club/schema";
import { createEntityStore } from "@state/world";
import { atom } from "nanostores";
import { useState, useEffect } from "react";

export const useCreateEntityStore = <TEntity extends Entity>(
    query: (entity: Entity) => boolean,
    deps: React.DependencyList
  ) => {
    const [store, setStore] = useState(atom<TEntity | null>(null));
    useEffect(() => {
      setStore(createEntityStore(query));
    }, deps);
  
    return store;
  };
  