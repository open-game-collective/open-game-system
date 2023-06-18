/// <reference types="@types/googlemaps" />
import { createContext } from 'react';

export const MapContext = createContext({
  map: google.maps.Map,
});
