import React from "react";
import ReactDOM from "react-dom";

import { Contact } from "../common/models/contact";
import { ContactList } from "../common/models/contactList";
import { WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";
import { getContacts } from "../utils/api";
import ContactUtils from "../utils/contactUtils";

interface Props {}
interface State {
  areas: string[];
  contactList: ContactList | undefined;
  activeContactIndex: number;
}

class Reps extends React.Component<Props & WithLocationProps, State> {
  _defaultAreas: string[] = [];
  _defaultContactList: ContactList | undefined = undefined;
  state = {
    areas: this._defaultAreas,
    contactList: this._defaultContactList,
    activeContactIndex: 0,
  };

  componentDidMount() {
    const thisComponent = ReactDOM.findDOMNode(this);
    if (thisComponent && thisComponent.parentElement) {
      const areas = (thisComponent.parentElement.dataset.repAreas ?? "").split(",");
      this.setState({ areas });
    }

    if (!this.state.contactList) {
      // if we don't have contacts, fetch the contacts
      this.updateContacts();
    }

    document.addEventListener("nextContact", (e) => {
      console.log("got event with ", (e as CustomEvent).detail);
      const contacts = this.contactsForArea(this.state.areas);
      if (this.state.activeContactIndex < contacts.length - 1) {
        let activeContactIndex = this.state.activeContactIndex + 1;
        this.setState({ activeContactIndex });
      } else {
        // TODO: done page
      }
    });
  }

  componentDidUpdate(prevProps: Props & WithLocationProps) {
    if (prevProps.locationState?.address !== this.props.locationState?.address) {
      this.updateContacts();
    }
  }

  updateContacts() {
    if (this.props.locationState) {
      getContacts(this.props.locationState.address)
        .then((contactList) => {
          this.setState({ contactList });
        })
        .catch((error) => {
          console.log("error getting reps:", error);
        });
    }
  }

  contactsForArea(areas: string[]): Contact[] {
    let contacts: Contact[] = [];

    if (this.state.contactList) {
      contacts = ContactUtils.allContacts(this.state.contactList).filter((contact) => {
        for (const area of this.state.areas) {
          if (area === contact.area) {
            return true;
          }
        }
        return false;
      });
    }

    return contacts;
  }

  contactComponent(contact: Contact, index: number, activeIndex: number): JSX.Element {
    return (
      <li className={index == activeIndex ? "active" : ""} key={contact.id}>
        <img alt={contact.name} src={contact.photoURL} />
        <h4>
          {contact.name} ({ContactUtils.partyAndState(contact)})
        </h4>
        <p>{contact.reason}</p>
      </li>
    );
  }

  render() {
    if (!this.state.contactList && !this.props.locationState?.address) {
      return (
        <ul>
          <li>
            <img alt="No representative found" src="/images/no-rep.png" />
            <h4>No reps available</h4>
            <p>Please set your location to find your representatives</p>
          </li>
        </ul>
      );
    }

    const contacts = this.contactsForArea(this.state.areas);
    let activeContact: Contact | undefined;
    if (contacts.length > 0) {
      activeContact = contacts[this.state.activeContactIndex];
    }

    return (
      <>
        <ul>
          {contacts.map((contact, index) => this.contactComponent(contact, index, this.state.activeContactIndex))}
        </ul>
        {activeContact && <div>active contact is {activeContact.name}</div>}
      </>
    );
  }
}

export default withLocation(Reps);
