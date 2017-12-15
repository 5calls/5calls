import { Dispatch } from 'react-redux';
import { ApplicationState } from '../root';
import { cacheGroupActionCreator } from './actionCreator';
import { CacheableGroup, hasGroupCacheTimeoutExceeded, findCacheableGroup, cacheableGroupFactory } from './cache';
import { getGroup } from '../../services/apiServices';

export function cacheGroup(groupId: string) {
  return (
    dispatch: Dispatch<ApplicationState>,
    getState: () => ApplicationState) => {
      const state = getState();
      const appCache = state.appCache;
      let cacheable: CacheableGroup | undefined = findCacheableGroup(groupId, appCache);
      // Call API to get group data if group is not found
      // in cache or cache timeout has exceeded.
      if ( cacheable && cacheable.group &&
        (!cacheable.group[groupId]
        || hasGroupCacheTimeoutExceeded({ timestamp: cacheable.timestamp }))) {
        getGroup(groupId)
          .then(group => {
            const cacheableGroup = cacheableGroupFactory(group);
            cacheGroupActionCreator(cacheableGroup);
          });

      }
      // TODO - should data be refreshed after a call
      //    is made since it increments the group's call total.
    };
}