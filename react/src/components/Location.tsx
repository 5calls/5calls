import React from "react";

import { LocationState, WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";
import { getBrowserGeolocation } from "../utils/geolocation";

enum ComponentLocationState {
  NoLocation,
  HasLocation,
  GettingAutomatically,
  EnterManually,
}

interface Props {}
interface State {
  componentLocationState: ComponentLocationState;
}

class Location extends React.Component<Props & WithLocationProps, State> {
  state = { componentLocationState: ComponentLocationState.NoLocation };

  componentDidMount() {
    // update the local component state based on our global state
    if (this.props.locationState && this.props.locationState.address) {
      this.setState({ componentLocationState: ComponentLocationState.HasLocation });
    }
  }

  // the states this component can transition between:

  setAutomaticallyOrFail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.setState({ componentLocationState: ComponentLocationState.GettingAutomatically });

    getBrowserGeolocation()
      .then((loc) => {
        // TODO: give stateprovider this loc
        this.props.setLocation(loc);
        this.setState({ componentLocationState: ComponentLocationState.HasLocation });
      })
      .catch((err) => {
        // nbd, go to manual entry
        this.setState({ componentLocationState: ComponentLocationState.EnterManually });
      });
  };

  render() {
    console.log("location, state is now", this.props.locationState);

    switch (this.state.componentLocationState) {
      case ComponentLocationState.NoLocation: {
        return (
          <div className="is-visible">
            <span>Find your representatives</span>
            <form onSubmit={this.setAutomaticallyOrFail}>
              <button className="button button-small button-red">Set your location</button>
            </form>
          </div>
        );
      }
      case ComponentLocationState.GettingAutomatically: {
        return (
          <div className="is-visible">
            <span className="i-bar-loading">
              <i className="fa fa-map-marker"></i> <b>Getting your location automatically&hellip;</b>
            </span>
            <button className="button-link"> Or enter an address manually</button>
          </div>
        );
      }
      case ComponentLocationState.HasLocation: {
        return (
          <div className="is-visible">
            <span>Showing representatives for</span>
            <strong>{this.props.locationState?.cachedCity || this.props.locationState?.address}</strong>
            <button className="button-link">Change location</button>
          </div>
        );
      }
      case ComponentLocationState.EnterManually: {
        return (
          <div className="is-visible">
            <span>Enter an address or ZIP code</span>
            <form>
              <input type="text" placeholder="20500" />
              <button className="button button-small button-red">Go</button>
            </form>
          </div>
        );
      }
    }
  }
}

export default withLocation(Location);
