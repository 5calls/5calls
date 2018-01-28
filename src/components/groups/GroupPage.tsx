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

export const GroupDisclaimer = () => {
  return (
    /*tslint:disable-next-line:max-line-length*/
    <div className="extraDisclaimer"><p>Content on this page is the responsibility of the Team owner and is not endorsed by 5 Calls. <a href="mailto:make5calls@gmail.com">Report abusive behavior</a></p></div>
  );
};

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

    if (!this.props.issues || this.props.issues.length === 0) {
      queueUntilRehydration(() => {
        this.props.onGetIssuesIfNeeded();
      });
    }

  }

  componentDidMount() {
    if (!this.props.issues || this.props.issues.length === 0) {
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

  wrapWithLayout(wrappedHeader: JSX.Element, group?: Group, ...additionalComponents: JSX.Element[]) {
    return (
      <LayoutContainer
        currentGroup={group ? group : undefined}
        issues={this.props.issues}
        issueId={this.props.match.params.issueid}
        extraComponent={<GroupDisclaimer/>}
      >
        <div className="page__group">
          {wrappedHeader}
          {...additionalComponents}
        </div>
      </LayoutContainer>
    );
  }

  render() {
    let group = this.state.group;
    switch (this.state.loadingState) {
      case GroupLoadingActionStatus.LOADING:
        const wrappedLoading = (
          <h2 className="page__title">Getting team...</h2>
        );
        return (
          this.wrapWithLayout(wrappedLoading, group)
        );
      case GroupLoadingActionStatus.FOUND:

        const groupImage = group && group.photoURL ? group.photoURL : '/img/5calls-stars.png';
        const wrappedFound = (
          <div>
            <div className="page__header">
              <div className="page__header__image"><img alt={group ? group.name : ''} src={groupImage}/></div>
              <h1 className="page__title">{group ? group.name : ''}</h1>
              <h2 className="page__subtitle">{group ? group.subtitle : ''}&nbsp;</h2>
            </div>
          </div>
        );
        // Keys are needed to prevent React key warnings
        // when wrapWithLayout() is called.
        const count: JSX.Element = (
          <span key={1}>
            <CallCount
              totalCount={group ? group.totalCalls : 0}
              minimal={true}
              t={i18n.t}
            />
          </span>
        );
        const markdown: JSX.Element =  (
          <div key={2}>
            <ReactMarkdown source={group ? group.description : ''}/>
          </div>
        );

        return (
          this.wrapWithLayout(wrappedFound, group, count, markdown)
        );
      case GroupLoadingActionStatus.NOTFOUND:
        const wrappedNotFound = (
          <h2 className="page__title">There's no team with an ID of '{this.props.match.params.groupid}' 😢</h2>
        );
        return (
          this.wrapWithLayout(wrappedNotFound, group)
        );
      default:
        const wrappedDefault = (
          <h2 className="page__title">
            An error occurred during a request for team '{this.props.match.params.groupid}' 😢
          </h2>
        );
        return (
          this.wrapWithLayout(wrappedDefault, group)
        );
    }
  }
}

export default GroupPage;
