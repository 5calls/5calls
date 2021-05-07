import React from "react";
import ReactDOM from "react-dom";

import { Contact } from "../common/models/contact";
import { OutcomeData } from "../common/models/contactEvent";
import { ContactList } from "../common/models/contactList";
import { WithCompletedProps } from "../state/completedState";
import { WithLocationProps } from "../state/locationState";
import { withCompleted, withLocation } from "../state/stateProvider";
import { getContacts, postOutcomeData } from "../utils/api";
import ContactUtils from "../utils/contactUtils";
import ActiveContact from "./ActiveContact";

interface Props {}
interface State {
  areas: string[];
  issueId: string;
  contactList: ContactList | undefined;
  activeContactIndex: number;
}

class Reps extends React.Component<Props & WithLocationProps & WithCompletedProps, State> {
  _defaultAreas: string[] = [];
  _defaultContactList: ContactList | undefined = undefined;
  state = {
    areas: this._defaultAreas,
    issueId: "0000",
    contactList: this._defaultContactList,
    activeContactIndex: 0,
  };

  componentDidMount() {
    let areaString = "";

    const thisComponent = ReactDOM.findDOMNode(this);
    if (thisComponent && thisComponent.parentElement) {
      areaString = thisComponent.parentElement.dataset.repAreas ?? "";
      const areas = areaString.split(",");
      const issueId = thisComponent.parentElement.dataset.issueId ?? "";
      this.setState({ areas, issueId });
    }

    if (!this.state.contactList) {
      // if we don't have contacts, fetch the contacts
      this.updateContacts(areaString);
    }

    document.addEventListener("nextContact", (e) => {
      const outcome: string = (e as CustomEvent).detail;

      const contacts = this.contactsForArea(this.state.areas, this.state.contactList ?? ({} as ContactList));

      if (outcome !== "skip") {
        const viaParameter = window.location.host === "5calls.org" ? "web" : "test";

        let currentContact: Contact | undefined;
        if (contacts.length >= this.state.activeContactIndex) {
          currentContact = contacts[this.state.activeContactIndex];
        }

        const outcomeData: OutcomeData = {
          outcome: outcome,
          issueId: this.state.issueId,
          contactId: currentContact?.id ?? "no-contact-id",
          via: viaParameter,
        };
        postOutcomeData(outcomeData);
        this.props.setNeedsCompletionFetch(true);
      }

      if (this.state.activeContactIndex < contacts.length - 1) {
        let activeContactIndex = this.state.activeContactIndex + 1;
        this.setState({ activeContactIndex });
        this.reportUpdatedActiveContact(contacts[activeContactIndex]);
        document
          .getElementById("reps-header")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      } else {
        if (window.location.host.indexOf("localhost") === -1) {
          window.location.pathname = window.location.pathname + "/done/";
        } else {
          // if we're testing, refresh
          window.location.reload();
        }
      }
    });
  }

  componentDidUpdate(prevProps: Props & WithLocationProps) {
    if (prevProps.locationState?.address !== this.props.locationState?.address) {
      this.updateContacts(this.state.areas.join(","));
    }
  }

  reportUpdatedActiveContact(contact: Contact) {
    // yuck, I don't have a good way to sync state across different-root components yet
    // so script component just listens to this
    const activeContactEvent = new CustomEvent("activeContact", { detail: contact });
    document.dispatchEvent(activeContactEvent);
  }

  updateContacts(areas: string = "") {
    if (this.props.locationState) {
      getContacts(this.props.locationState.address, areas)
        .then((contactList) => {
          this.setState({ activeContactIndex: 0, contactList });
          const contacts = this.contactsForArea(this.state.areas, contactList);
          if (contacts.length > 0) {
            // start our script component with an active contact
            this.reportUpdatedActiveContact(contacts[0]);
            // report that reps loaded for outcomes to load
            const loadedRepsEvent = new CustomEvent("loadedReps", { detail: true });
            document.dispatchEvent(loadedRepsEvent);
          }
        })
        .catch((error) => {
          // love 2 use any types in js
          if (error && error.response && error.response.data && error.response.data.error) {
            if (`${error.response.data.error}` === "no district found for local reps") {
              document.dispatchEvent(new CustomEvent("outsideLocalArea"));
            }
          }

          // we never previously unloaded reps if a local changed and came back with an error
          this.setState({ contactList: undefined });
          const loadedRepsEvent = new CustomEvent("loadedReps", { detail: false });
          document.dispatchEvent(loadedRepsEvent);
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
    let photoURL = "/images/no-rep.png";
    if (contact.photoURL && contact.photoURL !== "") {
      photoURL = contact.photoURL ?? "/images/no-rep.png";
    }

    return (
      <li className={index === activeIndex ? "active" : ""} key={contact.id}>
        <img
          alt={contact.name}
          src={photoURL}
          onError={(e) => {
            e.currentTarget.src = "/images/no-rep.png";
          }}
        />
        <h4>
          {contact.name} {contact.area !== "Local" && `(${ContactUtils.partyAndState(contact)})`}
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

export default withLocation(withCompleted(Reps));
