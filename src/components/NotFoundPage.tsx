import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { Helmet } from 'react-helmet';
import { find } from 'lodash';

import i18n from '../services/i18n';
import { LocationState } from '../redux/location/reducer';
import { newLocationLookup, clearAddress } from '../redux/location';
import { CallState } from '../redux/callState/reducer';
import { selectIssueActionCreator } from '../redux/callState';
import { ApplicationState } from '../redux/root';
import { Issue, CacheableGroup } from '../common/model';

import { SidebarHeader, Sidebar, Footer, Header } from './layout';

type AllProps = Props & DispatchProps;

const NotFoundPage: React.StatelessComponent<AllProps> = (props: AllProps) => {
  return (
    <div>
      <Helmet>
        <title>5 Calls: Make your voice heard</title>
      </Helmet>
      <Header/>
      <div className="layout">
        <aside id="nav" role="contentinfo" className="layout__side">
          <div className="issues">
            <SidebarHeader
              callState={props.callState}
              locationState={props.locationState}
              setLocation={props.setLocation}
              clearLocation={props.clearLocation}
            />
            <Sidebar
              issues={props.issues}
              currentIssue={undefined}
              completedIssueIds={props.completedIssueIds}
              onSelectIssue={props.onSelectIssue}
            />
          </div>
        </aside>
        <main id="content" role="main" aria-live="polite" className="layout__main">
          <h1>There's nothing here 😢</h1>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>Looks like you visited a page that doesn't exist. Pick one of the issues on the sidebar or <Link to="/">go back to the homepage</Link>.</p>
        </main>
      </div>
      <Footer
        t={i18n.t}
      />
    </div>
  );
};

interface OwnProps {
  readonly issueId?: string;
  readonly issues?: Issue[];
  readonly currentGroup?: CacheableGroup;
}

interface Props {
  readonly issues: Issue[];
  readonly currentIssue?: Issue;
  readonly completedIssueIds: string[];
  readonly callState: CallState;
  readonly locationState: LocationState;
}

interface DispatchProps {
  readonly onSelectIssue: (issueId: string) => void;
  readonly setLocation: (location: string) => void;
  readonly clearLocation: () => void;
}

const mapStateToProps = (state: ApplicationState, ownProps: OwnProps): Props => {
  let currentIssue: Issue | undefined = undefined;
  if (state.remoteDataState.issues) {
    currentIssue = find(state.remoteDataState.issues, i => i.id === ownProps.issueId);
  }

  let issues: Issue[] = [];
  // overrise issues from above the layout container if needed
  issues = ownProps.issues ? ownProps.issues : state.remoteDataState.issues;

  return {
    issues: issues,
    currentIssue: currentIssue,
    completedIssueIds: state.callState.completedIssueIds,
    callState: state.callState,
    locationState: state.locationState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ApplicationState>): DispatchProps => {
  return bindActionCreators(
    {
      onSelectIssue: selectIssueActionCreator,
      setLocation: newLocationLookup,
      clearLocation: clearAddress,
    },
    dispatch);
};

export default connect<Props, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps)(NotFoundPage);