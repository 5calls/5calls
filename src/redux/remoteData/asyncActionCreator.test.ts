import thunk from 'redux-thunk';
const configureStore = require('redux-mock-store');
import * as moxios from 'moxios';
import { RemoteDataActionType } from './action';
import { fetchCallCount, fetchAllIssues, fetchLocationByIP } from './index';
import { ApplicationState } from './../root';
import { ApiData, DefaultIssue, IpInfoData, LocationFetchType, LocationUiState } from './../../common/model';
import * as Constants from '../../common/constants';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

beforeEach(() => {
  moxios.install();
});

afterEach(() => {
  moxios.uninstall();
});

test('getApiData() action creator functions correctly', () => {
  const address = 'New Gloucester, ME';
  const issueName = 'Issue';
  const apiData: ApiData = getApiDataResponse(address, issueName);
  moxios.stubRequest(`${Constants.ISSUES_API_URL}${encodeURIComponent(address)}`,
                     { response: apiData });

  const initialState = {} as ApplicationState;
  const locationState = {
    address: '',
    cachedCity: '',
    splitDistrict: false,
    uiState: LocationUiState.FETCHING_LOCATION,
    locationFetchType: LocationFetchType.CACHED_ADDRESS
  };
  initialState.locationState = locationState;
  const store = mockStore(initialState);
  store.dispatch(fetchAllIssues(address))
    .then(() => {
      const actions = store.getActions();
      // console.log('Actions', actions);
      expect(actions[1].payload).toEqual(address);
      expect(actions[4].payload[0].name).toEqual(issueName);
    });
});

const getApiDataResponse = (address, issueName): ApiData => {
  const mockIssue = Object.assign({}, DefaultIssue, {name: issueName});

  const mockResponse: ApiData = {
    splitDistrict: false,
    invalidAddress: false,
    normalizedLocation: address,
    divisions: [],
    issues: [mockIssue]
  };
  return mockResponse;
};

// FIME: This throws:
//   TypeError: index_1.fetchLocationByIP is not a function
test.skip('fetchLocationByIP() action creator works correctly', () => {
  const data: IpInfoData = {
    city: 'New City',
    country: 'USA',
    hostname: 'foobar.com',
    org: '5 Calls',
    postal: '04260',
    loc: '-43.00, -70.00',
    ip: '127.0.0.1',
    region: 'New England'
  };
  moxios.stubRequest(/json/, { response: data });
  const initialState = {} as ApplicationState;
  // initialState.locationState = {address: ''};
  const store = mockStore(initialState);
  store.dispatch(fetchLocationByIP())
    .then(() => {
      // const actions = store.getActions();
      // console.log('fetchLocationByIP() Actions', actions);
    });
});

test('fetchCallCount() action creator dispatches proper action', () => {
  const count = 999999;
  const expectedType = RemoteDataActionType.GET_CALL_TOTAL;
  moxios.stubRequest(/counts/, { response: { count} });
  const initialState = {} as ApplicationState;
  const store = mockStore(initialState);
  store.dispatch(fetchCallCount())
    .then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toEqual(expectedType);
      expect(actions[0].payload).toEqual(count);
    });
});
