import * as React from 'react';
import * as ReactGA from 'react-ga';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';

import 'react-phone-number-input/rrui.css';
import 'react-phone-number-input/style.css';

import * as Constants from '../../common/constants';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { Issue } from '../../common/model';
import { CallCount } from '../shared';
import { postPhoneRemind } from '../../services/apiServices';

interface Props {
  readonly currentIssue: Issue;
  readonly totalCount: number;
  readonly t: TranslationFunction;
}

interface State {
  reminderPhone: string;
  reminderError?: string;
  reminderSet: boolean;
}

export class Done extends React.Component<Props, State> {
  url = encodeURIComponent(Constants.APP_URL);
  additionalTwitterComps = '&via=make5calls';
  tweet = encodeURIComponent(this.props.t('promote.motto'));
  twitterTitle = this.props.t('promote.shareOnTwitter');
  facebookTitle = this.props.t('promote.shareOnFacebook');

  constructor(props: Props) {
    super(props);

    this.state = {
      reminderPhone: '',
      reminderError: undefined,
      reminderSet: false,
    };
  }

  // is this new window behavior the best? Nope, but it matches the default behavior in both share widgets
  twitterShare = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const ga = ReactGA.ga();
    ga('send', 'event', 'share', 'twitter', 'twitter');

    // tslint:disable-next-line:max-line-length
    window.open(`https://twitter.com/share?url=${this.url}${this.additionalTwitterComps}&text=${this.tweet}`, 'sharewindow', 'width=500, height=350');
  }

  facebookShare = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const ga = ReactGA.ga();
    ga('send', 'event', 'share', 'facebook', 'facebook');

    // tslint:disable-next-line:max-line-length
    window.open('https://www.facebook.com/sharer/sharer.php?u=http://bit.ly/2iJb5nH', 'sharewindow', 'width=500, height=350');
  }

  setReminder(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    
    if (isValidNumber(this.state.reminderPhone, 'US')) {
      // ignore errors from the server
      postPhoneRemind(this.state.reminderPhone);
      this.setState({reminderSet: true});

    } else {
      this.setState({reminderError: 'Please enter a valid US phone number'});
    }
  }

  donateClick(amount: number) {
    const ga = ReactGA.ga();
    ga('send', 'event', 'donate', amount, amount);

    window.open(Constants.DONATE_URL + '?amount=' + amount, '_blank');
  }

  render() {
    // for selected issues, customize the share text a bit more
    if (this.props.currentIssue) {
      const issueID = this.props.currentIssue.slug ? this.props.currentIssue.slug : this.props.currentIssue.id;
  
      this.url = encodeURIComponent(`${Constants.APP_URL}/issue/${issueID}`);
      // the additional "via @make5calls" text that the via param introduces doesn't fit with issue titles, remove it
      this.additionalTwitterComps = '';
      // tslint:disable-next-line:max-line-length
      this.tweet = encodeURIComponent(this.props.t('promote.iJustCalled') + this.props.currentIssue.name.substring(0, 72) + this.props.t('promote.youShouldToo'));
      this.twitterTitle = this.props.t('promote.tweetThisIssue');
      this.facebookTitle = this.props.t('promote.shareThisIssue');
    }

    const shareURL = `${Constants.SHARE_BUCKET_URL}${this.props.currentIssue.id}.png`;

    return (
      <section className="call">
        <div className="call__complete">
          <h1 className="call__title">{this.props.t('callComplete.title')}</h1>
          <p className="call__text">
            {this.props.t('callComplete.pickAnotherIssue')}
          </p>
          <CallCount
            totalCount={this.props.totalCount}
            t={this.props.t}
          />
          <div className="call__complete__donate">
            <h2>
              <span>Donate to 5 Calls</span>
            </h2>
            <p>
              5 Calls is an <strong>all-volunteer non-profit organization</strong>,
              we rely on donations from members like you to keep our activities
              fresh and develop new ways to make your voice heard!
            </p>
            <div className="call__complete__donate__grid">
              <button onClick={(e) => this.donateClick(10)} className="grid-1">$10
                <span>Supports 200 calls to Congress</span>
              </button>
              <button onClick={(e) => this.donateClick(15)} className="grid-2">$15
                <span>Supports outreach to new activists</span>
              </button>
              <button onClick={(e) => this.donateClick(25)} className="donate-best grid-1">$25
                <span>Supports issue research and writeups</span>
              </button>
              <button onClick={(e) => this.donateClick(100)} className="grid-2">$100
                <span>Keeps the server running for a month</span>
              </button>
            </div>
          </div>
          <div className="call__complete__grid">
            <div className="call__complete__remind">
              <h3>
                <span>⏰ Remind me:</span>
              </h3>
              <p>Enter your phone number to get a reminder to make your next call.</p>
              <blockquote>
                {this.state.reminderSet ?
                <h3><strong>Thanks, we'll remind you!</strong></h3>
                :
                <span>
                <PhoneInput
                  placeholder="415 555 1212"
                  countries={['US']}
                  error={this.state.reminderError}
                  indicateInvalid={true}
                  onChange={phone => this.setState({ reminderPhone: phone })}
                />
                <button
                  className="button"
                  onClick={(e) => this.setReminder(e)}
                >
                  Remind me
                </button>
                </span>
                }
              </blockquote>
            </div>
            <div className="call__complete__share">
              <h3>
                <span>📬 Share this call:</span>
              </h3>
              <img src={shareURL} className="call__complete__share__img" />
              <div className="call__complete__share__links">
                <p className="call__complete__share__links__twitter">
                  <a onClick={(e) => this.twitterShare(e)}><i className="fab fa-twitter"/>Share</a>
                </p>
                <p className="call__complete__share__links__facebook">
                  <a onClick={(e) => this.facebookShare(e)}><i className="fab fa-facebook"/>Share</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export const DoneTranslatable = translate()(Done);