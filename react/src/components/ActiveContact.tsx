import React from "react";

import { Contact } from "../common/models/contact";
import contactUtils from "../utils/contactUtils";
import LocalNumbers from "./LocalNumbers";

interface Props {
  contact: Contact;
}
interface State {}

class ActiveContact extends React.Component<Props, State> {
  render() {
    return (
      <div className="contact">
        <div className="contact-image">
          <img alt={this.props.contact.name} src={this.props.contact.photoURL} />
        </div>
        <div>
          <h3 className="contact-name">
            {this.props.contact.name} ({contactUtils.partyAndState(this.props.contact)})
          </h3>
          <p className="contact-phone">{contactUtils.makePhoneLink(this.props.contact.phone)}</p>
          <LocalNumbers contact={this.props.contact} />
        </div>
      </div>
    );
  }
}

export default ActiveContact;
