import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { setLoadingStatusAction, setCurrentGroupAction } from './actionCreator';
import { GroupLoadingActionStatus } from './action';
import { Group } from '../../common/model';

export const updateLoadingStatus = (loadingStatus: GroupLoadingActionStatus) => {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState
  ) => {
    console.log('updateLoadingStatus() called with param: ', loadingStatus);
    dispatch(setLoadingStatusAction(loadingStatus));
  };
};

export const updateCurrentGroup = (group: Group) => {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState
  ) => {
    console.log('updateCurrentGroup() called with param :', group);
    dispatch(setCurrentGroupAction(group));
  };
};
