import React from "react";
import { GeolocationPosition } from "../common/models/geolocation";

import { LocationState, LocationContext, WithLocationProps, LocationFetchType } from "./locationState";
import Storage from "../utils/storage";
import { threadId } from "worker_threads";

interface Props {}
interface State {
  locationState?: LocationState;
  savedStateRestored: boolean;
}

export default class StateProvider extends React.Component<Props, State> {
  state: State = {
    locationState: undefined,
    savedStateRestored: false,
  };

  componentDidMount() {
    try {
      const appState = Storage.getStorageAsObject();
      this.setState({ locationState: appState.locationState, savedStateRestored: true });
    } catch (error) {
      console.log("could not parse localstorage:", error);
    }
  }

  setLocation(loc: GeolocationPosition) {
    // set the location
  }

  setLocationAddress(address: string, display: string) {
    // save the location and cached city in localstorage
    // if the backend passes "unknown address" just remove it

    const locationState: LocationState = {
      address: address,
      cachedCity: display,
      // splitDistrict: false,
      // invalidAddress: false,
      // locationFetchType: LocationFetchType.CACHED_ADDRESS,
    };
    Storage.saveLocation(locationState);
    this.setState({ locationState });
  }

  render(): JSX.Element {
    // simple version of the redux-persist gate where nothing is rendered until the persisted
    // data is loaded for the first time
    if (!this.state.savedStateRestored) {
      return <></>;
    }

    return (
      <LocationContext.Provider
        value={{
          locationState: this.state.locationState,
          setLocation: (loc: GeolocationPosition) => this.setLocation(loc),
          setLocationAddress: (address: string, display: string) => this.setLocationAddress(address, display),
        }}
      >
        {this.props.children}
      </LocationContext.Provider>
    );
  }
}

export const withLocation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof WithLocationProps>> => (props) => (
  <LocationContext.Consumer>
    {({ locationState, setLocation, setLocationAddress }) => (
      <Component
        {...(props as P)}
        locationState={locationState}
        setLocation={setLocation}
        setLocationAddress={setLocationAddress}
      />
    )}
  </LocationContext.Consumer>
);
