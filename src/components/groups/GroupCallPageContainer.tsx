import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../../redux/root';
import { CallPage } from '../call';
import { Issue, Group, getDefaultGroup } from '../../common/model';
import { getIssue } from '../shared/utils';
import { getGroupIssuesIfNeeded } from '../../redux/remoteData';
import { LocationState, clearAddress } from '../../redux/location';
import { CallState, OutcomeData, submitOutcome, selectIssueActionCreator } from '../../redux/callState';
import { findCacheableGroup } from '../../redux/cache';
import { updateGroup } from '../../redux/group';

interface OwnProps extends RouteComponentProps<{ groupid: string, issueid: string }> { }

interface StateProps {
  readonly issues: Issue[];
  readonly currentIssue?: Issue;
  readonly currentGroup?: Group;
  readonly callState: CallState;
  readonly locationState: LocationState;
  readonly hasBeenCached: boolean;
}

interface DispatchProps {
  readonly onSubmitOutcome: (data: OutcomeData) => void;
  readonly onGetIssuesIfNeeded: () => void;
  readonly onSelectIssue: (issueId: string) => void;
  readonly clearLocation: () => void;
  readonly cacheGroup: (group: Group) => Function;
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps): StateProps => {
  // set group if in cache
  const groupId = ownProps.match.params.groupid;
  const cgroup = findCacheableGroup(groupId, state.appCache);
  let currentGroup = cgroup ? cgroup.group : getDefaultGroup(groupId);

  let groupPageIssues: Issue[] = [];
  // send group issues if they exist, normal active ones if they don't
  if (state.remoteDataState.groupIssues && state.remoteDataState.groupIssues.length !== 0) {
    groupPageIssues = state.remoteDataState.groupIssues;
  } else {
    groupPageIssues = state.remoteDataState.issues;
  }

  const currentIssue: Issue | undefined = getIssue(state.remoteDataState, ownProps.match.params.issueid);
  const groupState = state.groupState;
  return {
    currentGroup: currentGroup,
    issues: groupPageIssues,
    currentIssue: currentIssue,
    callState: state.callState,
    locationState: state.locationState,
    hasBeenCached: groupState.currentGroup !== undefined && groupState.currentGroup.name !== ''
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>, ownProps: OwnProps): DispatchProps => {
  return bindActionCreators(
    {
      onSubmitOutcome: (data: OutcomeData) => {
        return (nextDispatch: Dispatch<ApplicationState>,
                getState: () => ApplicationState) => {
          // if we're calling from a group page (only case right now, but whatevs)
          // then set the groupid from the page we're on, not any group we've joined
          let adjustedData = data;
          if (ownProps.match.params.groupid) {
            adjustedData.groupId = ownProps.match.params.groupid;
          }

          dispatch(submitOutcome(adjustedData));
        };
      },
      onSelectIssue: selectIssueActionCreator,
      onGetIssuesIfNeeded: () => {
        return (nextDispatch: Dispatch<ApplicationState>,
                getState: () => ApplicationState) => {
          // this page knows about the path params, and sub-components may not,
          // attach the groupid to this method here
          dispatch(getGroupIssuesIfNeeded(ownProps.match.params.groupid));
        };
      },
      clearLocation: clearAddress,
      cacheGroup: updateGroup
    },
    dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(CallPage);
