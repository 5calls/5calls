import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { cacheGroupActionCreator, addGroupToCache } from './actionCreator';
import {
  hasGroupCacheTimeoutExceeded,
  findCacheableGroup, cacheableGroupFactory } from './cache';
import * as api from '../../services/apiServices';
import { Group, CacheableGroup } from '../../common/model';
import {
  setDefaultGroupLoadingAction,
  setFoundGroupLoadingAction,
  setNotFoundGroupLoadingAction,
  setErrorGroupLoadingAction,
  setCurrentGroupAction
} from '../../redux/group';

export const cacheGroup = (groupId: string) => {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState
  ): Promise<void> => {
      const state = getState();
      const appCache = state.appCache;
      let cacheable: CacheableGroup | undefined = findCacheableGroup(groupId, appCache);
      // Call API to get group data if group is not found
      // in cache or cache timeout has exceeded.
      if ( !cacheable ||
        hasGroupCacheTimeoutExceeded({ timestamp: cacheable.timestamp })) {
        dispatch(setDefaultGroupLoadingAction());
        return api.getGroup(groupId)
          .then(group => {
            // set group to current group
            dispatch(setCurrentGroupAction(group));
            const cacheableGroup = cacheableGroupFactory(group);
            // dispatch a found event
            dispatch(setFoundGroupLoadingAction());
            if (cacheableGroup) {
              // cache group
              dispatch(cacheGroupActionCreator(cacheableGroup));
            }
            return Promise.resolve();
          })
          .catch((error: Error) => {
            if (error.message.includes('404')) {
              // dispatch a 'not found' event
              dispatch(setNotFoundGroupLoadingAction());
            } else {
              // tslint:disable-next-line:no-console
              console.error(`Problem fetching group with id ${groupId}: ${error.message}`, error);
              // dispatch an error event
              dispatch(setErrorGroupLoadingAction());
            }
          });
      } else {
        // cacheable group is already in cache
        // set it to the current group
        dispatch(setCurrentGroupAction(cacheable.group));
        return Promise.resolve();
      }

    };
};

export const addToCache = (group: Group) => {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState): Promise<void> => {
      dispatch(addGroupToCache(group));
      return Promise.resolve();
    };
};
