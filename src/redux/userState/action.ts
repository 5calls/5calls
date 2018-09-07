import { Action } from 'redux';

import { UserProfile } from './index';

export enum UserStateActionType {
  SET_AUTH_TOKEN = 'SET_AUTH_TOKEN',
  SET_USER_PROFILE = 'SET_USER_PROFILE',
  CLEAR_USER_PROFILE = 'CLEAR_USER_PROFILE',
}

export interface UserStateAction extends Action {
  type: UserStateActionType;
  payload?: {};
}

export interface SetAuthToken extends UserStateAction {
  type: UserStateActionType.SET_AUTH_TOKEN;
  payload: string | undefined;
}

export interface SetUserProfile extends UserStateAction {
  type: UserStateActionType.SET_USER_PROFILE;
  payload: UserProfile | undefined;
}

export interface ClearUserProfile extends UserStateAction {
  type: UserStateActionType.CLEAR_USER_PROFILE;
}

export const setAuthTokenActionCreator = (idToken?: string): SetAuthToken => {
  return {
    type: UserStateActionType.SET_AUTH_TOKEN,
    payload: idToken
  };
};

export const setProfileActionCreator = (profile?: UserProfile): SetUserProfile => {
  return {
    type: UserStateActionType.SET_USER_PROFILE,
    payload: profile
  };
};

export const clearProfileActionCreator = (): ClearUserProfile => {
  return {
    type: UserStateActionType.CLEAR_USER_PROFILE
  };
};