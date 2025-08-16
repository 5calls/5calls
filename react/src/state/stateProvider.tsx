import React from 'react';

import {
  LocationState,
  LocationContext,
  WithLocationProps
} from './locationState';
import Storage from '../utils/storage';
import {
  CompletedContext,
  CompletedIssueMap,
  WithCompletedProps
} from './completedState';
import * as Constants from '../common/constants';

interface Props {
  children: React.ReactNode;
}

interface State {
  locationState?: LocationState;
  completedIssueMap?: CompletedIssueMap;
  savedStateRestored: boolean;
}

export default class StateProvider extends React.Component<Props, State> {
  state: State = {
    locationState: undefined,
    savedStateRestored: false,
    completedIssueMap: {}
  };

  componentDidMount() {
    try {
      this.loadFromStorage();
    } catch (error) {
      console.log('could not parse localstorage, removing:', error);
      localStorage.removeItem('persist:fivecalls');
    }

    // if these events are fired, we should reload from storage
    document.addEventListener(Constants.CUSTOM_EVENTS.UPDATE_REPS, () => {
      this.loadFromStorage();
    });
  }

  loadFromStorage() {
    const appState = Storage.getStorageAsObject();
    const hadLocation = !!this.state.locationState;
    const newLocationState = appState.locationState;

    this.setState({
      locationState: newLocationState,
      completedIssueMap: appState.completedIssueMap,
      savedStateRestored: true
    });

    // Dispatch event if location became available
    if (!hadLocation && newLocationState) {
      const locationLoadedEvent = new CustomEvent(Constants.CUSTOM_EVENTS.LOCATION_LOADED, {
        detail: newLocationState
      });
      document.dispatchEvent(locationLoadedEvent);
    }
  }

  setLocationAddress(address: string, display: string, state: string) {
    // save the location and cached city in localstorage
    // if the backend passes "unknown address" just remove it

    const locationState: LocationState = {
      address: address,
      cachedCity: display,
      state: state
      // splitDistrict: false,
      // invalidAddress: false,
      // locationFetchType: LocationFetchType.CACHED_ADDRESS,
    };
    Storage.saveLocation(locationState);
    this.setState({ locationState });

    // Dispatch event when location is updated
    const locationLoadedEvent = new CustomEvent(Constants.CUSTOM_EVENTS.LOCATION_LOADED, {
      detail: locationState
    });
    document.dispatchEvent(locationLoadedEvent);
  }

  setCompletedIssueMap(updatedCompletedIssueMap: CompletedIssueMap) {
    const newCompletedIssueMap = {
      ...this.state.completedIssueMap,
      ...updatedCompletedIssueMap
    };
    Storage.saveCompleted(newCompletedIssueMap);
    this.setState({
      completedIssueMap: newCompletedIssueMap
    });
  }

  render(): React.ReactNode {
    // simple version of the redux-persist gate where nothing is rendered until the persisted
    // data is loaded for the first time
    if (!this.state.savedStateRestored) {
      return <></>;
    }

    return (
      <LocationContext.Provider
        value={{
          locationState: this.state.locationState,
          setLocationAddress: (
            address: string,
            display: string,
            state: string
          ) => this.setLocationAddress(address, display, state)
        }}
      >
        <CompletedContext.Provider
          value={{
            completedIssueMap: this.state.completedIssueMap || {},
            setCompletedIssueMap: (issueMapUpdates: CompletedIssueMap) =>
              this.setCompletedIssueMap(issueMapUpdates)
          }}
        >
          {this.props.children}
        </CompletedContext.Provider>
      </LocationContext.Provider>
    );
  }
}

export const withLocation =
  <P extends object>(
    Component: React.ComponentType<P>
  ): React.FC<Omit<P, keyof WithLocationProps>> =>
  (props) => (
    <LocationContext.Consumer>
      {({ locationState, setLocationAddress }) => (
        <Component
          {...(props as P)}
          locationState={locationState}
          setLocationAddress={setLocationAddress}
        />
      )}
    </LocationContext.Consumer>
  );

export const withCompleted =
  <P extends object>(
    Component: React.ComponentType<P>
  ): React.FC<Omit<P, keyof WithCompletedProps>> =>
  (props) => (
    <CompletedContext.Consumer>
      {({ completedIssueMap, setCompletedIssueMap }) => (
        <Component
          {...(props as P)}
          completedIssueMap={completedIssueMap}
          setCompletedIssueMap={setCompletedIssueMap}
        />
      )}
    </CompletedContext.Consumer>
  );
