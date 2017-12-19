import * as React from 'react';
import i18n from '../../services/i18n';
import { LayoutContainer } from '../layout';
import { RouteComponentProps } from 'react-router-dom';
import * as ReactMarkdown from 'react-markdown';

import { Group, Issue } from '../../common/model';
import { LocationState } from '../../redux/location/reducer';
import { CallState } from '../../redux/callState/reducer';
import { CallCount } from '../shared';
// import { queueUntilRehydration } from '../../redux/rehydrationUtil';
import { getGroup } from '../../services/apiServices';

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
  readonly pageGroup?: Group;
  readonly cacheGroup: (group: Group) => Function;
}

export interface State {
  loadingState: GroupLoadingState;
  pageGroupState?: Group;
}

enum GroupLoadingState {
  LOADING = 'LOADING',
  FOUND = 'FOUND',
  NOTFOUND = 'NOTFOUND',
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
      pageGroupState: props.pageGroup ? props.pageGroup : undefined
    };
  }

  setGroup(props: Props) {
    if (!this.state.pageGroupState) {
      getGroup(props.match.params.groupid)
        .then(group => {
          this.setState({pageGroupState: group});
          if (group) {
            this.setState({loadingState: GroupLoadingState.FOUND});
          } else {
            this.setState({loadingState: GroupLoadingState.NOTFOUND});
          }
          // Dispatch call to add to cache
          this.props.cacheGroup(group);
          this.props.onGetIssuesIfNeeded(group.id);
        })
        // tslint:disable-next-line:no-console
        .catch(error => console.log('Problem calling cache/asyncActionCreator.getGroup()', error));
    }

  }

  componentWillReceiveProps(newProps: Props) {
      // if (newProps.match.params.groupid) {
      //   this.setState({ loadingState: GroupLoadingState.LOADING });
        // this.getGroupDetails(newProps.match.params.groupid);
      // }
  }

  componentDidMount() {
    if (this.state.pageGroupState) {
      this.setState({loadingState: GroupLoadingState.FOUND});
    }
    // queueUntilRehydration(() => {
    //   this.getGroupDetails(this.props.match.params.groupid);
    // });
  }

  // getGroupDetails = (groupid: string) => {
  //     if (this.state.pageGroupState && this.state.loadingState !== GroupLoadingState.LOADING) {
  //       this.props.onGetIssuesIfNeeded(groupid);

  //       // this.setState({ loadingState: GroupLoadingState.FOUND });
  //     // } else {
  //     //   this.setState({ loadingState: GroupLoadingState.NOTFOUND });
  //     }
  // }

  joinTeam = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();

    if (this.props.pageGroup) {
      this.props.onJoinGroup(this.props.pageGroup);
    }
  }

  render() {
    switch (this.state.loadingState) {
      case GroupLoadingState.LOADING:
        return (
          <LayoutContainer
            currentGroupId={this.props.match.params.groupid}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <h2 className="page__title">Getting team...</h2>
            </div>
          </LayoutContainer>
        );
      case GroupLoadingState.FOUND:
        // const groupId = this.props.activeGroup ? this.props.activeGroup.id : 'nogroup';

        // I hate handling optionals this way, swift is so much better on this
        let group: Group;
        if (this.state.pageGroupState) {
          group = this.state.pageGroupState;
        } else {
          return <span/>;
        }

        const groupImage = group.photoURL ? group.photoURL : '/img/5calls-stars.png';

        return (
          <LayoutContainer
            currentGroupId={this.props.match.params.groupid}
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
      default:
        return (
          <LayoutContainer
            currentGroupId={this.props.match.params.groupid}
            issues={this.props.issues}
            issueId={this.props.match.params.issueid}
          >
            <div className="page__group">
              <h2 className="page__title">There's no team here 😢</h2>
            </div>
          </LayoutContainer>
        );
    }
  }
}

export default GroupPage;
