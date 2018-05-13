const configureStore = require('redux-mock-store');
import { setLocation, clearAddress, LocationActionType } from './index';

const middlewares = [];
const mockStore = configureStore(middlewares);

test('Location action creator setLocation dispatched correctly', () => {
  const address = '04260';
  const setLocationAction = setLocation(address);
  const initialState = {};
  const store = mockStore(initialState);

  store.dispatch(setLocationAction);
  // Test if your store dispatched the expected actions
  const actions = store.getActions();
  const expectedPayload = { type: LocationActionType.LOCATION_SET, payload: address };
  expect(actions).toEqual([expectedPayload]);
});

test('Location action creator clearLocation dispatched correctly', () => {
  const clearLocationAction = clearAddress();
  const initialState = {};
  const store = mockStore(initialState);

  store.dispatch(clearLocationAction);
  // Test if your store dispatched the expected actions
  const actions = store.getActions();
  const expectedPayload = { type: LocationActionType.LOCATION_CLEAR };
  expect(actions).toEqual([expectedPayload]);
});
