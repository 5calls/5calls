import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { cacheGroupActionCreator, addGroupToCache } from './actionCreator';
import {
  CacheableGroup, hasGroupCacheTimeoutExceeded,
  findCacheableGroup, cacheableGroupFactory } from './cache';
import * as api from '../../services/apiServices';
import { Group } from '../../common/model';

export const cacheGroup = (groupId: string) => {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState): Promise<void> => {
      const state = getState();
      const appCache = state.appCache;
      let cacheable: CacheableGroup | undefined = findCacheableGroup(groupId, appCache);
      // Call API to get group data if group is not found
      // in cache or cache timeout has exceeded.
      if ( !cacheable ||
        hasGroupCacheTimeoutExceeded({ timestamp: cacheable.timestamp })) {
        return api.getGroup(groupId)
          .then(group => {
            console.log('Group looked up', group);
            const cacheableGroup = cacheableGroupFactory(group);
            dispatch(cacheGroupActionCreator(cacheableGroup));
            // TODO: dispatch an action???
            // dispatch(foobar(group))
          });

      } else {
        // cacheable group is already in cache

        // get group from cache
        // const cgroup: CacheableGroup | undefined = findCacheableGroup(groupId, appCache);
        // const group = cgroup ? cgroup.group : {} as Group;
        // TODO: dispatch an action???
        // dispatch(foobar(group))
        return Promise.resolve();
      }

      // TODO - should data be refreshed after a call
      //    is made since it increments the group's call total.
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
