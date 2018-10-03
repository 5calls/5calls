import * as React from 'react';
import { Helmet } from 'react-helmet';

import { Issue } from '../../common/model';
import { SidebarHeader, Sidebar, Footer, Header } from './index';

import { RemoteDataState } from '../../redux/remoteData';
import {
  remoteStateContext,
  callStateContext,
  userStateContext,
} from '../../contexts';

interface Props {
  readonly children?: {};
  readonly extraComponent?: {};
  readonly postcards?: boolean;
  readonly currentIssue?: Issue;
}

function getIssues(remoteState: RemoteDataState): Issue[] {
  return remoteState.issues;
}

const Layout: React.StatelessComponent<Props> = (props: Props) => (
  <>
    <Helmet>
      <title>5 Calls: Make your voice heard</title>
    </Helmet>
    <userStateContext.Consumer>
    { userState =>
      <Header
        postcards={props.postcards}
        currentUser={userState}
      />
    }
    </userStateContext.Consumer>
    <div className="layout">
      <aside id="nav" role="contentinfo" className="layout__side">
        <callStateContext.Consumer>
        { callState =>
          <remoteStateContext.Consumer>
          { remoteState =>
            <div className="issues">
              <SidebarHeader/>
              <Sidebar
                issues={getIssues(remoteState)}
                currentIssue={props.currentIssue ? props.currentIssue : undefined}
                completedIssueIds={callState.completedIssueIds}
              />
            </div>
          }
          </remoteStateContext.Consumer>
        }
        </callStateContext.Consumer>
      </aside>
      <main id="content" role="main" aria-live="polite" className="layout__main">
        {props.children}
      </main>
    </div>
    {props.extraComponent}
    <Footer/>
  </>
);

export default Layout;
