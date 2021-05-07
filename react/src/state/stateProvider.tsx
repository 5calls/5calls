import React from "react";

import { LocationState, LocationContext, WithLocationProps } from "./locationState";
import Storage from "../utils/storage";
import { CompletedContext, CompletedState, CompletionMap, WithCompletedProps } from "./completedState";

interface Props {}
interface State {
  locationState?: LocationState;
  completedState?: CompletedState;
  savedStateRestored: boolean;
}

export default class StateProvider extends React.Component<Props, State> {
  state: State = {
    locationState: undefined,
    savedStateRestored: false,
  };

  componentDidMount() {
    try {
      this.loadFromStorage();
    } catch (error) {
      console.log("could not parse localstorage, removing:", error);
      localStorage.removeItem("persist:fivecalls");
    }

    // if these events are fired, we should reload from storage
    document.addEventListener("updateReps", () => {
      this.loadFromStorage();
    });
  }

  loadFromStorage() {
    const appState = Storage.getStorageAsObject();
    this.setState({
      locationState: appState.locationState,
      completedState: appState.completedState,
      savedStateRestored: true,
    });
  }

  setLocationAddress(address: string, lowAccuracy: boolean, display: string) {
    // save the location and cached city in localstorage
    // if the backend passes "unknown address" just remove it

    const locationState: LocationState = {
      address: address,
      lowAccuracy: lowAccuracy,
      cachedCity: display,
      // splitDistrict: false,
      // invalidAddress: false,
      // locationFetchType: LocationFetchType.CACHED_ADDRESS,
    };
    Storage.saveLocation(locationState);
    this.setState({ locationState });
  }

  setCompleted(completed: CompletionMap) {
    Storage.saveCompleted({
      completed: completed,
      needsCompletionFetch: false,
    });
  }

  setNeedsCompletionFetch(needsRefresh: boolean) {
    Storage.saveCompleted({
      completed: this.state.completedState?.completed ?? {},
      needsCompletionFetch: needsRefresh,
    });
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
          setLocationAddress: (address: string, lowAccuracy: boolean, display: string) =>
            this.setLocationAddress(address, lowAccuracy, display),
        }}
      >
        <CompletedContext.Provider
          value={{
            completed: this.state.completedState,
            setCompleted: (completed: CompletionMap) => this.setCompleted(completed),
            setNeedsCompletionFetch: (needsRefresh: boolean) => this.setNeedsCompletionFetch(needsRefresh),
          }}
        >
          {this.props.children}
        </CompletedContext.Provider>
      </LocationContext.Provider>
    );
  }
}

export const withLocation = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof WithLocationProps>> => (props) => (
  <LocationContext.Consumer>
    {({ locationState, setLocationAddress }) => (
      <Component {...(props as P)} locationState={locationState} setLocationAddress={setLocationAddress} />
    )}
  </LocationContext.Consumer>
);

export const withCompleted = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof WithCompletedProps>> => (props) => (
  <CompletedContext.Consumer>
    {({ completed, setCompleted, setNeedsCompletionFetch }) => (
      <Component
        {...(props as P)}
        completed={completed}
        setCompleted={setCompleted}
        setNeedsCompletionFetch={setNeedsCompletionFetch}
      />
    )}
  </CompletedContext.Consumer>
);
