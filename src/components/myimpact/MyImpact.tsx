import * as React from 'react';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import i18n from '../../services/i18n';
import Pluralize from 'react-pluralize';

import { CallCount } from '../shared';
import { UserStatsState } from '../../redux/userStats';
import { RemoteUserStats, getUserStats } from '../../services/apiServices';
import { UserState } from '../../redux/userState';
import { remoteStateContext } from '../../contexts';

interface Props {
  t: TranslationFunction;
  currentUser?: UserState;
  userStats: UserStatsState;
}

interface State {
  fetchedStats: boolean;
  remoteUserStats?: RemoteUserStats;
}

export class MyImpact extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      fetchedStats: false,
      remoteUserStats: undefined
    };
  }

  componentDidMount() {
    if (this.props.currentUser && this.props.currentUser.idToken && !this.state.fetchedStats) {
      this.setState({fetchedStats: true});

      getUserStats(this.props.currentUser.idToken).then((userStats) => {
        this.setState({remoteUserStats: userStats});
      }).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('error getting user stats', error);
      });
    }
  }

  render() {
    let callSummaryParams = {
      contactedCalls: this.props.userStats.contact,
      vmCalls: this.props.userStats.voicemail,
      unavailableCalls: this.props.userStats.unavailable,
    };
    let myTotalCalls = this.props.userStats.all.length;
    let streakLength = 0;

    // update stats from the server when we get them back
    if (this.state.remoteUserStats && this.state.remoteUserStats.stats) {
      callSummaryParams.contactedCalls = this.state.remoteUserStats.stats.contact;
      callSummaryParams.vmCalls = this.state.remoteUserStats.stats.voicemail;
      callSummaryParams.unavailableCalls = this.state.remoteUserStats.stats.unavailable;

      myTotalCalls = callSummaryParams.contactedCalls + callSummaryParams.vmCalls + callSummaryParams.unavailableCalls;
      streakLength = this.state.remoteUserStats.weeklyStreak;
    }

    return (
    <section className="impact">
      <h1 className="impact__title">{i18n.t('impact.title')}</h1>
      {myTotalCalls === 0 &&
        <div>
          <h2 className="impact_total">{i18n.t('impact.noCallsYet')}</h2>
          { this.props.currentUser && this.props.currentUser.idToken === undefined &&
            <p>Sign in to save your calls across devices, and track your weekly call streaks!</p>
          }
        </div>
      }

      {myTotalCalls > 0 &&
        <div>
          <h2 className="impact_total">
            { streakLength > 0 &&
              <React.Fragment>
                {/*tslint:disable-next-line:max-line-length*/}
                You've made <Pluralize singular="call" count={myTotalCalls} /> and your streak is <Pluralize singular="week" count={streakLength} />!
              </React.Fragment>
            }
            { streakLength === 0 &&
              <React.Fragment>
                You've made <Pluralize singular="call" count={myTotalCalls} />!
              </React.Fragment>
            }
          </h2>
          { this.props.currentUser && this.props.currentUser.idToken &&
            <p>Sign in to save your calls across devices, and track your weekly call streaks!</p>
          }
          <div className="impact_result">
            {i18n.t('impact.callSummaryText', callSummaryParams)}
          </div>
        </div>
      }

        <remoteStateContext.Consumer>
        { remoteData =>
          <CallCount
            totalCount={remoteData.callTotal}
          />
        }
        </remoteStateContext.Consumer>
      </section>
    );
  }
}

export const MyImpactTranslatable = translate()(MyImpact);
