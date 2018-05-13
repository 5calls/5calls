import { Action } from 'redux';
import { UserStatsAction, UserStatsState, UserContactEvent } from './index';

export enum UserStatsActionType {
  SET_USER_STATS = 'SET_USER_STATS',
  ADD_CALL_EVENT = 'ADD_CALL_EVENT',
  SET_UPLOADED = 'SET_UPLOADED',
}

export interface UserStatsAction extends Action {
  type: UserStatsActionType;
  payload?: {};
}

export interface SetUserStatsAction extends UserStatsAction {
  type: UserStatsActionType.SET_USER_STATS;
  payload: UserStatsState;
}

export interface AddCallEventAction extends UserStatsAction {
  type: UserStatsActionType.ADD_CALL_EVENT;
  payload: UserContactEvent;
}

export interface SetUploadedAction extends UserStatsAction {
  type: UserStatsActionType.SET_UPLOADED;
  payload: number;
}
