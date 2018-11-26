import * as React from 'react';

import { Issue } from '../../common/model';
import { SidebarHeader, Sidebar, Footer, Header } from './index';

import {
  remoteStateContext,
  callStateContext,
  userStateContext
} from '../../contexts';

interface Props {
  readonly children?: {};
  readonly extraComponent?: {};
  readonly postcards?: boolean;
}

function currentIssue(
  issues: Issue[],
  currentIssueID: string
): Issue | undefined {
  let issue: Issue | undefined;
  if (issues) {
    issue = issues.find(eachIssue => {
      return (
        eachIssue.id === currentIssueID || eachIssue.slug === currentIssueID
      );
    });
  }

  return issue;
}

const Layout: React.StatelessComponent<Props> = (props: Props) => (
  <remoteStateContext.Consumer>
    {remoteState => (
      <>
        <callStateContext.Consumer>
          {callState => (
            <>
              <userStateContext.Consumer>
                {userState => (
                  <Header
                    postcards={props.postcards}
                    currentUser={userState}
                    currentIssue={currentIssue(
                      remoteState.issues,
                      callState.currentIssueId
                    )}
                  />
                )}
              </userStateContext.Consumer>
              <div className="layout">
                <aside id="nav" role="contentinfo" className="layout__side">
                  <div className="issues">
                    <SidebarHeader />
                    <Sidebar
                      issues={remoteState.issues}
                      currentIssue={currentIssue(
                        remoteState.issues,
                        callState.currentIssueId
                      )}
                      completedIssueIds={callState.completedIssueIds}
                    />
                  </div>
                </aside>
                <main
                  id="content"
                  role="main"
                  aria-live="polite"
                  className="layout__main"
                >
                  {props.children}
                </main>
              </div>
              {props.extraComponent}
              <Footer />
            </>
          )}
        </callStateContext.Consumer>
      </>
    )}
  </remoteStateContext.Consumer>
);

export default Layout;
