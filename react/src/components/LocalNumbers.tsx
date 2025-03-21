import React from "react";

import { Contact } from "../common/models/contact";
import contactUtils from "../utils/contactUtils";

interface Props {
  contact: Contact;
}


export class LocalNumbers extends React.Component<Props> {
  render() {
    if (this.props.contact.field_offices == null || this.props.contact.field_offices.length === 0) {
      return <span />;
    }

    return (
      <div className="contact-local-numbers">
        <h3>Local office numbers:</h3>
        <ul>
          {this.props.contact.field_offices ? (
            this.props.contact.field_offices.map((office, index) => (
              <li key={`${this.props.contact.id}-${office.phone}-${index}`}>
                {contactUtils.makePhoneLink(office.phone)}
                {contactUtils.cityFormat(office, this.props.contact)}
              </li>
            ))
          ) : (
            <span />
          )}
        </ul>
      </div>
    );
  }
}

export default LocalNumbers;
