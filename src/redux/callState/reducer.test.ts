import { CallState, CurrentIssueAction, NextContact,
  CallStateActionType, callStateReducer,
  CompleteIssueAction, ClearContactIndexesAction } from './';

let defaultState: CallState;
beforeEach(() => {
  defaultState = {
    currentIssueId: '',
    contactIndexes: {},
    completedIssueIds: [],
  };
});

test('Call State reducer processes CURRENT_ISSUE_SELECTED action', () => {
  const issueId = 'issue1';
  const state = { ...defaultState };
  const action: CurrentIssueAction = {
    type: CallStateActionType.CURRENT_ISSUE_SELECTED,
    payload: issueId
  };
  const newState = callStateReducer(state, action);
  expect(newState.currentIssueId).toEqual(issueId);
});

test('Call State reducer processes NEXT_CONTACT action', () => {
  const issueId1 = 'issue1';
  const issueId1Index = 1;
  const contactIndexes = {'issue1': 1, 'issue2': 2};
  const state = { ...defaultState, contactIndexes, currentIssueId: issueId1 };
  const action: NextContact = {
    type: CallStateActionType.NEXT_CONTACT
  };
  const newState = callStateReducer(state, action);
  // console.log('NEW STATE', newState);
  expect(newState.contactIndexes[issueId1]).toEqual(issueId1Index + 1);
});

test('Call State reducer processes COMPLETE_ISSUE action with callState.currentIssueId', () => {
  const issueId1 = 'issue1';
  const completedIssues = ['issue2', 'issue3'];
  const state = { ...defaultState, currentIssueId: issueId1, completedIssueIds: completedIssues };
  const action: CompleteIssueAction = {
    type: CallStateActionType.COMPLETE_ISSUE
  };
  const newState = callStateReducer(state, action);
  // console.log('NEW STATE', newState);
  expect(newState.completedIssueIds).toContain(issueId1);
  expect(newState.completedIssueIds.length).toEqual(3);
});

test('Call State reducer processes COMPLETE_ISSUE action with issueId argument', () => {
  const issueId = 'issue4';
  const completedIssues = ['issue2', 'issue3'];
  const state = { ...defaultState, completedIssueIds: completedIssues };
  // console.log('OLD STATE', state);
  const action: CompleteIssueAction = {
    type: CallStateActionType.COMPLETE_ISSUE,
    payload: issueId
  };
  const newState = callStateReducer(state, action);
  // console.log('NEW STATE', newState);
  expect(newState.completedIssueIds).toContain(issueId);
  expect(newState.completedIssueIds.length).toEqual(3);
});

test('Call State reducer processes CLEAR_CONTACT_INDEXES action', () => {
  const contactIndexes = {'issue1': 1, 'issue2': 2};
  const state = { ...defaultState, contactIndexes };
  const action: ClearContactIndexesAction = {
    type: CallStateActionType.CLEAR_CONTACT_INDEXES
  };
  const newState = callStateReducer(state, action);
  // console.log('NEW STATE', newState);
  expect(newState.contactIndexes).toEqual({});
});
