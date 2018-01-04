import * as React from 'react';

import { OutcomeButton } from '../../common/model';

export interface Props {
  readonly onNextContact: (outcome: string) => void;
}

export interface State {
  outcomeState?: string;
  supportState?: string;
}

export default class SupportOutcomes extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    const outcomeButtons: OutcomeButton[] = [
      {title: 'Contacted', emoji: '😀', key: 'contacted'},
      {title: 'Not Available / VM', emoji: '😕', key: 'nothome'},
      {title: 'Refused', emoji: '🤐', key: 'refused'},
      {title: 'Out of Service', emoji: '📵', key: 'disconnected'},
      {title: 'Wrong Number', emoji: '👽', key: 'wrongnumber'},
    ];
  
    return (
      <div className="call__outcomes">
        <h3 className="call__outcomes__header">
          How did the call go?
        </h3>
        <div className="call__outcomes__items">
          {outcomeButtons.map((button, index) =>
            <button
              key={index}
              onClick={(e) => this.setOutcome(e, button.key)}
              className={this.buttonClass(button.key)}
            >
              {button.title}<br/>{button.emoji}
            </button>
          )}
        </div>
        <h3 className="call__outcomes__header">
          If contacted: do they support Danica? Use your judgment.    
        </h3>
        {this.supportButtons()}
        <h3 className="call__outcomes__header">
          Done? Move on to the next voter           
        </h3>
        {this.nextButton()}
      </div>
    );
  }

  buttonClass(key: string) {
    if (this.state.outcomeState && this.state.outcomeState === key) {
      return 'selected';
    }

    if (this.state.supportState && this.state.supportState === key) {
      return 'selected';
    }

    return '';
  }

  supportButtons() {
    const buttons: OutcomeButton[] = [
      {title: 'Strong Support', emoji: '🎉', key: 'strongsupport'},
      {title: 'Lean Support', emoji: '⭐', key: 'leansupport'},
      {title: 'Undecided', emoji: '🌀', key: 'undecided'},
      {title: 'Lean Opponent', emoji: '😰', key: 'leanopp'},
      {title: 'Strong Opponent', emoji: '🚫', key: 'strongopp'},
      {title: 'Not Voting', emoji: '😡', key: 'novote'},
    ];

    if (this.supportEnabled()) {
      return (
      <div className="call__outcomes__items call__outcomes__support">
        {buttons.map((button, index) => 
          <button key={index} onClick={(e) => this.setSupport(e, button.key)} className={this.buttonClass(button.key)}>
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

  supportEnabled(): Boolean {
    if (this.state.outcomeState && this.state.outcomeState === 'contacted') {
      return true;
    }

    return false;
  }

  setOutcome(e: React.MouseEvent<HTMLButtonElement>, outcome: string) {
    e.currentTarget.blur();

    if (outcome !== '') {
      this.setState({ outcomeState: outcome });
    }
  }

  setSupport(e: React.MouseEvent<HTMLButtonElement>, support: string) {
    e.currentTarget.blur();

    if (support !== '') {
      this.setState({ supportState: support });
    }
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

    // support for contacted
    if (this.state.outcomeState && this.state.outcomeState === 'contacted' && this.state.supportState) {
      return true;
    }

    return false;
  }

  nextContact(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.blur();

    let outcomeState = '';
    if (this.state.outcomeState) {
      outcomeState += this.state.outcomeState;

      if (this.state.supportState) {
        outcomeState += ':' + this.state.supportState;
      }
    }

    this.props.onNextContact(outcomeState);
  }
}