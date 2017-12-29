import { Reducer } from 'redux';
import {
  AppCache, AppCacheAction, AppCacheActionType,
  addOrReplaceCacheableGroup } from './';
import { Group, CacheableGroup } from '../../common/model';

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
      case AppCacheActionType.ADD_GROUP_TO_CACHE:
        const groups1 = state.groups;
        const group1 = action.payload as Group;
        const newGroups1 = addOrReplaceCacheableGroup(groups1, group1);
        return { ...state, groups: newGroups1 };
      default:
        return state;
    }
};
