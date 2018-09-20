import * as React from 'react';
import { Store } from 'react-redux';
import { CallState } from '../redux/callState';
import { RemoteDataState } from '../redux/remoteData';
import { GroupState } from '../redux/group';
import { LocationState } from '../redux/location';
import { UserState } from '../redux/userState';
import { UserStatsState } from '../redux/userStats';
import { AppCache } from '../redux/cache';
import {
  remoteStateContext,
  callStateContext,
  locationStateContext,
  groupStateContext,
  userStateContext,
  userStatsContext,
  appCacheContext,
} from '../contexts';
import { ApplicationState } from '../redux/root';

interface Props {
  store: Store<ApplicationState>;
}

interface State {
  remoteState: RemoteDataState;
  callState: CallState;
  locationState: LocationState;
  groupState: GroupState;
  userState: UserState;
  userStats: UserStatsState;
  appCache: AppCache;
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
        groupState: store.groupState,
        userState: store.userState,
        userStats: store.userStatsState,
        appCache: store.appCache,
      });
    });

  }

  render() {
    if (this.state) {
    return (
        <remoteStateContext.Provider value={this.state.remoteState}>
          <callStateContext.Provider value={this.state.callState}>
            <locationStateContext.Provider value={this.state.locationState}>
              <groupStateContext.Provider value={this.state.groupState}>
                <userStateContext.Provider value={this.state.userState}>
                  <userStatsContext.Provider value={this.state.userStats}>
                    <appCacheContext.Provider value={this.state.appCache}>
                      {this.props.children}
                    </appCacheContext.Provider>
                  </userStatsContext.Provider>
                </userStateContext.Provider>
              </groupStateContext.Provider>
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
