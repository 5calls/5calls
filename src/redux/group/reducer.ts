import { Reducer } from 'redux';
import { Group } from '../../common/model';
import { GroupLoadingActionStatus, GroupAction, GroupActionType } from './action';

export interface GroupState {
  currentGroup: Group | undefined;
  groupLoadingStatus: GroupLoadingActionStatus;
}

export const DefaultGroupState: GroupState = {
  currentGroup: undefined,
  groupLoadingStatus: GroupLoadingActionStatus.LOADING
};

export const groupStateReducer: Reducer<GroupState> = (
  state: GroupState = DefaultGroupState,
  action: GroupAction
): GroupState => {
  switch (action.type) {
    case GroupActionType.LOADING_STATUS_ACTION:
      let groupLoadingStatus = action.payload as GroupLoadingActionStatus;
      return { ...state,  groupLoadingStatus };
    case GroupActionType.CURRENT_GROUP_ACTION:
      let group = action.payload as Group;
      return { currentGroup: group, groupLoadingStatus: GroupLoadingActionStatus.FOUND };
    default:
      return state;
  }
};
