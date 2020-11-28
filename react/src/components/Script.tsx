import React from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import { Contact } from "../common/models/contact";

import { LocationState, WithLocationProps } from "../state/locationState";
import { withLocation } from "../state/stateProvider";

interface Props {}
interface State {
  scriptMarkdown: string;
}

// Replacement regexes, ideally standardize copy to avoid complex regexs
const titleReg = /\[REP\/SEN NAME\]|\[SENATOR\/REP NAME\]/gi;
const locationReg = /\[CITY,\s?ZIP\]|\[CITY,\s?STATE\]/gi;

class Script extends React.Component<Props & WithLocationProps, State> {
  state = { scriptMarkdown: "" };

  getContactNameWithTitle = (contact: Contact) => {
    let title = "";
    switch (contact.area) {
      case "US House":
      case "House":
        title = "Rep. ";
        break;
      case "US Senate":
      case "Senate":
        title = "Senator ";
        break;
      case "StateLower":
      case "StateUpper":
        title = "Legislator ";
        break;
      case "Governor":
        title = "Governor ";
        break;
      case "AttorneyGeneral":
        title = "Attorney General ";
        break;
      case "SecretaryOfState":
        title = "Secretary of State ";
        break;
      default:
        title = "";
    }
    return title + contact.name;
  };

  scriptFormat = (script: string, locationState: LocationState) => {
    const location = locationState.cachedCity;
    if (location) {
      script = script.replace(locationReg, location);
    }

    // const title = this.getContactNameWithTitle(contact);
    // script = script.replace(titleReg, title);

    return script;
  };

  componentDidMount() {
    const thisComponent = ReactDOM.findDOMNode(this);
    let scriptMarkdown = "";
    if (thisComponent && thisComponent.parentElement) {
      scriptMarkdown = thisComponent.parentElement.dataset.scriptMarkdown ?? "";

      // replace location in script
      if (this.props.locationState) {
        scriptMarkdown = this.scriptFormat(scriptMarkdown, this.props.locationState);
      }

      this.setState({ scriptMarkdown });
    }
  }

  render() {
    return (
      <span>
        <ReactMarkdown>{this.state.scriptMarkdown}</ReactMarkdown>
      </span>
    );
  }
}

export default withLocation(Script);
