import * as React from 'react';
import i18n from '../../services/i18n';
import { isEqual } from 'lodash';
import { translate } from 'react-i18next';
import { Issue, Contact } from '../../common/model';
import { CallHeaderTranslatable, ContactDetails, Outcomes,
  ScriptTranslatable, NoContactSplitDistrict, IssueLink } from './index';
import { CallState } from '../../redux/callState';
import { locationStateContext, userStateContext } from '../../contexts';
import { eventContext } from '../../contexts/EventContext';

// This defines the props that we must pass into this component.
export interface Props {
  issue: Issue;
  callState: CallState;
}

export interface State {
  issue: Issue;
  currentContact: Contact | undefined;
  currentContactIndex: number;
  numberContactsLeft: number;
}

export class Call extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // set initial state
    this.state = this.setStateFromProps(props);
  }

  /**
   * Set state from props when props
   * are initialized or refreshed
   *
   * @param {Props} props
   * @returns {State}
   */
  setStateFromProps(props: Props): State {

    let currentContactIndex = 0;
    if (props.issue && props.callState.contactIndexes && props.callState.contactIndexes[props.issue.slug]) {
      currentContactIndex = props.callState.contactIndexes[props.issue.slug];
    }

    const currentContact = (props.issue && props.issue.contacts
      ? props.issue.contacts[currentContactIndex]
      : undefined);
    const numberContactsLeft = props.issue && props.issue.contacts
      ? props.issue.contacts.length - (currentContactIndex + 1)
      : 0;

    return {
      currentContact: currentContact,
      currentContactIndex: currentContactIndex,
      numberContactsLeft: numberContactsLeft,
      issue: props.issue
    };
  }

  componentDidUpdate(prevProps: Props) {

    if (!isEqual(prevProps, this.props)) {
      this.setState(this.setStateFromProps(this.props));
    }
  }

  // this should obviously be somewhere on issue but as an interface and not a class I don't know where...
  // split district as we define it now applies to house reps, not state level. This helps us ignore it if
  // reps are only Senate or only State level
  hasHouseReps(issue: Issue | undefined): boolean {
    let hasHouseRep = false;

    if (issue && issue.contacts) {
      issue.contacts.forEach(contact => {
        if (contact.area === 'US House') {
          hasHouseRep = true;
        }
      });
    }

    return hasHouseRep;
  }

  // use this to get split district scenarios
  missingContacts(issue: Issue | undefined): boolean {
    let missingContacts = false;

    if (issue && issue.contactAreas) {
      issue.contactAreas.forEach(area => {
        let foundArea = false;

        // skip other contacts, these are non-rep types
        if (area === 'Other') {
          return;
        }

        if (issue.contacts) {
          issue.contacts.forEach(contact => {
            if (contact.area === area) {
              foundArea = true;
            }
          });
        }

        if (foundArea === false) {
          missingContacts = true;
        }
      });
    }

    return missingContacts;
  }

  render() {
    return (
      <locationStateContext.Consumer>
      { locationState =>
        <section className="call">
          <CallHeaderTranslatable
            invalidAddress={locationState.invalidAddress}
            currentIssue={this.state.issue}
          />
          {this.missingContacts(this.props.issue) ?
          <NoContactSplitDistrict
            splitDistrict={locationState.splitDistrict}
          /> :
          <ContactDetails
            currentIssue={this.state.issue}
            contactIndex={this.state.currentContactIndex}
          />}
          <IssueLink
            issue={this.state.issue}
          />
          <ScriptTranslatable
            issue={this.state.issue}
            contactIndex={this.state.currentContactIndex}
            locationState={locationState}
          />
          { this.missingContacts(this.props.issue) ? <span/> :
          <userStateContext.Consumer>
            {userState =>
              <eventContext.Consumer>
                {eventManager =>
                  <Outcomes
                    currentIssue={this.state.issue}
                    userState={userState}
                    eventEmitter={eventManager.ee}
                    numberContactsLeft={this.state.numberContactsLeft}
                    currentContactId={(this.state.currentContact ? this.state.currentContact.id : '')}
                  />                
                }
              </eventContext.Consumer>
            }
          </userStateContext.Consumer>
}
          {/* TODO: Fix people/person text for 1 contact left. Move logic to a function */}
          { this.missingContacts(this.props.issue) ? <span/> :
          this.state.numberContactsLeft > 0 ?
            <h3 aria-live="polite" className="call__contacts__left" >
              {i18n.t('outcomes.contactsLeft', { contactsRemaining: this.state.numberContactsLeft })}
            </h3> : ''
          }
        </section>
      }
      </locationStateContext.Consumer>
    );
  }
}

export const CallTranslatable = translate()(Call);
