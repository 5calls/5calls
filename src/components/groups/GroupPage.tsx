import * as React from 'react';
import i18n from '../../services/i18n';
import { LayoutContainer } from '../layout';
import { RouteComponentProps } from 'react-router-dom';
import * as ReactMarkdown from 'react-markdown';
import { Group, Issue, CacheableGroup } from '../../common/model';
import { LocationState } from '../../redux/location/reducer';
import { CallState } from '../../redux/callState/reducer';
import { CallCount } from '../shared';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';
import { getGroup } from '../../services/apiServices';
import { hasGroupCacheTimeoutExceeded, cacheableGroupFactory } from '../../redux/cache/cache';

interface RouteProps extends RouteComponentProps<{ groupid: string, issueid: string }> { }

interface Props extends RouteProps {
  readonly issues: Issue[];
  readonly currentIssue?: Issue;
  readonly completedIssueIds: string[];
  readonly callState: CallState;
  readonly locationState: LocationState;
  readonly setLocation: (location: string) => void;
  readonly clearLocation: () => void;
  readonly onSelectIssue: (issueId: string) => Function;
  readonly onGetIssuesIfNeeded: (groupid: string) => Function;
  readonly onJoinGroup: (group: Group) => Function;
  readonly currentGroup?: CacheableGroup;
  readonly cacheGroup: (group: Group) => Function;
}

export interface State {
  loadingState: GroupLoadingState;
  pageGroupState?: CacheableGroup;
}

enum GroupLoadingState {
  LOADING = 'LOADING',
  FOUND = 'FOUND',
  NOTFOUND = 'NOTFOUND',
  ERROR = 'ERROR',
}

class GroupPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // set initial state
    this.state = this.setStateFromProps(props);
    this.setGroup(props);
  }

  setStateFromProps(props: Props): State {
    return {
      loadingState: GroupLoadingState.LOADING,
      pageGroupState: props.currentGroup ? props.currentGroup : undefined
    };
  }

  setGroup(props: Props) {
    let cgroup = this.state.pageGroupState;
    // Call the API when page first loads and group
    // is not in the cache or if the cached value has timed out
    if (!cgroup || hasGroupCacheTimeoutExceeded({timestamp: cgroup.timestamp})) {
      getGroup(props.match.params.groupid)
        .then(group => {
          if (group) {
            this.setState({pageGroupState: cacheableGroupFactory(group)});
            this.setState({loadingState: GroupLoadingState.FOUND});
          } else {
            this.setState({loadingState: GroupLoadingState.NOTFOUND});
          }
          // Dispatch call to add to cache
          this.props.cacheGroup(group);
          this.props.onGetIssuesIfNeeded(group.id);
        })
        .catch((error: Error) =>  {
          // If 404 error, set loading state to NOTFOUND
          if (error.message.includes('404')) {
            this.setState({loadingState: GroupLoadingState.NOTFOUND});
          } else {
            // tslint:disable-next-line:no-console
            console.error('Problem calling cache/asyncActionCreator.getGroup()', error);
            this.setState({loadingState: GroupLoadingState.ERROR});
          }
        });
    }

  }

  componentDidMount() {
    if (this.state.pageGroupState) {
      this.setState({loadingState: GroupLoadingState.FOUND});
      queueUntilRehydration(() => {
        this.props.onGetIssuesIfNeeded(this.props.match.params.groupid);
      });
    } else {
      this.setState({loadingState: GroupLoadingState.LOADING});
    }
  }

  joinTeam = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();

    if (this.props.currentGroup) {
      this.props.onJoinGroup(this.props.currentGroup.group);
    }
  }

  render() {
    switch (this.state.loadingState) {
      case GroupLoadingState.LOADING:
        return (
          <LayoutContainer
            currentGroup={this.state.pageGroupState ? this.state.pageGroupState : undefined}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <h2 className="page__title">Getting team...</h2>
            </div>
          </LayoutContainer>
        );
      case GroupLoadingState.FOUND:
        // I hate handling optionals this way, swift is so much better on this
        let group: Group;
        if (this.state.pageGroupState) {
          group = this.state.pageGroupState.group;
        } else {
          return <span/>;
        }

        const groupImage = group.photoURL ? group.photoURL : '/img/5calls-stars.png';

        return (
          <LayoutContainer
            currentGroup={this.state.pageGroupState ? this.state.pageGroupState : undefined}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <div className="page__header">
                <div className="page__header__image"><img alt={group.name} src={groupImage}/></div>
                <h1 className="page__title">{group.name}</h1>
                <h2 className="page__subtitle">{group.subtitle}&nbsp;</h2>
              </div>
              <CallCount
                totalCount={group.totalCalls}
                minimal={true}
                t={i18n.t}
              />
              <ReactMarkdown source={group.description}/>
            </div>
          </LayoutContainer>
        );
      case GroupLoadingState.NOTFOUND:
        return (
          <LayoutContainer
            currentGroup={this.state.pageGroupState ? this.state.pageGroupState : undefined}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <h2 className="page__title">There's no team with an ID of '{this.props.match.params.groupid}' 😢</h2>
            </div>
          </LayoutContainer>
        );
        default:
          return (
            <LayoutContainer
              currentGroup={this.state.pageGroupState ? this.state.pageGroupState : undefined}
              issues={this.props.issues}
              issueId={this.props.match.params.issueid}
            >
              <div className="page__group">
                { // tslint:disable-next-line:max-line-length
                }
                <h2 className="page__title">An error occurred during a request for team '{this.props.match.params.groupid}' 😢</h2>
              </div>
            </LayoutContainer>
          );
    }
  }
}

export default GroupPage;
