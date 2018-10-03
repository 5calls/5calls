import * as React from 'react';
import { Store } from 'react-redux';
import { CallState } from '../redux/callState';
import { RemoteDataState } from '../redux/remoteData';
import { LocationState } from '../redux/location';
import { UserState } from '../redux/userState';
import { UserStatsState } from '../redux/userStats';
import {
  remoteStateContext,
  callStateContext,
  locationStateContext,
  userStateContext,
  userStatsContext,
} from '../contexts';
import { ApplicationState } from '../redux/root';

interface Props {
  store: Store<ApplicationState>;
}

interface State {
  remoteState: RemoteDataState;
  callState: CallState;
  locationState: LocationState;
  userState: UserState;
  userStats: UserStatsState;
}

export default class AppProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.props.store.subscribe(() => {
      let store = this.props.store.getState();

      this.setState({
        remoteState: store.remoteDataState,
        callState: store.callState,
        locationState: store.locationState,
        userState: store.userState,
        userStats: store.userStatsState,
      });
    });

  }

  render() {
    if (this.state) {
    return (
        <remoteStateContext.Provider value={this.state.remoteState}>
          <callStateContext.Provider value={this.state.callState}>
            <locationStateContext.Provider value={this.state.locationState}>
              <userStateContext.Provider value={this.state.userState}>
                <userStatsContext.Provider value={this.state.userStats}>
                  {this.props.children}
                </userStatsContext.Provider>
              </userStateContext.Provider>
            </locationStateContext.Provider>
          </callStateContext.Provider>
        </remoteStateContext.Provider>
      );
    } else {
      return (
        <></>
      );
    }
  }
}
