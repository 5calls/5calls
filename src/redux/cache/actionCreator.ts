import { Group, CacheableGroup } from './../../common/model';
import { CacheGroupAction, AppCacheActionType } from './';

export const cacheGroupActionCreator = (cgroup: CacheableGroup): CacheGroupAction => {
  return {
    type: AppCacheActionType.CACHE_GROUP,
    payload: cgroup
  };
};

export const addGroupToCache = (group: Group) => {
  return {
    type: AppCacheActionType.ADD_GROUP_TO_CACHE,
    payload: group
  };
};
