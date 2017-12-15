import { Action } from 'redux';
import { CacheableGroup } from './';

export enum AppCacheActionType {
  CACHE_GROUP = 'CACHE_GROUP'
}

export interface AppCacheAction extends Action {
  type: AppCacheActionType;
  payload?: {};
}

export interface CacheGroupAction extends AppCacheAction {
  type: AppCacheActionType.CACHE_GROUP;
  payload: CacheableGroup;
}
