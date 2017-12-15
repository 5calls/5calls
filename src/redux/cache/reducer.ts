import { Reducer } from 'redux';
import {
  CacheableGroup, AppCache,
  AppCacheAction, AppCacheActionType,
  addOrReplaceCacheableGroup } from './';

export const appCacheReducer: Reducer<AppCache> = (
  state: AppCache = {groups: []} as AppCache,
  action: AppCacheAction): AppCache => {

    switch (action.type) {
      case AppCacheActionType.CACHE_GROUP:
        const groups = state.groups;
        const cgroup = action.payload as CacheableGroup;
        const group = cgroup.group;
        const newGroups = addOrReplaceCacheableGroup(groups, group);

        return { ...state, groups: newGroups };
      default:
        return state;
    }
};
