import { Reducer } from 'redux';
import { CallStateAction, CallStateActionType } from './index';

/*
  REDUX DATA FLOW 4: When the selectIssueActionCreator has been dispatched, it returns the
  action object with type 'CURRENT_ISSUE_SELECTED'.  The Redux Store basically has a big
  switch statement where if it sees the action type of the action, it will run the associated logic
  in that switch case.
    And, it will act only on the key(or section, it is basically a dictionary) of the Redux store
  (in this file the key is "callState").  Look into the /src/redux/root.ts file to see the
  combineReducers method that puts all of the reducers together and defines your redux keys.

  See below in reducer for next step(5) in Redux Data Flow
*/

/*
  One of the big wins of Typescript is allowing us to statically type our application state.
  The CallState key(section) of the redux store is defined here.  In the root.ts file, the definitions
  of each key in the store are put together to define the full redux store(called "ApplicationState");
*/
export interface CallState {
  currentIssueId: string;
  // key is the issueId, value is the index of the last contact visited
  contactIndexes: {[key: string]: number};
  completedIssueIds: string[];
}

/*
  Redux convention is that we always return a new copy of the state.  We never change the existing copy.
  If the state of this key is null/undefined, we return the default value(in this case "{}").

  This(...state.completedIssueIds) is using the new ES6 "Spread" operator.
  It will take the existing array and break it into individual components.
  In the code below, it is "spreading" the completedIssueIds array into individual items that
    are then put back into a new array.  This allows us to stick to the conventions of never
    altering the state but always creating a new object(in this case a new array)
  newCompletedIssues = [...state.completedIssueIds];

  The spread operator also works with objects and you will often see it in reducers in place of
  "Object.assign" that is used here.
*/
export const callStateReducer: Reducer<CallState> = (
  state: CallState = {} as CallState,
  action: CallStateAction): CallState => {
  switch (action.type) {
    case CallStateActionType.CURRENT_ISSUE_SELECTED:
      /*
        REDUX DATA FLOW 5: This type is seen when our action is dispatched and so this reducer switch
        case is run.  In, this case, it takes the existing state and puts it into a new object. It
        then overwrites the currentIssueId property on that state with the action.payload which is the
        new issueId that we submitted all the way back when we clicked on the IssueListItem component.

        You could at this point subscribe to the store to listen to this event and perform an action
          in response to it.  We don't currently subscribe to events explicitly in this app.

        If you have data that you have retrieved from Redux that you have saved to "Local" state in a component
        through the "SetState" method, and it is changed through a reducer, the redux container will see this
        and make your component aware of it.  The component will then re-render itself.  React Components,
        by default, re-render themselves whenever their "Local" state changes.

        For example, if we saved the ApplicationState.callState.currentIssueId to "Local" state in
        "HomePage" component(which we actually couldn't because it is a stateless component but just hypothetically),
        it would get re-rendered because of this change to it's value the Redux store.

        End of Redux Data Flow
      */
      return Object.assign({}, state, { currentIssueId: action.payload });
    case CallStateActionType.COMPLETE_ISSUE:
      let newCompletedIssues: string[] = [];
      if (state.completedIssueIds) {
        newCompletedIssues = [...state.completedIssueIds];
      }
      const payload = action.payload as string;
      if (payload) {
        newCompletedIssues.push(payload);
      } else {
        newCompletedIssues.push(state.currentIssueId);
      }
      let newState = { ...state };
      newState.completedIssueIds = newCompletedIssues;
      return newState;
    case CallStateActionType.NEXT_CONTACT:
      let newIndexes = { ...state.contactIndexes };
      if (!newIndexes[state.currentIssueId]) {
        newIndexes[state.currentIssueId] = 1;
      } else {
        newIndexes[state.currentIssueId]++;
      }
      return { ...state, contactIndexes: newIndexes };
    case CallStateActionType.CLEAR_CONTACT_INDEXES:
      return { ...state, contactIndexes: {}};
    default:
      return state;
  }
};
