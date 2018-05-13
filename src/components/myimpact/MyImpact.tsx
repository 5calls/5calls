import * as React from 'react';
import i18n from '../../services/i18n';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import Pluralize from 'react-pluralize';

import { CallCount } from '../shared';
import { UserStatsState } from '../../redux/userStats';
import { RemoteUserStats } from '../../services/apiServices';
import { UserState } from '../../redux/userState';
import { LoginService } from '@5calls/react-components';
import { Auth0Config } from '../../common/constants';

interface Props {
  readonly currentUser?: UserState;
  readonly userStats: UserStatsState;
  readonly totalCount: number;
  readonly t: TranslationFunction;
  readonly remoteUserStats?: RemoteUserStats;
}

interface State {}

const authutil = new LoginService(Auth0Config);

export class MyImpact extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
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
    if (this.props.remoteUserStats && this.props.remoteUserStats.stats) {
      callSummaryParams.contactedCalls = this.props.remoteUserStats.stats.contact;
      callSummaryParams.vmCalls = this.props.remoteUserStats.stats.voicemail;
      callSummaryParams.unavailableCalls = this.props.remoteUserStats.stats.unavailable;

      myTotalCalls = callSummaryParams.contactedCalls + callSummaryParams.vmCalls + callSummaryParams.unavailableCalls;
      streakLength = this.props.remoteUserStats.weeklyStreak;
    }

    return (
    <section className="impact">
      <h1 className="impact__title">{this.props.t('impact.title')}</h1>
      {myTotalCalls === 0 &&
        <div>
          <h2 className="impact_total">{this.props.t('impact.noCallsYet')}</h2>
          { !authutil.isLoggedIn(this.props.currentUser) &&
            <p>
              <a onClick={authutil.login}>Sign in</a>
              &nbsp;to save your calls across devices, and track your weekly call streaks!
            </p>
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
          { !authutil.isLoggedIn(this.props.currentUser) &&
            <p>
              <a onClick={authutil.login}>Sign in</a>
              &nbsp;to save your calls across devices, and track your weekly call streaks!
            </p>
          }
          <div className="impact_result">
            {this.props.t('impact.callSummaryText', callSummaryParams)}
          </div>
        </div>
      }

      <CallCount
        totalCount={this.props.totalCount}
        t={i18n.t}
      />
      </section>
    );
  }
}

export const MyImpactTranslatable = translate()(MyImpact);
