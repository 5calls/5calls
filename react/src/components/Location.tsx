import React from "react";

import { LocationState, WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";

enum ComponentState {
  NoLocation,
  Location,
  Getting,
}

interface Props {}

class Location extends React.Component<Props & WithLocationProps> {
  // const locationState = ComponentState.NoLocation;

  classForComponent = (component: string, locationState: LocationState | undefined): string => {
    switch (component) {
      case "noLocation": {
        if (!locationState) {
          return "is-visible";
        }
        break;
      }
      case "hasLocation": {
        if (locationState?.address) {
          return "is-visible";
        }
        break;
      }
    }

    return "";
  };

  render() {
    console.log("location, state is now", this.props.locationState);

    return (
      <>
        <div className={this.classForComponent("hasLocation", this.props.locationState)}>
          <span>Showing representatives for</span>
          <strong>{this.props.locationState?.cachedCity || this.props.locationState?.address}</strong>
          <button className="button-link">Change location</button>
        </div>

        <div className={this.classForComponent("locationInput", this.props.locationState)}>
          <span className="i-bar-loading">
            <i className="fa fa-map-marker"></i> <b>Getting your location automatically&hellip;</b>
          </span>
          <button className="button-link"> Or enter an address manually</button>
        </div>

        <div className={this.classForComponent("noLocation", this.props.locationState)}>
          <span>Enter an address or ZIP code</span>
          <form>
            <input type="text" placeholder="20500" />
            <button className="button button-small button-red">Go</button>
          </form>
        </div>
      </>
    );
  }
}

export default withLocation(Location);
