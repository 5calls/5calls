import React, { createRef } from 'react';
import { WithLocationProps } from '../state/locationState';
import { withLocation } from '../state/stateProvider';
import * as Constants from '../common/constants';

interface State {
  outcomes: string[];
  repsLoaded: boolean;
  requiredState: string;
}

class Outcomes extends React.Component<WithLocationProps, State> {
  _defaultOutcomes: string[] = [];
  state = {
    outcomes: this._defaultOutcomes,
    repsLoaded: false,
    requiredState: ''
  };

  outcomesRef = createRef<HTMLDivElement>();

  componentDidMount() {
    let requiredState = '';
    if (this.outcomesRef.current && this.outcomesRef.current.parentElement) {
      const outcomes = (
        this.outcomesRef.current.parentElement.dataset.outcomes ?? ''
      ).split(',');
      requiredState =
        this.outcomesRef.current.parentElement.dataset.requiredState ?? '';
      this.setState({ outcomes, requiredState });
    }

    // Check if reps are already loaded (handles race condition)
    const repsElement = document.getElementById('react-reps');
    if (repsElement && repsElement.querySelector('.rep-info')) {
      this.setState({ repsLoaded: true });
    }

    document.addEventListener(Constants.CUSTOM_EVENTS.LOADED_REPS, () => {
      this.setState({ repsLoaded: true });
    });
  }

  next(outcome: string) {
    const event = new CustomEvent(Constants.CUSTOM_EVENTS.NEXT_CONTACT, {
      detail: outcome
    });
    document.dispatchEvent(event);
  }

  render() {
    if (!this.state.repsLoaded) {
      // this has to be a real element, not a fragment, because we need a reference to it
      return <div ref={this.outcomesRef}></div>;
    }

    if (
      this.state.requiredState !== '' &&
      this.state.requiredState !== this.props.locationState?.state
    ) {
      return <div ref={this.outcomesRef}></div>;
    }

    return (
      <div ref={this.outcomesRef}>
        <h3>
          After your call, share the result to show the next representative:
        </h3>
        <div className="outcomes-items">
          {this.state.outcomes.map((outcome) => {
            const eventClassName = `plausible-event-name=Outcome-${outcome}`;
            return (
              <button
                className={eventClassName}
                key={outcome}
                onClick={() => this.next(outcome)}
              >
                {outcome}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withLocation(Outcomes);
