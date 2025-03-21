import React from "react";
import { getCountData } from "../utils/api";

interface State {
  callCount: number;
}

class CallCount extends React.Component<null, State> {
  state = {
    callCount: 0,
  };

  componentDidMount() {
    getCountData().then((countData) => {
      this.setState({ callCount: countData.count })
    });
  }

  render(): React.ReactNode {
    if (this.state.callCount > 0) {
      return <span>We&rsquo;ve made {this.state.callCount.toLocaleString()} calls so far. Join&nbsp;us.</span>
    } else {
      return <span>We&rsquo;ve made more than 7 million calls so far. Join&nbsp;us.</span>
    }
  }
}

export default CallCount;
