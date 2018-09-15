import * as React from 'react';

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

  render() {
    return (
      <Layout>
        <main role="main" id="content" className="layout__main">
          <h1>5 Calls Midterm Challenge</h1>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>Hello and welcome to the 5 Calls 2018 Midterm Challenge - Week 1! We are very excited to announced that xxx people have already signed up.</p>
          <p>This week’s challenge is... COMMIT TO VOTE</p>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>Yes, we know you are already definitely going to vote*. But your challenge for this week is to get warmed up on advocacy and start getting your friends mobilized to vote by putting yourself out there a little bit. How? Here’s your step-by-step guide:</p>
          <ul className="midterms-list">
            <li className="item">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week1') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                <Link to="/issue/midterm-challenge-week1">Week 1: Commit to Vote</Link>
                {this.week1actions()}
              </span>
              <span className="item__subtitle">
                Details about why week 1 is important
              </span>
            </li>
            <li className="item">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week2') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                <Link to="/issue/midterm-challenge-week1">Week 2: The Focus of Week 2</Link>
                {this.week2actions()}
              </span>
              <span className="item__subtitle">
                Details about why week 2 is important
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week3') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 3: Something else
                {this.week3actions()}
              </span>
              <span className="item__subtitle">
                Details about why week 3 is important
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
                Details about why week 3 is important
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week5') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 5
              </span>
              <span className="item__subtitle">
                Details about why week 3 is important
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week6') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 6
              </span>
              <span className="item__subtitle">
                Details about why week 3 is important
              </span>
            </li>
            <li className="item preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week7') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 7
              </span>
              <span className="item__subtitle">
                Details about why week 3 is important
              </span>
            </li>
            <li className="item last preview">
              <span className={`item__status ${isIssueComplete('midterm-challenge-week8') ? 'is-complete' : ''}`}>
                <span className="visually-hidden" />
              </span>
              <span className="item__title">
                Week 8
              </span>
              <span className="item__subtitle">
                Details about why week 3 is important
              </span>
            </li>
          </ul>
        </main>
      </Layout>
    );
  }
}

export default MidtermsPage;
