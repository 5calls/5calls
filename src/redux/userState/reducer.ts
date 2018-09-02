import { Reducer } from 'redux';

import { UserStateAction, UserStateActionType } from './index';
import { UserCallDetails } from '../remoteData/asyncActionCreator';

export class UserAuth {
  accessToken: string;
  idToken: string;
  jwtToken: string;
  expiration: Date;
}

export interface UserState {
  idToken?: string;
  profile?: UserProfile;
  userExtras?: UserExtras;
}

export interface UserExtras {
  needsEmail: boolean;
}

export interface UserProfile {
  name: string;
  sub: string; // sub is the user id, either a unique userid or twitter|<twitterid>, etc
  exp: number;
  picture: string; // a url for the users' photo
  callDetails?: UserCallDetails;
}

const initialState: UserState = {
  idToken: undefined,
  profile: undefined,
  userExtras: undefined,
};

export const userStateReducer: Reducer<UserState> = (
  state: UserState = initialState as UserState, action: UserStateAction): UserState => {
  switch (action.type) {
    case UserStateActionType.SET_AUTH_TOKEN: {
      const idToken = action.payload as string | undefined;

      const newState: UserState = { ...state, idToken: idToken };
      return newState;      
    }
    case UserStateActionType.SET_USER_PROFILE: {
      const profile = action.payload as UserProfile | undefined;

      const newState: UserState = { ...state, profile: profile };
      return newState;
    }
    case UserStateActionType.SET_NEEDS_EMAIL: {
      const needsEmail = action.payload as boolean;

      const newState: UserState = { ...state, userExtras: { needsEmail } };
      return newState;
    }
    case UserStateActionType.CLEAR_USER_PROFILE: {
      // called on log out, so clear both
      const newState: UserState = { ...state, profile: undefined, idToken: undefined };
      return newState;
    }
    default: {
      return state;
    }
  }
};
