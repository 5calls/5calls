import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { cacheGroupActionCreator, addGroupToCache } from './actionCreator';
import {
  hasGroupCacheTimeoutExceeded,
  findCacheableGroup, cacheableGroupFactory } from './cache';
import * as api from '../../services/apiServices';
import { Group, CacheableGroup } from '../../common/model';

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
        return api.getGroup(groupId)
          .then(group => {
            const cacheableGroup = cacheableGroupFactory(group);
            if (cacheableGroup) {
              dispatch(cacheGroupActionCreator(cacheableGroup));
            }
            return Promise.resolve();
          });
      } else {
        // cacheable group is already in cache
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
