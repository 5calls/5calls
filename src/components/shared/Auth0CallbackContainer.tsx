import * as React from 'react';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';
import { Auth0Callback, AuthResponse } from '@5calls/react-components';
import { store } from '../../redux/store';
import { setAuthTokenActionCreator, setProfileActionCreator } from '../../redux/userState';
import { uploadStatsIfNeeded } from '../../redux/remoteData/asyncActionCreator';

interface Props {}

interface State {}

export class Auth0CallbackContainer extends React.Component<Props, State> {

  handleAuthentication = (authResponse: AuthResponse): Promise<AuthResponse> => {
    // console.log('AuthoCallbackContainer.handleAuthentication() token', authResponse.authToken);
    // console.log('AuthoCallbackContainer.handleAuthentication() user profile', authResponse.userProfile);
    store.dispatch(setAuthTokenActionCreator(authResponse.authToken));
    store.dispatch(setProfileActionCreator(authResponse.userProfile));

    // check for unuploaded stats
    queueUntilRehydration(() => {
      store.dispatch(uploadStatsIfNeeded());
    });

    return Promise.resolve(authResponse);
  }

  render() {
    return (
      <Auth0Callback handleAuthentication={this.handleAuthentication} />
    );
  }
}