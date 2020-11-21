import { createContext } from "react";

export const LocationContext = createContext<WithLocationProps>({
  locationState: undefined,
});

export type WithLocationProps = {
  locationState?: LocationState;
};

export interface LocationState {
  address: string;
  cachedCity: string;
  splitDistrict: boolean;
  invalidAddress: boolean;
  locationFetchType: LocationFetchType | undefined;
}

export enum LocationFetchType {
  CACHED_ADDRESS = "CACHED_ADDRESS",
  BROWSER_GEOLOCATION = "BROWSER_GEOLOCATION",
  IP_INFO = "IP_INFO",
}
