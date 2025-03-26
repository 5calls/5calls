import React from 'react';
import { postAPIEmail } from '../utils/api';
import { AxiosError } from 'axios';

interface State {
  emailSent: boolean;
  email: string;
  errorText: string;
}

class APIForm extends React.Component<null, State> {
  state = {
    emailSent: false,
    email: '',
    errorText: '',
  };

  sendForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    postAPIEmail(this.state.email)
      .then(() => {
        this.setState({ emailSent: true });
      })
      .catch((error) => {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          this.setState({ errorText: axiosError.response.data.error });
        } else {
          this.setState({ errorText: 'could not submit email' });
        }
      });
  }

  updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: e.target.value });
  };

  render(): React.ReactNode {
    if (!this.state.emailSent) {
      return (
        <form onSubmit={(e) => this.sendForm(e)}>
          {this.state.errorText !== '' ? (
            <p className="a-ctr error">{this.state.errorText}</p>
          ) : (
            <></>
          )}
          <input
            className="a-ctr token-email"
            onChange={this.updateEmailAddress}
            placeholder="email@example.com"
            type="email"
          />
          <p className="a-ctr">
            <button className="button">Get your API Key</button>
          </p>
        </form>
      );
    } else {
      return (
        <p className="a-ctr">
          <strong>Thanks! Check your inbox shortly</strong>
        </p>
      );
    }
  }
}

export default APIForm;
