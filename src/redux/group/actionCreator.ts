import {
  GroupLoadingStatusAction, GroupActionType,
  GroupLoadingActionStatus, CurrentGroupAction
  } from './index';
import { Group } from '../../common/model';

export function setLoadingStatusAction(loadingStatus: GroupLoadingActionStatus): GroupLoadingStatusAction {
  return {
    type: GroupActionType.LOADING_STATUS_ACTION,
    payload: loadingStatus
  };
}

export function setDefaultGroupLoadingAction(): GroupLoadingStatusAction {
  return {
    type: GroupActionType.LOADING_STATUS_ACTION,
    payload: GroupLoadingActionStatus.LOADING
  };
}

export function setFoundGroupLoadingAction(): GroupLoadingStatusAction {
  return {
    type: GroupActionType.LOADING_STATUS_ACTION,
    payload: GroupLoadingActionStatus.FOUND
  };
}

export function setNotFoundGroupLoadingAction(): GroupLoadingStatusAction {
  return {
    type: GroupActionType.LOADING_STATUS_ACTION,
    payload: GroupLoadingActionStatus.NOTFOUND
  };
}

export function setErrorGroupLoadingAction(): GroupLoadingStatusAction {
  return {
    type: GroupActionType.LOADING_STATUS_ACTION,
    payload: GroupLoadingActionStatus.ERROR
  };
}

export function setCurrentGroupAction(group: Group): CurrentGroupAction {
  return {
    type: GroupActionType.CURRENT_GROUP_ACTION,
    payload: group
  };
}