import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ApplicationState } from '../../redux/root';
import GroupPage from './GroupPage';
import { Group, Issue, CacheableGroup } from '../../common/model';
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
  readonly currentGroup?: CacheableGroup;
}

interface DispatchProps {
  readonly onSelectIssue: (issueId: string) => void;
  readonly onGetIssuesIfNeeded: () => void;
  readonly onJoinGroup: (group: Group) => void;
  readonly cacheGroup: (group: Group) => Function;
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps): StateProps => {
  // set group if in cache
  const groupId = ownProps.match.params.groupid;
  const cgroup = findCacheableGroup(groupId, state.appCache);

  return {
    currentGroup: cgroup,
    issues: state.remoteDataState.groupIssues,
    callState: state.callState,
    locationState: state.locationState,
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
      cacheGroup: addToCache
    },
    dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(GroupPage);
