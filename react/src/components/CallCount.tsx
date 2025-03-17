import React from "react";
import { getCountData } from "../utils/api";

interface Props {}
interface State {
  callCount: number;
}

class CallCount extends React.Component<Props, State> {
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
      return <span>We've made {this.state.callCount.toLocaleString()} calls so far. Join&nbsp;us.</span>
    } else {
      return <span>We've made more than 7 million calls so far. Join&nbsp;us.</span>
    }
  }
}

export default CallCount;
