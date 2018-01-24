import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as moxios from 'moxios';
import { Group, CacheableGroup } from './../../common/model';
import {
  AppCache, cacheGroup, AppCacheActionType } from './';
import { ApplicationState } from './../root';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

beforeEach(() => {
  moxios.install();
});

afterEach(() => {
  moxios.uninstall();
});

// TODO: Needs work - no actions are dispatched
test('fetchGroup() action creator functions correctly', ( ) => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  const groupId = 'craig';
  const group: Group = getMockGroup(groupId);
  moxios.stubRequest(/`group\/${groupId}`/, { response: { group } });
  const expectedType = AppCacheActionType.CACHE_GROUP;
  const initialState = {} as ApplicationState;
  // create a group to initialize in the app cache
  const group1: Group = getMockGroup('nick');
  const cgroup1: CacheableGroup = {group: group1, timestamp: new Date().getTime()};
  const appCache = new AppCache([cgroup1]);
  initialState.appCache = appCache;
  const store = mockStore(initialState);
  // console.log('Store actions', store.getActions());
  store.dispatch(cacheGroup(groupId))
    .then(() => {
      const actions = store.getActions();
      // console.log('Actions', actions);
      expect(actions[0].type).toEqual(expectedType);
      expect(actions[0].payload.group).toEqual(group);
      // console.log('App Cache', initialState.appCache);
    })
    .catch((error) => {
      // tslint:disable-next-line:no-console
      console.log('Test Failure: ', error);
      throw new Error(error.message);
    });
});

const getMockGroup = (groupId): Group => {
  const mockResponse: Group = {
    id: groupId,
    name: `${groupId} group`,
    description: `${groupId} description`,
    photoURL: `http://${groupId}.com`,
    subtitle: `${groupId} subtitle`,
    totalCalls: 99,
    customCalls: false
  };
  return mockResponse;
};

// test('fetchCallCount() action creator dispatches proper action', () => {
//   const count = 999999;
//   const expectedType = RemoteDataActionType.GET_CALL_TOTAL;
//   moxios.stubRequest(/counts/, { response: { count} });
//   const initialState = {} as ApplicationState;
//   const store = mockStore(initialState);
//   store.dispatch(fetchCallCount())
//     .then(() => {
//       const actions = store.getActions();
//       expect(actions[0].type).toEqual(expectedType);
//       expect(actions[0].payload).toEqual(count);
//     });
// });
