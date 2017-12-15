import { CacheGroupAction, AppCacheActionType, CacheableGroup } from './';

export const cacheGroupActionCreator = (cgroup: CacheableGroup): CacheGroupAction => {
  return {
    type: AppCacheActionType.CACHE_GROUP,
    payload: cgroup
  };
};
