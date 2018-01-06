import { Action } from 'redux';
import { Group } from '../../common/model';

export enum GroupActionType {
  LOADING_STATUS_ACTION = 'LOADING_STATUS_ACTION',
  CURRENT_GROUP_ACTION = 'CURRENT_GROUP_ACTION'
}

export enum GroupLoadingActionStatus {
  LOADING = 'LOADING',
  FOUND = 'FOUND',
  NOTFOUND = 'NOTFOUND',
  ERROR = 'ERROR',
}

export interface GroupAction extends Action {
  type: GroupActionType;
  payload?: {};
}

export interface GroupLoadingStatusAction extends GroupAction {
  type: GroupActionType.LOADING_STATUS_ACTION;
  payload: GroupLoadingActionStatus;
}

export interface CurrentGroupAction extends GroupAction {
  type: GroupActionType.CURRENT_GROUP_ACTION;
  payload: Group;
}