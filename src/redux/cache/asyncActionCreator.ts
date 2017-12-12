import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { Group } from '../../common/model';

export function cacheGroup(group: Group) {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState) => {
      const state = getState();
      const appCache = state.appCache;
      // TODO
    };
}