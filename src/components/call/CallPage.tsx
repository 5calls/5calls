import * as React from 'react';
import { isEqual } from 'lodash';
import { Helmet } from 'react-helmet';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router';

import * as Constants from '../../common/constants';

import { getIssue } from '../shared/utils';

import i18n from '../../services/i18n';
import { CallTranslatable, FetchCall } from './index';
import { Layout } from '../layout';
import { Issue } from '../../common/model';

import {
  CallState,
  selectIssueActionCreator,
} from '../../redux/callState';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';
import {
  getIssuesIfNeeded,
  RemoteDataState,
} from '../../redux/remoteData';
import { store } from '../../redux/store';

import {
  remoteStateContext,
  callStateContext,
} from '../../contexts';

interface RouteProps {
  readonly groupid: string;
  readonly issueid: string;
}

// tslint:disable-next-line:no-bitwise
type Props = RouteComponentProps<RouteProps> & {
  remoteState: RemoteDataState;
  callState: CallState;
};

export interface State {
  currentIssue?: Issue;
  currentIssueId: string;
  hasBeenCached: boolean;
}

class CallPageView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = this.setStateFromProps(props);
  }

  setStateFromProps(props: Props) {
    let currentIssue = this.getCurrentIssue(props.remoteState);

    return {
      currentIssue: currentIssue,
      currentIssueId: currentIssue ? currentIssue.id : '',
      hasBeenCached: false,
    };
  }

  componentDidMount() {
    // the user has clicked on an issue from the sidebar
    if (!this.state.currentIssueId && this.state.currentIssue) {
      selectIssueActionCreator(this.state.currentIssue.id);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.remoteState.issues) {
      if (!isEqual(this.props, prevProps)) {
        const currentIssue = this.getCurrentIssue(this.props.remoteState);
        this.setState({
          ...this.state,
          currentIssue: currentIssue,
          currentIssueId: currentIssue ? currentIssue.id : '',
        });
      }
    }
  }

  getCurrentIssue = (remoteState: RemoteDataState): Issue | undefined => {
    let currentIssue: Issue | undefined = undefined;
    const path = this.props.location.pathname.split('/');
    let issueid = '';
    if (path.length > 2) {
      issueid = path[path.length - 1];
    }
    if (path) {
      if (!this.state || this.state.currentIssueId !== issueid) {
        store.dispatch(selectIssueActionCreator(issueid));
        currentIssue = getIssue(remoteState, issueid);
      }
    } else {
      currentIssue = getIssue(remoteState, this.state.currentIssueId);
    }

    return currentIssue;
  }

  getView = () => {
    if (!this.props.remoteState.issues) {
      queueUntilRehydration(() => {
        getIssuesIfNeeded();
      });
    }

    let extraComponent;

    let pageTitle = '5 Calls: Make your voice heard';
    if (this.state.currentIssue) {
      pageTitle = `${this.state.currentIssue.name}: 5 Calls`;
    }

    let canonicalURL: string | undefined = undefined;
    if (this.state.currentIssue) {
      let slug = this.state.currentIssue.slug;
      if (slug === '' || slug === undefined) {
        slug = this.state.currentIssue.id;
      }

      canonicalURL = Constants.APP_URL + '/issues/' + slug;
    }

    if (this.state.currentIssue &&
        this.state.currentIssue.contactType &&
        this.state.currentIssue.contactType === 'FETCH') {
        return (
        <Layout
          extraComponent={extraComponent}
        >
          <Helmet>
            <title>{pageTitle}</title>
            {canonicalURL && <link rel="canonical" href={canonicalURL} />}
          </Helmet>
          <FetchCall
            issue={this.state.currentIssue}
          />
        </Layout>
      );
    } else if (this.state.currentIssue) {
      return (
        <Layout
          extraComponent={extraComponent}
        >
          <Helmet>
            <title>{pageTitle}</title>
            {canonicalURL && <link rel="canonical" href={canonicalURL} />}
          </Helmet>
          <CallTranslatable
            issue={this.state.currentIssue}
            callState={this.props.callState}
          />
        </Layout>
      );
    } else {
      return (
        <Layout>
          <h1 className="call__title">{i18n.t('noCalls.title')}</h1>
          <p>{i18n.t('noCalls.reason')}</p>
          <p>{i18n.t('noCalls.nextStep')}</p>
        </Layout>
      );
    }
  }

  render() {
    return (
      <>
        {this.getView()}
      </>
    );
  }
}

export const CallPageWithRouter = withRouter(CallPageView);

export default class CallPage extends React.Component {
  render() {
    return (
      <remoteStateContext.Consumer>
      { remoteState =>
        <callStateContext.Consumer>
        { callState =>
          <CallPageWithRouter
            remoteState={remoteState}
            callState={callState}
          />
        }
        </callStateContext.Consumer>
      }
      </remoteStateContext.Consumer>
    );
  }
}
