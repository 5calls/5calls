import { Action } from 'redux';
import { AppCacheAction } from './action';
import { Group } from '../../common/model';
// import { AppCache } from './';

export enum AppCacheActionType {
  CACHE_GROUP = 'CACHE_GROUP'
}

export interface AppCacheAction extends Action {
  type: AppCacheActionType;
  payload?: {};
}

export interface CacheGroupAction extends AppCacheAction {
  type: AppCacheActionType.CACHE_GROUP;
  payload: Group;
}
