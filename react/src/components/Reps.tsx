import React from "react";
import ReactDOM from "react-dom";

import { Contact } from "../common/models/contact";
import { ContactList } from "../common/models/contactList";
import { WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";
import { getContacts } from "../utils/api";
import ContactUtils from "../utils/contactUtils";
import ActiveContact from "./ActiveContact";

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
      // TODO: send result to server
      console.log("got event with ", (e as CustomEvent).detail);

      const contacts = this.contactsForArea(this.state.areas, this.state.contactList ?? ({} as ContactList));
      if (this.state.activeContactIndex < contacts.length - 1) {
        let activeContactIndex = this.state.activeContactIndex + 1;
        this.setState({ activeContactIndex });
        this.reportUpdatedActiveContact(contacts[activeContactIndex]);
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

  reportUpdatedActiveContact(contact: Contact) {
    // yuck, I don't have a good way to sync state across different-root components yet
    // so script component just listens to this
    const activeContactEvent = new CustomEvent("activeContact", { detail: contact });
    document.dispatchEvent(activeContactEvent);
  }

  updateContacts() {
    if (this.props.locationState) {
      getContacts(this.props.locationState.address)
        .then((contactList) => {
          this.setState({ activeContactIndex: 0, contactList });
          const contacts = this.contactsForArea(this.state.areas, contactList);
          if (contacts.length > 0) {
            // start our script component with an active contact
            this.reportUpdatedActiveContact(contacts[0]);
          }
        })
        .catch((error) => {
          console.log("error getting reps:", error);
        });
    }
  }

  contactsForArea(areas: string[], contactList: ContactList): Contact[] {
    let contacts: Contact[] = [];

    contacts = ContactUtils.allContacts(contactList).filter((contact) => {
      for (const area of this.state.areas) {
        if (area === contact.area) {
          return true;
        }
      }
      return false;
    });

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
    if (!this.state.contactList || !this.props.locationState?.address) {
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

    const contacts = this.contactsForArea(this.state.areas, this.state.contactList);
    let activeContact: Contact | undefined;
    if (contacts.length > 0) {
      activeContact = contacts[this.state.activeContactIndex];
    }

    return (
      <>
        <ul>
          {contacts.map((contact, index) => this.contactComponent(contact, index, this.state.activeContactIndex))}
        </ul>
        {activeContact && <ActiveContact contact={activeContact} />}
      </>
    );
  }
}

export default withLocation(Reps);
