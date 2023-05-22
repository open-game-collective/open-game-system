import { InitializedConnectionEntity } from "@explorers-club/schema";
import { createContext } from "react";

export const InitializedConnectionEntityContext = createContext(
  {} as InitializedConnectionEntity
);