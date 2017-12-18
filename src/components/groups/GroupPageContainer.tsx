import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ApplicationState } from '../../redux/root';
import GroupPage from './GroupPage';
import { Group, Issue } from '../../common/model';
import { getGroupIssuesIfNeeded } from '../../redux/remoteData';
import { LocationState } from '../../redux/location/reducer';
import { CallState } from '../../redux/callState/reducer';
import { selectIssueActionCreator, joinGroupActionCreator } from '../../redux/callState';

import { RouteComponentProps } from 'react-router-dom';
import { addToCache } from '../../redux/cache/asyncActionCreator';
import { findCacheableGroup } from '../../redux/cache/cache';

interface OwnProps extends RouteComponentProps<{ groupid: string, issueid: string }> { }

interface StateProps {
  readonly issues: Issue[];
  readonly callState: CallState;
  readonly locationState: LocationState;
  readonly pageGroup?: Group;
}

interface DispatchProps {
  readonly onSelectIssue: (issueId: string) => void;
  readonly onGetIssuesIfNeeded: (groupid: string) => void;
  readonly onJoinGroup: (group: Group) => void;
  readonly cacheGroup: (group: Group) => Function;
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps): StateProps => {
  // set group if in cache
  const groupId = ownProps.match.params.groupid;
  const cgroup = findCacheableGroup(groupId, state.appCache);
  console.log('Found CachableGroup', cgroup)
  let group: Group | undefined = undefined;
  if (cgroup) {
    group = cgroup.group;
  }

  let groupPageIssues: Issue[] = [];

  // send group issues if they exist, normal active ones if they don't
  if (state.remoteDataState.groupIssues && state.remoteDataState.groupIssues.length !== 0) {
    groupPageIssues = state.remoteDataState.groupIssues;
  } else {
    groupPageIssues = state.remoteDataState.issues;
  }

  return {
    pageGroup: group,
    issues: groupPageIssues,
    callState: state.callState,
    locationState: state.locationState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): DispatchProps => {
  return bindActionCreators(
    {
      onSelectIssue: selectIssueActionCreator,
      onGetIssuesIfNeeded: getGroupIssuesIfNeeded,
      onJoinGroup: joinGroupActionCreator,
      cacheGroup: addToCache
    },
    dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupPage);
