import React from "react";

export const LocationContext = React.createContext<WithLocationProps>({
  locationState: undefined,
  setLocationAddress: () => {},
});

export type WithLocationProps = {
  locationState?: LocationState;
  setLocationAddress(address: string, lowAccuracy: boolean, display: string): void;
};

export interface LocationState {
  address: string;
  lowAccuracy: boolean;
  cachedCity: string;
}

export enum LocationFetchType {
  CACHED_ADDRESS = "CACHED_ADDRESS",
  BROWSER_GEOLOCATION = "BROWSER_GEOLOCATION",
  IP_INFO = "IP_INFO",
}
