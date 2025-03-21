import React from "react";

import { Contact } from "../common/models/contact";
import contactUtils from "../utils/contactUtils";
import LocalNumbers from "./LocalNumbers";

interface Props {
  contact: Contact;
}

class ActiveContact extends React.Component<Props> {
  render() {
    let photoURL = "/images/no-rep.png";
    if (this.props.contact.photoURL && this.props.contact.photoURL !== "") {
      photoURL = this.props.contact.photoURL;
    }

    return (
      <div className="contact">
        <div className="contact-image">
          <img
            alt={this.props.contact.name}
            src={photoURL}
            onError={(e) => {
              e.currentTarget.src = "/images/no-rep.png";
            }}
          />
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
