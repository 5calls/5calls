import { Reducer } from 'redux';
import { AppCache, AppCacheAction } from './';

export const appCacheReducer: Reducer<AppCache> = (
  state: AppCache = {} as AppCache,
  action: AppCacheAction): AppCache => {

    switch (action.type) {

      default: return state;
    }
};
