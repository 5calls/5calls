import React from "react";

import { WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";
import { getBrowserGeolocation } from "../utils/geolocation";
import { getContacts } from "../utils/api";

enum ComponentLocationState {
  NoLocation,
  BadLocation,
  HasLocation,
  GettingAutomatically,
  EnterManually,
}

interface Props {}
interface State {
  componentLocationState: ComponentLocationState;
  manualAddress: string | undefined;
  locationError: string | undefined;
}

class Location extends React.Component<Props & WithLocationProps, State> {
  _defaultManualAddress: string | undefined = undefined;
  _defaultLocationError: string | undefined = undefined;

  state = {
    componentLocationState: ComponentLocationState.NoLocation,
    manualAddress: this._defaultManualAddress,
    locationError: this._defaultLocationError,
  };

  componentDidMount() {
    // update the local component state based on our global state
    if (this.props.locationState && this.props.locationState.address) {
      this.setState({ componentLocationState: ComponentLocationState.HasLocation });
    }
  }

  updateManualAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ manualAddress: e.target.value });
  };

  changeLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    this.setState({ componentLocationState: ComponentLocationState.EnterManually });
  };

  setLocationManually = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.setState({ locationError: undefined });

    if (!this.state.manualAddress || this.state.manualAddress == "") {
      // TODO: re-try automatic location
      return;
    }

    // fetch reps from the api and see if this is valid before saving
    if (this.state.manualAddress) {
      getContacts(this.state.manualAddress)
        .then((contactList) => {
          // console.log("contacts are", contactList);
          this.props.setLocationAddress(this.state.manualAddress ?? "", contactList.location);
          this.setState({ componentLocationState: ComponentLocationState.HasLocation });
        })
        .catch((error) => {
          console.log("error:", error);
          // we don't specify different types of location errors, but might in the future
          this.setState({ locationError: "location error" });
        });
    }
  };

  setLocationAutomatically = (e: React.FormEvent<HTMLFormElement>) => {
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
    switch (this.state.componentLocationState) {
      case ComponentLocationState.NoLocation: {
        return (
          <div className="is-visible">
            <span>Find your representatives</span>
            <form onSubmit={this.setLocationAutomatically}>
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
            <form onSubmit={this.changeLocation}>
              <button className="button-link"> Or enter an address manually</button>
            </form>
          </div>
        );
      }
      case ComponentLocationState.HasLocation: {
        return (
          <div className="is-visible">
            <span>Showing representatives for</span>
            <strong>{this.props.locationState?.cachedCity || this.props.locationState?.address}</strong>
            <form onSubmit={this.changeLocation}>
              <button className="button-link">Change location</button>
            </form>
          </div>
        );
      }
      case ComponentLocationState.EnterManually: {
        return (
          <div className="is-visible">
            <span>Enter an address or ZIP code</span>
            <form onSubmit={this.setLocationManually}>
              <input
                name="address"
                type="text"
                placeholder="20500 or 1600 Pennsylvania Ave, Washington, DC"
                onChange={this.updateManualAddress}
              />
              <button className="button button-small button-red">Go</button>
            </form>
            {this.state.locationError && (
              <span className="location-error">Couldn't find that location, please try again</span>
            )}
          </div>
        );
      }
      case ComponentLocationState.BadLocation: {
        return (
          <div className="is-visible">
            <span>no reps for that location</span>
          </div>
        );
      }
    }
  }
}

export default withLocation(Location);
