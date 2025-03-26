import React, { createRef } from 'react';

interface State {
  outcomes: string[];
  showReps: boolean;
}

class Outcomes extends React.Component<null, State> {
  _defaultOutcomes: string[] = [];
  state = {
    outcomes: this._defaultOutcomes,
    showReps: false
  };

  outcomesRef = createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.outcomesRef.current && this.outcomesRef.current.parentElement) {
      const outcomes = (
        this.outcomesRef.current.parentElement.dataset.outcomes ?? ''
      ).split(',');
      this.setState({ outcomes });
    }

    document.addEventListener('loadedReps', () => {
      this.setState({ showReps: true });
    });
  }

  next(outcome: string) {
    const event = new CustomEvent('nextContact', { detail: outcome });
    document.dispatchEvent(event);
  }

  render() {
    if (!this.state.showReps) {
      // this has to be a real element, not a fragment, because we need a reference to it
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

export default Outcomes;
