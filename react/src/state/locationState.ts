import React from "react";
import { GeolocationPosition } from "../common/models/geolocation";

export const LocationContext = React.createContext<WithLocationProps>({
  locationState: undefined,
  setLocation: () => {},
  setLocationAddress: () => {},
});

export type WithLocationProps = {
  locationState?: LocationState;
  setLocation(loc: GeolocationPosition): void;
  setLocationAddress(address: string, display: string): void;
};

export interface LocationState {
  address: string;
  cachedCity: string;
  // splitDistrict: boolean;
  // invalidAddress: boolean;
  // locationFetchType: LocationFetchType | undefined;
}

export enum LocationFetchType {
  CACHED_ADDRESS = "CACHED_ADDRESS",
  BROWSER_GEOLOCATION = "BROWSER_GEOLOCATION",
  IP_INFO = "IP_INFO",
}
