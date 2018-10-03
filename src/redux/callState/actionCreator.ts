import { CurrentIssueAction,
  CompleteIssueAction, NextContact,
  CallStateActionType, ClearContactIndexesAction } from './index';

/* REDUX DATA FLOW 3: At this point in the data flow, the IssueListItem View Component was clicked, the method was
    passed up through the Redux Container which called this actionCreator.
    This action creator will create an object(defined as an "action") that has a
    defined type ('CURRENT_ISSUE_SELECTED') which is constrained by an enum in the
    action.ts file. It also has a payload that is also defined in the action.ts file.

    Redux will then "Dispatch" that object, which will send this object through the reducers.
    A reducers that matches this action type will take charge of it an run its defined reducer logic.
    See /src/redux/callState/reducer.ts for next step(4) in Redux Data Flow
 */
export const selectIssueActionCreator = (issueId: string): CurrentIssueAction => {
  return {
    type: CallStateActionType.CURRENT_ISSUE_SELECTED,
    payload: issueId
  };
};

export const completeIssueActionCreator = (issueId?: string): CompleteIssueAction => {
  // completes the current issue: callState.currentIssueId
  return {
    type: CallStateActionType.COMPLETE_ISSUE,
    payload: issueId
  };
};

export const moveToNextActionCreator = (): NextContact => {
  return {
    type: CallStateActionType.NEXT_CONTACT
  };
};

export const clearContactIndexes = (): ClearContactIndexesAction => {
  return {
    type: CallStateActionType.CLEAR_CONTACT_INDEXES
  };
};
