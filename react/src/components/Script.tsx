import React, { createRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Contact } from '../common/models/contact';

import { LocationState, WithLocationProps } from '../state/locationState';
import { withLocation } from '../state/stateProvider';
import * as Constants from '../common/constants';
import { getCustomizedScripts, CustomizedScriptsResponse } from '../utils/api';

interface State {
  scriptMarkdown: string;
  currentContact?: Contact;
  requiredState?: string;
  customizedScripts?: CustomizedScriptsResponse;
  issueId?: string;
}

// Replacement regexes, ideally standardize copy to avoid complex regexs
const titleReg = /\[REP\/SEN NAME\]|\[SENATOR\/REP NAME\]/gi;
const locationReg = /\[CITY,\s?ZIP\]|\[CITY,\s?STATE\]/gi;

class Script extends React.Component<WithLocationProps, State> {
  state: State = { scriptMarkdown: '' };
  scriptRef = createRef<HTMLSpanElement>();

  getContactNameWithTitle = (contact: Contact) => {
    let title = '';
    switch (contact.area) {
      case 'US House':
      case 'House':
        title = 'Rep. ';
        break;
      case 'US Senate':
      case 'Senate':
        title = 'Senator ';
        break;
      case 'StateLower':
      case 'StateUpper':
        title = 'Legislator ';
        break;
      case 'Governor':
        title = 'Governor ';
        break;
      case 'AttorneysGeneral':
        title = 'Attorney General ';
        break;
      case 'SecretaryOfState':
        title = 'Secretary of State ';
        break;
      default:
        title = '';
    }
    return title + contact.name;
  };

  scriptFormat = (
    script: string,
    locationState: LocationState | undefined,
    contact: Contact | undefined
  ) => {
    const location = locationState?.cachedCity;
    if (location) {
      script = script.replace(locationReg, location);
    }

    if (contact) {
      const title = this.getContactNameWithTitle(contact);
      script = script.replace(titleReg, title);
    }

    return script;
  };

  componentDidMount() {
    let scriptMarkdown = '';
    let requiredState: string | undefined = undefined;
    let issueId: string | undefined = undefined;
    if (this.scriptRef.current?.parentElement) {
      scriptMarkdown =
        this.scriptRef.current.parentElement.dataset.scriptMarkdown ?? '';
      requiredState =
        this.scriptRef.current.parentElement.dataset.requiredState;
      issueId = this.scriptRef.current.parentElement.dataset.issueId;

      this.setState({ scriptMarkdown, requiredState, issueId });
    }

    document.addEventListener(Constants.CUSTOM_EVENTS.ACTIVE_CONTACT, (e) => {
      const contact = (e as CustomEvent).detail as Contact;
      this.setState({ currentContact: contact });
    });

    document.addEventListener(Constants.CUSTOM_EVENTS.LOADED_REPS, (e) => {
      const contactIds = (e as CustomEvent).detail as string[];
      this.fetchCustomizedScripts(contactIds);
    });
  }

  fetchCustomizedScripts = async (contactIds: string[]) => {
    if (!this.state.issueId && !this.props.locationState?.cachedCity) {
      return;
    }

    if (contactIds.length === 0) {
      return;
    }

    try {
      const customizedScripts = await getCustomizedScripts(
        this.state.issueId || '',
        contactIds,
        this.props.locationState?.cachedCity || ''
      );

      this.setState({ customizedScripts });
    } catch (error) {
      console.error('Error fetching customized scripts:', error);
    }
  };

  render() {
    let contact = this.state.currentContact;

    // if the current location does not match the required state, set the contact back to undefined for the script
    if (
      this.state.requiredState &&
      this.state.requiredState !== this.props.locationState?.state
    ) {
      contact = undefined;
    }

    // Use customized script if available for the current contact
    let scriptToDisplay = this.state.scriptMarkdown;
    if (
      contact &&
      this.state.customizedScripts &&
      this.state.customizedScripts[contact.id]
    ) {
      scriptToDisplay = this.state.customizedScripts[contact.id];
    }

    const formattedScriptMarkdown = this.scriptFormat(
      scriptToDisplay,
      this.props.locationState,
      contact
    );

    return (
      <span ref={this.scriptRef}>
        <div
          className={
            formattedScriptMarkdown.length > 0 ? 'contact-content' : ''
          }
        >
          {/* react-markdown is 20kb, we could probably find a lighter one */}
          <ReactMarkdown>{formattedScriptMarkdown}</ReactMarkdown>
        </div>
      </span>
    );
  }
}

export default withLocation(Script);
