import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../../redux/root';
import GroupPage from './GroupPage';
import { Group, Issue, getDefaultGroup } from '../../common/model';
import { getGroupIssuesIfNeeded } from '../../redux/remoteData';
import { LocationState } from '../../redux/location';
import { CallState, selectIssueActionCreator,
  joinGroupActionCreator } from '../../redux/callState';
import { findCacheableGroup } from '../../redux/cache';
import { GroupLoadingActionStatus } from '../../redux/group/action';
import { updateGroup } from '../../redux/group/index';

interface OwnProps extends RouteComponentProps<{ groupid: string, issueid: string }> { }

interface StateProps {
  readonly issues: Issue[];
  readonly callState: CallState;
  readonly locationState: LocationState;
  readonly currentGroup?: Group;
  readonly loadingStatus: GroupLoadingActionStatus;
}

interface DispatchProps {
  readonly onSelectIssue: (issueId: string) => void;
  readonly onGetIssuesIfNeeded: () => void;
  readonly onJoinGroup: (group: Group) => void;
  readonly cacheGroup: (group: Group) => Function;
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps): StateProps => {
  let loadingStatus: GroupLoadingActionStatus = GroupLoadingActionStatus.LOADING;
  // set group if in cache
  const groupId = ownProps.match.params.groupid;
  const cgroup = findCacheableGroup(groupId, state.appCache);
  if (cgroup) {
    loadingStatus = GroupLoadingActionStatus.FOUND;
  }
  let currentGroup = cgroup ? cgroup.group : getDefaultGroup(groupId);
  let groupPageIssues: Issue[] = [];

  // send group issues if they exist, normal active ones if they don't
  if (state.remoteDataState.groupIssues &&
    state.remoteDataState.groupIssues.length !== 0 &&
    currentGroup.customCalls
  ) {
    groupPageIssues = state.remoteDataState.groupIssues;
  } else {
    groupPageIssues = state.remoteDataState.issues;
  }

  if (loadingStatus !== GroupLoadingActionStatus.FOUND && state.groupState.groupLoadingStatus) {
    loadingStatus = state.groupState.groupLoadingStatus;
  }

  return {
    currentGroup: currentGroup,
    issues: groupPageIssues,
    callState: state.callState,
    locationState: state.locationState,
    loadingStatus: loadingStatus,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>, ownProps: OwnProps): DispatchProps => {
  return bindActionCreators(
    {
      onSelectIssue: selectIssueActionCreator,
      onGetIssuesIfNeeded: () => {
        return (nextDispatch: Dispatch<ApplicationState>,
                getState: () => ApplicationState) => {
          // this page knows about the path params, and sub-components may not,
          // attach the groupid to this method here
          dispatch(getGroupIssuesIfNeeded(ownProps.match.params.groupid));
        };
      },
      onJoinGroup: joinGroupActionCreator,
      cacheGroup: updateGroup
    },
    dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupPage);
