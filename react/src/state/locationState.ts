import React from 'react';

export const LocationContext = React.createContext<WithLocationProps>({
  locationState: undefined,
  setLocationAddress: () => {},
});

export type WithLocationProps = {
  locationState?: LocationState;
  setLocationAddress(address: string, display: string): void;
};

export interface LocationState {
  address: string;
  cachedCity: string;
}

export enum LocationFetchType {
  CACHED_ADDRESS = 'CACHED_ADDRESS',
  BROWSER_GEOLOCATION = 'BROWSER_GEOLOCATION',
  IP_INFO = 'IP_INFO',
}
