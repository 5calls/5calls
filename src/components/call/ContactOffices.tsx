import * as React from 'react';

import { Issue, Contact } from '../../common/models';
import { makePhoneLink, cityFormat } from '../shared/jsxUtils';

interface Props {
  readonly currentIssue: Issue;
  readonly currentContact: Contact;
}

export interface State {
  showFieldOfficeNumbers: boolean;
}

export class ContactOffices extends React.Component<Props, State> {
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
    if (this.props.currentContact !== nextProps.currentContact) {
      this.setState({ showFieldOfficeNumbers: false });
    }
  }

  render() {
    if (
      this.props.currentContact.field_offices == null ||
      this.props.currentContact.field_offices.length === 0
    ) {
      return <span />;
    }

    if (this.state.showFieldOfficeNumbers) {
      return (
        <div>
          <h3 className="call__contact__field-offices__header">
            Local office numbers:
          </h3>
          <ul className="call__contact__field-office-list">
            {this.props.currentContact.field_offices ? (
              this.props.currentContact.field_offices.map(office => (
                <li key={office.phone}>
                  {makePhoneLink(office.phone)}
                  {cityFormat(office, this.props.currentContact)}
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
        <div>
          <p className="call__contact__show-field-offices">
            <a onClick={this.showField}>Or call a local office</a>
          </p>
        </div>
      );
    }
  }
}

export default ContactOffices;
