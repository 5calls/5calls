import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { Group } from '../../common/model';
import { cacheGroup } from '../cache/asyncActionCreator';
import { GroupLoadingActionStatus } from './action';

export const updateGroup = (group: Group) => {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState
    ) => {
    const state = getState();
    if (state.groupState.groupLoadingStatus === GroupLoadingActionStatus.LOADING) {
      dispatch(cacheGroup(group.id));
    }
  };
};
