import { Reducer } from 'redux';
import { Issue, Donations } from '../../common/model';
import { RemoteDataAction, RemoteDataActionType } from './index';

export interface RemoteDataState {
  issues: Issue[];
  inactiveIssues: Issue[];
  currentGroupId: string;
  groupIssues: Issue[];
  callTotal: number;
  donations: Donations;
  errorMessage: string;
}

export const remoteDataReducer: Reducer<RemoteDataState> = (
  state: RemoteDataState = {} as RemoteDataState,
  action: RemoteDataAction): RemoteDataState => {
  switch (action.type) {
    case RemoteDataActionType.GET_ISSUES:
      // filter all issues into active / inactive
      let activeIssues: Issue[] = [];
      let inactiveIssues: Issue[] = [];
      if (action !== undefined && action.payload !== undefined) {
        let issues = action.payload as Issue[];
        activeIssues = issues.filter((item) => { return item.inactive === false; });
        inactiveIssues = issues.filter((item) => { return item.inactive === true; });
      }

      const issuesState = Object.assign({}, state, {issues: activeIssues, inactiveIssues: inactiveIssues});
      return issuesState;
    case RemoteDataActionType.GET_CALL_TOTAL:
      return Object.assign({}, state, {callTotal: action.payload});
    case RemoteDataActionType.GET_DONATIONS:
      return Object.assign({}, state, {donations: action.payload});
    case RemoteDataActionType.API_ERROR:
      return Object.assign({}, state, {errorMessage: action.payload});
    default:
      return state;
  }
};
