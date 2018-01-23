import * as React from 'react';
import i18n from '../../services/i18n';
import { LayoutContainer } from '../layout';
import { RouteComponentProps } from 'react-router-dom';
import * as ReactMarkdown from 'react-markdown';
import { Group, Issue } from '../../common/model';
import { LocationState } from '../../redux/location/reducer';
import { CallState } from '../../redux/callState/reducer';
import { CallCount } from '../shared';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';
import { GroupLoadingActionStatus } from '../../redux/group/action';

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
  readonly onGetIssuesIfNeeded: () => Function;
  readonly onJoinGroup: (group: Group) => Function;
  readonly currentGroup?: Group;
  readonly cacheGroup: (group: Group) => Function;
  readonly loadingStatus: GroupLoadingActionStatus;
}

export interface State {
  loadingState: GroupLoadingActionStatus;
  group?: Group;
  hasBeenCached: boolean;
}

class GroupPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // set initial state
    this.state = this.setStateFromProps(props);
  }

  setStateFromProps(props: Props): State {
    return {
      loadingState: props.loadingStatus,
      group: props.currentGroup ? props.currentGroup : undefined,
      hasBeenCached: false
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    // set new state
    this.setState({...this.state, loadingState: nextProps.loadingStatus, group: nextProps.currentGroup });
    // if current group has changed,
    // set hasBeenCached to false to
    // update current group
    if (this.props.currentGroup
      && nextProps.currentGroup &&
      this.props.currentGroup.id !== nextProps.currentGroup.id) {
        // console.log('Resetting hasBeenCached');
        this.setState({...this.state, hasBeenCached: false});
    }
    if (!this.state.hasBeenCached && nextProps.currentGroup) {
      // cache group and assigned it to currentGroup
      this.setState({...this.state, hasBeenCached: true});
      queueUntilRehydration(() => {
        let group = nextProps.currentGroup as Group;
        // console.log('Calling cachedGroup with group: ', group);
        this.props.cacheGroup(group);
      });
    }
  }

  componentDidMount() {
    if (!this.props.issues) {
      queueUntilRehydration(() => {
        this.props.onGetIssuesIfNeeded();
      });
    }

  }

  joinTeam = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();

    if (this.props.currentGroup) {
      this.props.onJoinGroup(this.props.currentGroup);
    }
  }

  render() {
    let group = this.state.group;
    switch (this.state.loadingState) {
      case GroupLoadingActionStatus.LOADING:
        return (
          <LayoutContainer
            currentGroup={group ? group : undefined}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <h2 className="page__title">Getting team...</h2>
            </div>
          </LayoutContainer>
        );
      case GroupLoadingActionStatus.FOUND:
        // // I hate handling optionals this way, swift is so much better on this
        // let group: Group;
        // if (this.state.pageGroupState) {
        //   group = this.state.pageGroupState;
        // } else {
        //   return <span/>;
        // }

        const groupImage = group && group.photoURL ? group.photoURL : '/img/5calls-stars.png';

        return (
          <LayoutContainer
            currentGroup={group ? group : undefined}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <div className="page__header">
                <div className="page__header__image"><img alt={group ? group.name : ''} src={groupImage}/></div>
                <h1 className="page__title">{group ? group.name : ''}</h1>
                <h2 className="page__subtitle">{group ? group.subtitle : ''}&nbsp;</h2>
              </div>
              <CallCount
                totalCount={group ? group.totalCalls : 0}
                minimal={true}
                t={i18n.t}
              />
              <ReactMarkdown source={group ? group.description : ''}/>
            </div>
          </LayoutContainer>
        );
      case GroupLoadingActionStatus.NOTFOUND:
        return (
          <LayoutContainer
            currentGroup={group ? group : undefined}
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
              currentGroup={group ? group : undefined}
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
