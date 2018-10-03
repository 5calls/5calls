import * as React from 'react';

import * as moment from 'moment';
import * as Raven from 'raven-js';

import { Layout } from './layout';
import { Link } from 'react-router-dom';
import { getMidterms } from '../services/apiServices';
import { MidtermStats } from '../common/model';
import { isIssueComplete } from './shared/utils';

interface Props {}
interface State {
  midtermStats?: MidtermStats;
}

class MidtermsPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    getMidterms().then(midtermStats => {
      this.setState({ midtermStats: midtermStats });
    });
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  weekCountdown(date: string): string {
    const now = moment();
    const days = moment(date, 'YYYYMMDD').diff(now, 'days');

    return 'in ' + days + ' days';
  }

  week1actions() {
    if (this.state.midtermStats && this.state.midtermStats.week1 > 0) {
      return <span> ⋆ {this.state.midtermStats.week1} actions taken</span>;
    }

    return <></>;
  }

  week2actions() {
    if (this.state.midtermStats && this.state.midtermStats.week2 > 0) {
      return <span> ⋆ {this.state.midtermStats.week2} actions taken</span>;
    }

    return <></>;
  }

  week3actions() {
    if (this.state.midtermStats && this.state.midtermStats.week3 > 0) {
      return <span> ⋆ {this.state.midtermStats.week3} actions taken</span>;
    }

    return <></>;
  }

  week4actions() {
    if (this.state.midtermStats && this.state.midtermStats.week4 > 0) {
      return <span> ⋆ {this.state.midtermStats.week4} actions taken</span>;
    }

    return <></>;
  }

  week5actions() {
    if (this.state.midtermStats && this.state.midtermStats.week5 > 0) {
      return <span> ⋆ {this.state.midtermStats.week5} actions taken</span>;
    }

    return <></>;
  }

  week6actions() {
    if (this.state.midtermStats && this.state.midtermStats.week6 > 0) {
      return <span> ⋆ {this.state.midtermStats.week6} actions taken</span>;
    }

    return <></>;
  }

  week7actions() {
    if (this.state.midtermStats && this.state.midtermStats.week7 > 0) {
      return <span> ⋆ {this.state.midtermStats.week7} actions taken</span>;
    }

    return <></>;
  }

  week8actions() {
    if (this.state.midtermStats && this.state.midtermStats.week8 > 0) {
      return <span> ⋆ {this.state.midtermStats.week8} actions taken</span>;
    }

    return <></>;
  }

  render() {
    return (
      <Layout>
        <main role="main" id="content" className="layout__main midterms">
          <h1>5 Calls 2018 Midterm Challenge</h1>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>Hello and welcome to the 5 Calls Midterm Challenge!</p>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>Our priority is to <strong>help <em>you</em> get out the vote</strong> by talking with other voters. Why are we focused on that? Studies have shown that peer to peer (and particularly friend to friend) discussions are the <strong>number one most effective tactic to get people to vote</strong>.</p>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>How it works: Each week, we will <strong>send you a new challenge</strong>, along with the guidance and resources you need to complete it. Each challenge has been carefully chosen to <strong>maximize your impact on the 2018 midterm election</strong> — both in your local races as well as key swing races nationally. Each challenge is also designed to be <strong>doable in less than an hour</strong>. Just like we made calling Congress easy, we’re doing the same for this.</p>
          <div className="subscribe">
            {/*tslint:disable-next-line:max-line-length*/}
            <form action="//5calls.us16.list-manage.com/subscribe/post?u=82a164d5fe7f51f4a4efb1f83&amp;id=624ef52208" method="post" target="popupwindow">
              <label htmlFor="email"><strong>Get email alerts once every week</strong></label>
              <span className="emailform">
                <input type="text" placeholder="youremail@example.com" name="email" id="email" />
                <input type="submit" value="Subscribe" />
              </span>
            </form>
          </div>
          <ul className="midterms-list">
            <li className="item">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week1') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                <Link to="/issue/midterm-challenge-week-1">Week 1: Commit to Vote</Link>
                {this.week1actions()}
              </span>
              <span className="item__subtitle">
                Practice accountability for you AND others
              </span>
            </li>
            <li className="item">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week2') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                <Link to="/issue/midterm-challenge-week-2">Week 2: Register to Vote</Link>
                {this.week2actions()}
              </span>
              <span className="item__subtitle">
                Confirm your registration - then help others
              </span>
            </li>
            <li className="item">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week3') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                <Link to="/issue/midterm-challenge-week-3">Week 3: Adopt a Key Race</Link>
                {this.week3actions()}
              </span>
              <span className="item__subtitle">
                Phone bank for a swing race
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week4') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 4
                {this.week4actions()}
              </span>
              <span className="item__subtitle">
                Week 4 starts {this.weekCountdown('20181008')}
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week5') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 5
                {this.week5actions()}
              </span>
              <span className="item__subtitle">
                Week 5 starts {this.weekCountdown('20181015')}
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week6') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 6
                {this.week6actions()}
              </span>
              <span className="item__subtitle">
                Week 6 starts {this.weekCountdown('20181022')}
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week7') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 7
                {this.week7actions()}
              </span>
              <span className="item__subtitle">
                Week 7 starts {this.weekCountdown('20181029')}
              </span>
            </li>
            <li className="item last preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week8') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 8
                {this.week8actions()}
              </span>
              <span className="item__subtitle">
                Week 8 starts {this.weekCountdown('20181105')}
              </span>
            </li>
          </ul>
        </main>
      </Layout>
    );
  }
}

export default MidtermsPage;
