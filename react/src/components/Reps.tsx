import React from "react";
import ReactDOM from "react-dom";
import { contact } from "../common/constants";
import { Contact } from "../common/models/contact";
import { ContactList } from "../common/models/contactList";
import { WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";
import { getContacts } from "../utils/api";

interface Props {}
interface State {
  areas: string[];
  contactList: ContactList | undefined;
}

class Reps extends React.Component<Props & WithLocationProps, State> {
  _defaultAreas: string[] = [];
  _defaultContactList: ContactList | undefined = undefined;
  state = {
    areas: this._defaultAreas,
    contactList: this._defaultContactList,
  };

  componentDidMount() {
    const thisComponent = ReactDOM.findDOMNode(this);
    if (thisComponent && thisComponent.parentElement) {
      const areas = (thisComponent.parentElement.dataset.repAreas ?? "").split(",");
      this.setState({ areas });
    }

    if (!this.state.contactList && this.props.locationState?.address) {
      // if we don't have contacts but have an address, fetch the contacts
      getContacts(this.props.locationState.address)
        .then((contactList) => {
          this.setState({ contactList });
        })
        .catch((error) => {
          console.log("error getting reps:", error);
        });
    }
  }

  contactComponent(contact: Contact): JSX.Element {
    console.log("contact component for ", contact.name);
    return (
      <li key={contact.id}>
        <img alt={contact.name} src={contact.photoURL} />
        <h4>{contact.name} (D-CA)</h4>
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

    return (
      <ul>
        {this.state.areas.includes("USSenate") &&
          this.state.contactList?.senateReps().map((contact) => this.contactComponent(contact))}
        {this.state.areas.includes("USHouse") &&
          this.state.contactList?.houseRep().map((contact) => this.contactComponent(contact))}
      </ul>
    );
  }
}

export default withLocation(Reps);
