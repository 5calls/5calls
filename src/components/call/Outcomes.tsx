import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import EventEmitter = require('wolfy87-eventemitter');

import { submitOutcome } from '../../redux/callState';
import { store } from '../../redux/store';
import { Issue } from '../../common/models';
import { UserState } from '../../redux/userState';
import { Mixpanel } from '../../services/mixpanel';

interface Props {
  readonly currentIssue: Issue;
  readonly userState: UserState;
  readonly eventEmitter: EventEmitter;
  readonly currentContactId: string;
  readonly numberContactsLeft: number;
}
interface State {}

class Outcomes extends React.Component<
  Props & RouteComponentProps<any>, // tslint:disable-line:no-any
  State
> {
  dispatchOutcome(e: React.MouseEvent<HTMLButtonElement>, outcome: string) {
    e.currentTarget.blur();

    Mixpanel.people.increment({
      call: 1,
      outcome: 1
    });

    // tslint:disable-next-line:no-any
    store.dispatch<any>(
      submitOutcome({
        outcome: outcome,
        numberContactsLeft: this.props.numberContactsLeft,
        issueId: this.props.currentIssue.id.toString(),
        contactId: this.props.currentContactId
      })
    );

    // navigate to /done when finished
    if (this.props.numberContactsLeft <= 0 && this.props.history) {
      // it feels like this history push should be further up (maybe in onsubmitoutcome?)
      this.props.history.push(`/done/${this.props.currentIssue.slugOrID()}`);

      window.scroll(1, 1);
    } else {
      // scroll to the contact element
      const contact = document.getElementById('contact');
      const yOffset = contact
        ? contact.getBoundingClientRect().top * -1 + 200
        : 1;
      window.scroll(1, yOffset);
    }

    return true;
  }

  showLogin(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    this.props.eventEmitter.emitEvent('showLogin');
    window.scroll(1, 1);
  }

  render() {
    if (this.props.currentIssue) {
      if (this.props.currentIssue.contactType === 'ACTION') {
        if (this.props.userState.profile) {
          return (
            <div className="call__outcomes">
              <div className="call__outcomes__items">
                <button onClick={e => this.dispatchOutcome(e, 'completed')}>
                  I Did It!
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <span>
              <section className="loading">
                <h2>
                  <a href="#" onClick={e => this.showLogin(e)}>
                    Log in
                  </a>{' '}
                  to participate in the challenge 📊
                </h2>
                <p>
                  Your current call total will be saved to your 5 Calls profile
                </p>
              </section>
              <div className="call__outcomes preview">
                <div className="call__outcomes__items">
                  <button>I Did It!</button>
                </div>
              </div>
            </span>
          );
        }
      } else {
        return (
          <div className="call__outcomes">
            <h3 className="call__outcomes__header">
              Select your call result to show the next representative:
            </h3>{' '}
            <div className="call__outcomes__items">
              {this.props.currentIssue.outcomeModels.map((outcome, index) => (
                <button
                  className="btn btn-secondary"
                  key={index}
                  onClick={e => this.dispatchOutcome(e, outcome.label)}
                >
                  {outcome.label}
                </button>
              ))}
            </div>
          </div>
        );
      }
    } else {
      return <span />;
    }
  }
}

export default withRouter(Outcomes);
