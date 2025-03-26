import React from 'react';
import OneSignal from 'react-onesignal';
import Input, { isValidPhoneNumber } from 'react-phone-number-input/input';

interface State {
  phone: string;
  validPhone: boolean;
  submitted: boolean;
}

class PhoneSubscribe extends React.Component<null, State> {
  state = {
    phone: '',
    validPhone: false,
    submitted: false,
  };

  render(): React.ReactNode {
    if (this.state.submitted) {
      return (
        <React.Fragment>
          <p>
            <strong>Subscribed!</strong>
          </p>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Input
            country="US"
            placeholder="Phone number"
            onChange={(phoneValue) => {
              this.setState({
                validPhone: phoneValue ? isValidPhoneNumber(phoneValue) : false,
                phone: phoneValue ? phoneValue : '',
              });
            }}
          />
          <button
            className="plausible-event-name=phone-subscribe"
            disabled={!this.state.validPhone}
            onClick={() => {
              OneSignal.setSMSNumber(this.state.phone).then(() => {
                this.setState({ submitted: true });
              });
            }}
          >
            Subscribe
          </button>
        </React.Fragment>
      );
    }
  }
}

export default PhoneSubscribe;
