import React from "react";
import ReactDOM from "react-dom";
import { APP_URL } from "../common/constants";

interface Props {}
interface State {
  issueSlug: string;
  issueId: string;
  issueTitle: string;
}

class Share extends React.Component<Props, State> {
  state = {
    issueSlug: "",
    issueId: "",
    issueTitle: "",
  };

  componentDidMount() {
    const thisComponent = ReactDOM.findDOMNode(this);
    if (thisComponent && thisComponent.parentElement) {
      const issueId = thisComponent.parentElement.dataset.issueId ?? "";
      const issueSlug = thisComponent.parentElement.dataset.issueSlug ?? "";
      const issueTitle = thisComponent.parentElement.dataset.issueTitle ?? "";
      this.setState({ issueSlug, issueId, issueTitle });
    }
  }

  share(e: React.MouseEvent<HTMLAnchorElement>, type: string) {
    e.preventDefault();

    if (type === "facebook") {
      window.open(
        "https://www.facebook.com/sharer/sharer.php?u=http://bit.ly/2iJb5nH",
        "sharewindow",
        "width=500, height=350"
      );
    } else {
      const issueURL = `${APP_URL}/issue/${this.state.issueSlug}/`;
      let tweet = encodeURIComponent(
        `I just called my reps to ${this.state.issueTitle.substring(0, 72)} -- you should too:`
      );

      window.open(`https://twitter.com/share?url=${issueURL}&text=${tweet}`, "sharewindow", "width=500, height=350");
    }
  }

  render() {
    return (
      <>
        <h3>Share this call</h3>
        { this.state.issueId !== "" ? <img
          src={`https://api.5calls.org/v1/issue/${this.state.issueId}/share/t`}
          alt="Share this issue"
          className="call__complete__share__img"
        /> : React.Fragment }
        <div className="share-links">
          <p className="share-twitter">
            <a href="https://5calls.org" onClick={(e) => this.share(e, "twitter")}>
              <i className="fab fa-twitter" aria-hidden="true"></i>Share
            </a>
          </p>
          <p className="share-facebook">
            <a href="https://5calls.org" onClick={(e) => this.share(e, "facebook")}>
              <i className="fab fa-facebook" aria-hidden="true"></i>Share
            </a>
          </p>
        </div>
      </>
    );
  }
}

export default Share;
