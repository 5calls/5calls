import React, { createRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Contact } from '../common/models/contact';

import { LocationState, WithLocationProps } from '../state/locationState';
import { withLocation } from '../state/stateProvider';

interface State {
  scriptMarkdown: string;
  currentContact?: Contact;
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
    locationState: LocationState,
    contact: Contact | undefined
  ) => {
    const location = locationState.cachedCity;
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
    if (this.scriptRef.current?.parentElement) {
      scriptMarkdown =
        this.scriptRef.current.parentElement.dataset.scriptMarkdown ?? '';

      this.setState({ scriptMarkdown });
    }

    document.addEventListener('activeContact', (e) => {
      const contact = (e as CustomEvent).detail as Contact;
      this.setState({ currentContact: contact });
    });
  }

  render() {
    let formattedScriptMarkdown = this.state.currentContact
      ? this.state.scriptMarkdown
      : '';

    if (this.props.locationState && this.state.currentContact) {
      formattedScriptMarkdown = this.scriptFormat(
        formattedScriptMarkdown,
        this.props.locationState,
        this.state.currentContact
      );
    }

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
