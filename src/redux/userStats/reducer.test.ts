import { userStatsReducer, UserStatsState, UserStatsActionType, 
  SetUserStatsAction, AddCallEventAction, UserContactEventType } from './index';
import { UserOutcomeResult } from './reducer';

let defaultState;
beforeEach(() => {
  defaultState = {
    all: [],
    voicemail: 0,
    unavailable: 0,
    contact: 0,
    yes: 0,
  };
});

test('UserStats reducer processes SetUserStatsActionCreator action correctly', () => {
  const state: UserStatsState = { ...defaultState };

  // add contact
  state.all.unshift(getUserContactObject(UserContactEventType.UNAVAILABLE));
  state.unavailable = 1;

  const action: SetUserStatsAction = {
    type: UserStatsActionType.SET_USER_STATS,
    payload: state
  };
  const newState = userStatsReducer(state, action);
  expect(newState.unavailable).toEqual(1);
  expect(newState.voicemail).toEqual(0);
  expect(newState.all.length).toEqual(1);
});

test('UserStats reducer processes addCallEventActionCreator action correctly', () => {
  const state: UserStatsState = { ...defaultState };

  // set up
  state.all.unshift(getUserContactObject(UserContactEventType.UNAVAILABLE));
  state.unavailable = 1;

  const action: SetUserStatsAction = {
    type: UserStatsActionType.SET_USER_STATS,
    payload: state
  };
  let newState = userStatsReducer(state, action);

  const callEvent = getUserContactObject(UserContactEventType.VOICEMAIL);

  const callEventAction: AddCallEventAction = {
    type: UserStatsActionType.ADD_CALL_EVENT,
    payload: callEvent
  };

  newState = userStatsReducer(newState, callEventAction);
  expect(newState.unavailable).toEqual(1);
  expect(newState.voicemail).toEqual(1);
  expect(newState.all.length).toEqual(2);
});

const getUserContactObject = (result: UserOutcomeResult) => {
  return {
    result,
    contactid: 'fake-contact-id',
    issueid: 'fake-issue-id',
    time: Date.now(),
    uploaded: false,
  };
};