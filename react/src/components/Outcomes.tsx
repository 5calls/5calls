import React from "react";
import ReactDOM from "react-dom";

interface Props {}
interface State {
  outcomes: string[];
}

class Outcomes extends React.Component<Props, State> {
  _defaultOutcomes: string[] = [];
  state = {
    outcomes: this._defaultOutcomes,
  };

  componentDidMount() {
    const thisComponent = ReactDOM.findDOMNode(this);
    if (thisComponent && thisComponent.parentElement) {
      const outcomes = (thisComponent.parentElement.dataset.outcomes ?? "").split(",");
      this.setState({ outcomes });
    }
  }

  next(outcome: string) {
    const event = new CustomEvent("nextContact", { detail: outcome });
    document.dispatchEvent(event);
  }

  render() {
    return (
      <div className="outcomes">
        <h3>Select your call result to show the next representative:</h3>
        <div className="outcomes-items">
          {this.state.outcomes.map((outcome) => {
            return <button onClick={() => this.next(outcome)}>{outcome}</button>;
          })}
        </div>
      </div>
    );
  }
}

export default Outcomes;
