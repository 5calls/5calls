import * as React from 'react';

import { OutcomeButton } from '../../common/model';

export interface Props {
  readonly onNextContact: (outcome: string) => void;
}

export interface State {
  outcomeState?: string;
  hasInsuranceState?: string;
  scheduledState?: string;
}

const outcomeButtons: OutcomeButton[] = [
  {title: 'Contacted', emoji: '😀', key: 'contacted'},
  {title: 'Not Available / VM', emoji: '😕', key: 'nothome'},
  {title: 'Refused', emoji: '🤐', key: 'refused'},
  {title: 'Out of Service', emoji: '📵', key: 'disconnected'},
  {title: 'Wrong Number', emoji: '👽', key: 'wrongnumber'},
];

export default class ACAOutcomes extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="call__outcomes">
        <h3 className="call__outcomes__header">
          How did the call go?
        </h3>
        <div className="call__outcomes__items">
          {outcomeButtons.map((button) =>
            <button
              key={button.key}
              onClick={(e) => this.setOutcome(e, button.key)}
              className={this.buttonClass(button.key)}
            >
              {button.title}<br/>{button.emoji}
            </button>
          )}
        </div>
        <h3 className="call__outcomes__header">
          If contacted: Did they have insurance?    
        </h3>
        {this.insuranceButtons()}
        <h3 className="call__outcomes__header">
          If not insured: Were you able to schedule them via the Connector Tool?    
        </h3>
        {this.scheduledButtons()}
        <h3 className="call__outcomes__header">
          Done? Move on to the next person           
        </h3>
        {this.nextButton()}
      </div>
    );
  }

  buttonClass(key: string) {
    if (this.state.outcomeState && this.state.outcomeState === key) {
      return 'selected';
    }

    if (this.state.hasInsuranceState && this.state.hasInsuranceState === key) {
      return 'selected';
    }

    if (this.state.scheduledState && this.state.scheduledState === key) {
      return 'selected';
    }

    return '';
  }

  nextButton() {
    if (this.nextEnabled()) {
      return (
        <div className="call__outcomes__items">
          <button onClick={(e) => this.nextContact(e)}>Next Contact ➡️</button>
        </div>
      );
    }

    return (
      <div className="call__outcomes__items disabled">
        <button disabled={true}>Next Contact ➡️</button>
      </div>
    );
  }

  nextEnabled(): Boolean {
    // anything other than contacted
    if (this.state.outcomeState && this.state.outcomeState !== 'contacted') {
      return true;
    }

    if (this.state.outcomeState && this.state.outcomeState === 'contacted' &&
        this.state.hasInsuranceState &&
        (this.state.scheduledState || this.state.hasInsuranceState === 'insured')) {
      return true;
    }

    return false;
  }

  // has insurance buttons

  insuranceButtons() {
    const buttons: OutcomeButton[] = [
      {title: 'Has Insurance', emoji: '🎉', key: 'insured'},
      {title: 'No Insurance', emoji: '🤒', key: 'noinsurance'},
    ];

    if (this.insuranceButtonsEnabled()) {
      return (
      <div className="call__outcomes__items call__outcomes__support">
        {buttons.map((button, index) => 
          <button key={index} onClick={(e) => this.setInsured(e, button.key)} className={this.buttonClass(button.key)}>
            {button.title}<br/>{button.emoji}
          </button>
        )}
      </div>
      );
    }

    return (
      <div className="call__outcomes__items call__outcomes__support disabled">
        {buttons.map((button, index) => 
          <button key={index} disabled={true}>{button.title}<br/>{button.emoji}</button>
        )}
      </div>
    );
  }

  insuranceButtonsEnabled(): Boolean {
    if (this.state.outcomeState && this.state.outcomeState === 'contacted') {
      return true;
    }

    return false;
  }

  // scheduled buttons

  scheduledButtons() {
    const buttons: OutcomeButton[] = [
      {title: 'Yes, Scheduled', emoji: '📆', key: 'scheduled'},
      {title: 'No, Couldn\'t Schedule', emoji: '🤷‍♂️', key: 'notscheduled'},
    ];

    if (this.scheduledButtonsEnabled()) {
      return (
      <div className="call__outcomes__items call__outcomes__support">
        {buttons.map((button, index) => 
          <button
            key={index}
            onClick={(e) => this.setScheduled(e, button.key)}
            className={this.buttonClass(button.key)}
          >
            {button.title}<br/>{button.emoji}
          </button>
        )}
      </div>
      );
    }

    return (
      <div className="call__outcomes__items call__outcomes__support disabled">
        {buttons.map((button, index) => 
          <button key={index} disabled={true}>{button.title}<br/>{button.emoji}</button>
        )}
      </div>
    );
  }

  scheduledButtonsEnabled(): Boolean {
    if (this.state.outcomeState && this.state.outcomeState === 'contacted' &&
        this.state.hasInsuranceState && this.state.hasInsuranceState === 'noinsurance') {
      return true;
    }

    return false;
  }

  // Submit data to parent

  nextContact(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();

    let outcomeState = '';
    if (this.state.outcomeState) {
      outcomeState += this.state.outcomeState;

      if (this.state.hasInsuranceState) {
        outcomeState += ':' + this.state.hasInsuranceState;

        if (this.state.scheduledState) {
          outcomeState += ':' + this.state.scheduledState;
        }  
      }
    }

    this.props.onNextContact(outcomeState);
  }

  // Helpers for setting state from button clicks
  
  setOutcome(e: React.MouseEvent<HTMLButtonElement>, outcome: string) {
    e.currentTarget.blur();

    if (outcome !== '') {
      this.setState({ outcomeState: outcome });
    }
  }

  setInsured(e: React.MouseEvent<HTMLButtonElement>, outcome: string) {
    e.currentTarget.blur();

    if (outcome !== '') {
      this.setState({ hasInsuranceState: outcome });
    }
  }

  setScheduled(e: React.MouseEvent<HTMLButtonElement>, outcome: string) {
    e.currentTarget.blur();

    if (outcome !== '') {
      this.setState({ scheduledState: outcome });
    }
  }
}