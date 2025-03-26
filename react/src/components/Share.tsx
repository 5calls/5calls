import React, { createRef } from 'react';
import { APP_URL } from '../common/constants';

interface State {
  issueSlug: string;
  issueId: string;
  issueTitle: string;
}

class Share extends React.Component<null, State> {
  private componentRef = createRef<HTMLDivElement>();

  state = {
    issueSlug: '',
    issueId: '',
    issueTitle: '',
  };

  componentDidMount() {
    const thisComponent = this.componentRef.current;
    if (thisComponent && thisComponent.parentElement) {
      const issueId = thisComponent.parentElement.dataset.issueId ?? '';
      const issueSlug = thisComponent.parentElement.dataset.issueSlug ?? '';
      const issueTitle = thisComponent.parentElement.dataset.issueTitle ?? '';
      this.setState({ issueSlug, issueId, issueTitle });
    }
  }

  share(e: React.MouseEvent<HTMLAnchorElement>, type: string) {
    e.preventDefault();

    const tweet = encodeURIComponent(
      `I just called my reps with 5 Calls, you should too: 5calls.org`,
    );

    if (type === 'facebook') {
      window.open(
        'https://www.facebook.com/sharer/sharer.php?u=https://5calls.org',
        'sharewindow',
        'width=500, height=350',
      );
    } else if (type === 'bluesky') {
      const bskyTweet = encodeURIComponent(
        `I just called my reps with @5calls.org, you should too: https://5calls.org`,
      );
      window.open(
        `https://bsky.app/intent/compose?text=${bskyTweet}`,
        'sharewindow',
        'width=500, height=350',
      );
    } else if (type === 'threads') {
      window.open(
        `https://threads.net/intent/post?text=${tweet}`,
        'sharewindow',
        'width=500, height=350',
      );
    } else if (type === 'mastodon') {
      window.open(
        `https://mastodonshare.com/?text=${tweet}&url=5calls.org`,
        'sharewindow',
        'width=500, height=350',
      );
    } else {
      const issueURL = `${APP_URL}/issue/${this.state.issueSlug}/`;

      window.open(
        `https://twitter.com/share?url=${issueURL}&text=${tweet}`,
        'sharewindow',
        'width=500, height=350',
      );
    }
  }

  render() {
    return (
      <div ref={this.componentRef}>
        <h3>Share this call</h3>
        {this.state.issueId !== '' ? (
          <img
            src={`https://api.5calls.org/v1/issue/${this.state.issueId}/share/t`}
            alt="Share this issue"
            className="call__complete__share__img"
          />
        ) : null}
        <div className="share-links">
          <p className="share-bluesky">
            <a
              href="https://5calls.org"
              onClick={(e) => this.share(e, 'bluesky')}
            >
              <i className="fa-brands fa-bluesky" aria-hidden="true"></i>Share
              on Bluesky
            </a>
          </p>
          <p className="share-threads">
            <a
              href="https://5calls.org"
              onClick={(e) => this.share(e, 'threads')}
            >
              <i className="fab fa-threads" aria-hidden="true"></i>Share on
              Threads
            </a>
          </p>
          <p className="share-facebook">
            <a
              href="https://5calls.org"
              onClick={(e) => this.share(e, 'facebook')}
            >
              <i className="fab fa-facebook" aria-hidden="true"></i>Share on
              Facebook
            </a>
          </p>
          <p className="share-mastodon">
            <a
              href="https://5calls.org"
              onClick={(e) => this.share(e, 'mastodon')}
            >
              <i className="fab fa-mastodon" aria-hidden="true"></i>Share on
              Mastodon
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default Share;
