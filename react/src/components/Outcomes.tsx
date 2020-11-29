import React from "react";

interface Props {}

class Outcomes extends React.Component<Props> {
  next() {
    document.dispatchEvent(new Event("nextContact"));
  }

  render() {
    return <button onClick={this.next}>next plz</button>;
  }
}

export default Outcomes;
