import React from "react";

import { Contact } from "../common/models/contact";
import contactUtils from "../utils/contactUtils";

interface Props {
  contact: Contact;
}

export interface State {
  showFieldOfficeNumbers: boolean;
}

export class LocalNumbers extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { showFieldOfficeNumbers: false };
  }

  showField = () => {
    this.setState({ showFieldOfficeNumbers: true });
  };

  // this component is reused and the local state is maintained through contact changes,
  // we want the local state to reset when it's updated
  componentWillReceiveProps(nextProps: Props) {
    if (this.props.contact !== nextProps.contact) {
      this.setState({ showFieldOfficeNumbers: false });
    }
  }

  render() {
    if (this.props.contact.field_offices == null || this.props.contact.field_offices.length === 0) {
      return <span />;
    }

    if (this.state.showFieldOfficeNumbers) {
      return (
        <div className="contact-local-numbers">
          <h3>Local office numbers:</h3>
          <ul>
            {this.props.contact.field_offices ? (
              this.props.contact.field_offices.map((office) => (
                <li key={office.phone}>
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
    } else {
      return (
        <div className="contact-local-numbers">
          <p>
            <a onClick={this.showField}>Or call a local office</a>
          </p>
        </div>
      );
    }
  }
}

export default LocalNumbers;
