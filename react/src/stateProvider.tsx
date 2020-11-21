import React from "react";

import { LocationState, LocationContext, WithLocationProps } from "./locationState";

interface Props {}
interface State {
  locationState?: LocationState;
}

// maybe this is a quirk of our former redux-persist usage,
// each key is not an object, but another json string to parse
interface StoredData {
  locationState?: string;
}

export default class StateProvider extends React.Component<Props, State> {
  state: State = {
    locationState: undefined,
  };

  componentDidMount() {
    try {
      const data = JSON.parse(localStorage.getItem("persist:fivecalls") ?? "") as StoredData;
      this.setState({ locationState: JSON.parse(data.locationState ?? "") as LocationState });
    } catch (error) {
      console.log("could not parse localstorage:", error);
    }
  }

  render(): JSX.Element {
    return (
      <LocationContext.Provider
        value={{
          locationState: this.state.locationState,
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
    {({ locationState }) => <Component {...(props as P)} locationState={locationState} />}
  </LocationContext.Consumer>
);
