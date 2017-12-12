import { Group } from '../../common/model';
import { CacheGroupAction, AppCacheActionType } from './';

export const cacheGroupActionCreator = (group: Group): CacheGroupAction => {
  return {
    type: AppCacheActionType.CACHE_GROUP,
    payload: group
  };
};
