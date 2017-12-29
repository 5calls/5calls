import { Group, CacheableGroup } from './../../common/model';
import { Action } from 'redux';

export enum AppCacheActionType {
  CACHE_GROUP = 'CACHE_GROUP',
  ADD_GROUP_TO_CACHE = 'ADD_GROUP_TO_CACHE'
}

export interface AppCacheAction extends Action {
  type: AppCacheActionType;
  payload?: {};
}

export interface CacheGroupAction extends AppCacheAction {
  type: AppCacheActionType.CACHE_GROUP;
  payload: CacheableGroup;
}

export interface AddToCacheAction extends AppCacheAction {
  type: AppCacheActionType.ADD_GROUP_TO_CACHE;
  payload: Group;
}
