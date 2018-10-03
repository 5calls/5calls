import * as React from 'react';

import i18n from '../../services/i18n';
import * as ReactMarkdown from 'react-markdown';

import { Issue, VoterContact } from '../../common/model';
import { CallHeaderTranslatable, SupportOutcomes, ACAOutcomes } from './index';
import {
  submitOutcome,
} from '../../redux/callState';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';
import { locationStateContext } from '../../contexts';

// This defines the props that we must pass into this component.
export interface Props {
  issue: Issue;
}

export interface State {
  issue: Issue;
  currentContact?: VoterContact;
  checkedForContact: boolean;
}

export default class FetchCall extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.setStateFromProps(props);
  }

  setStateFromProps(props: Props): State {
    return {
      checkedForContact: false,
      issue: props.issue
    };
  }

  componentDidMount() {
    queueUntilRehydration(() => {
      this.fillContact();
    });
  }

  fillContact() {
    // getNextContact(this.props.issue.id).then((contacts: VoterContact[]) => {
    //   let contact: VoterContact | undefined = undefined;
    //   if (contacts.length === 1) {
    //     contact = contacts[0];
    //   }
    //   this.setState({
    //     currentContact: contact,
    //     checkedForContact: true
    //   });
    // });
  }

  componentWillReceiveProps(newProps: Props) {
    this.setState(this.setStateFromProps(newProps));
  }

  nextContact(outcome: string) {
    submitOutcome({
      outcome: outcome,
      numberContactsLeft: 0,
      issueId: this.props.issue.id,
      contactId: this.state.currentContact ? this.state.currentContact.id : 'none',
    });
    this.setState({ currentContact: undefined, checkedForContact: false });
    this.fillContact();
  }

  formatScript(script: string, contact: VoterContact): string {
    const nameReg = /\[NAME\]/gi;

    return script.replace(nameReg, '**' + contact.name + '**');
  }

  contactArea() {
    if (this.state.currentContact) {
      return (
        <div>
          <div className="call__contact" id="contact">
            {/* <div className="call__contact__image"><img alt="" src="" /></div> */}
            <h3 className="call__contact__type">{i18n.t('contact.callThisOffice')}</h3>
            <p className="call__contact__name">
              {this.state.currentContact.name} <span>from</span> {this.state.currentContact.location}
            </p>
            <p className="call__contact__phone">
              <a href={`tel:${this.state.currentContact.phone}`}>{this.state.currentContact.phone}</a>
            </p>
          </div>
          <h3 className="call__script__header">{i18n.t('script.yourScript')}</h3>
          <div className="call__script__body">
            <ReactMarkdown source={this.formatScript(this.props.issue.script, this.state.currentContact)}/>
          </div>
          { this.props.issue.id === '51' ?
            <ACAOutcomes
              onNextContact={(outcome) => this.nextContact(outcome)}
            />
            :
            <SupportOutcomes
              onNextContact={(outcome) => this.nextContact(outcome)}
            />
          }
        </div>
      );
    }

    if (!this.state.checkedForContact) {
      return <h3 className="call__outcomes__header">Getting your next contact...</h3>;
    } else {
      return (
        <blockquote>
          <h2 className="call__outcomes__header">All done for today!</h2>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>Looks like we're all out of calls to make for today, or we're outside of normal calling hours (9am-9pm in the local time zone). Come back tomorrow for more calls!</p>
        </blockquote>
      );
    }
  }

  render() {
    return (
      <locationStateContext.Consumer>
      { location =>
        <section className="call voter">
          <CallHeaderTranslatable
            invalidAddress={location.invalidAddress}
            currentIssue={this.state.issue}
          />
          {this.contactArea()}
        </section>
      }
    </locationStateContext.Consumer>
    );
  }
}
