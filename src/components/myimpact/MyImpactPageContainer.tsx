import { connect } from 'react-redux';
import { ApplicationState } from '../../redux/root';
import { UserStatsState } from '../../redux/userStats';

import { MyImpactPage } from './index';
import { UserState } from '../../redux/userState';
import { RemoteUserStats, getUserStats } from '../../services/apiServices';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';

interface StateProps {
  readonly currentUser?: UserState;
  readonly userStats: UserStatsState;
  readonly totalCount: number;
  readonly remoteUserStats?: RemoteUserStats;
}

const mapStateToProps = (state: ApplicationState): StateProps => {
  let remoteUserStats: RemoteUserStats | undefined = undefined;
  queueUntilRehydration(() => {
    if (state.userState && state.userState.idToken) {
      getUserStats(state.userState.idToken).then((userStats) => {
        remoteUserStats = userStats;
      }).catch((error) => {
        // tslint:disable-next-line:no-console
        console.error('error getting user stats', error);
      });
    }
  });
  return {
    currentUser: state.userState,
    userStats: state.userStatsState,
    totalCount: state.remoteDataState.callTotal,
    remoteUserStats: remoteUserStats,
  };
};

export default connect<StateProps, {}, {}>(mapStateToProps)(MyImpactPage);
