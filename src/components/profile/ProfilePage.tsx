import * as React from 'react';
import * as moment from 'moment';

import { LayoutContainer } from '../layout';
import { UserState, UserProfile } from '../../redux/userState';
import { getProfileInfo, UserCallDetails } from '../../redux/remoteData/asyncActionCreator';
import { queueUntilRehydration } from '../../redux/rehydrationUtil';

interface Props {
  readonly currentUser?: UserState;
}

interface State {
  loadedProfile: boolean;
  profile?: UserProfile;
}

// tslint:disable-next-line:max-line-length
const fakePhotoUrl = '/img/example-activist.jpg';

const fakeUserProfile = {
  name: 'Example Activist',
  sub: '',
  exp: 0,
  picture: fakePhotoUrl,
  callDetails: {
    weeklyStreak: 10,
    stats: {
      unavailable: 20,
      contact: 203,
      voicemail: 140,
    },
    firstCallTime: 1494383929,
    calls: [
      {
        'date': 'Monday, Jun 18, 2018',
        'issues': [
          {
            'count': 3,
            'issue_name': 'Support Sanctions to Check Trump\'s ZTE Deal'
          },
          {
            'count': 2,
            'issue_name': 'Protect Our Elections from Foreign Interference'
          }
        ]
      },
      {
        'date': 'Sunday, Jun 10, 2018',
        'issues': [
          {
            'count': 2,
            'issue_name': 'Protect Clean Air Car Emissions Standards'
          },
          {
            'count': 2,
            'issue_name': 'Urge Your State Reps to Pass Net Neutrality Protections'
          }
        ]
      }
    ],
  }
} as UserProfile;

class ProfilePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { loadedProfile: false };
  }

  componentDidMount() {
    queueUntilRehydration(() => {
      getProfileInfo().then(profile => {
        this.setState({ profile: profile, loadedProfile: true });
      }).catch(error => {
        // console.log('error getting profile', error);
      });  
    });
  }

  totalCalls(callDetails: UserCallDetails): number {
    return callDetails.stats.contact + callDetails.stats.unavailable + callDetails.stats.voicemail;
  }

  callLine(callDetails?: UserCallDetails): String {
    if (callDetails === undefined || this.totalCalls(callDetails) === 0) {
      return 'Make your first call today!';
    }

    let calls = this.totalCalls(callDetails) + ' Calls';
    if (callDetails.weeklyStreak > 0) {
      calls = calls + ' ⋆ ' + callDetails.weeklyStreak + ' Week Streak';
    }

    return calls;
  }

  firstCallTime(callDetails?: UserCallDetails): String {
    if (callDetails && callDetails.firstCallTime > 0) {
      const firstCall = moment.unix(callDetails.firstCallTime);
      return 'Making Calls Since ' + firstCall.format('MMMM YYYY');
    }
    
    return '';
  }

  moreCalls(callDetails?: UserCallDetails): String {
    if (callDetails && callDetails.calls.length === 0) {
      return 'No calls made in the last 30 days';
    }

    return 'And calls from more than 30 days ago...';
  }

  profileContent(profile: UserProfile, fake: boolean) {
    return (
      <section className={`profile ${fake && 'preview'}`}>
        <div className="profile-header">
          <img src={profile.picture} />
          <h1>{profile.name}</h1>
          <h2>{this.callLine(profile.callDetails)}</h2>
          <p>{this.firstCallTime(profile.callDetails)}</p>
        </div>
        {/* <ul className="profile-awards clearfix">
          <li>🏅5 Calls Supporter</li>
          <li>🏅Midterm Challenge</li>
        </ul> */}
        <div className="profile-history">
          {profile.callDetails && profile.callDetails.calls.map((day, index) => {
            return (
            <span key={index}>
            <div className="profile-history-day">
              <h4>{day.date}</h4>
              {day.issues.map((issue, issueIndex) => {
                return (
                  <div className="profile-history-item" key={issueIndex}>
                    <img src="/img/5calls-stars-white.png" />
                    <p><strong>{issue.count} calls</strong> for {issue.issue_name}</p>
                  </div>
                );
              })}
            </div>
            <hr />
            </span>
            );
          })}
          <p>{this.moreCalls(profile.callDetails)}</p>
        </div>
      </section>
    );
  }

  pageContent() {
    if (this.props.currentUser && this.props.currentUser.profile) {
      if (!this.state.profile) {
        return (
          <section className="loading">
            <h2>Loading your profile info...</h2>
            <p>This'll be just a moment</p>
          </section>
        );
      } else {
        return this.profileContent(this.state.profile, false);
      }
    } else {
      // not logged in state
      return (
        <span>
        <section className="loading">
          <h2>Log in to see your call history 📊</h2>
          <p>Your current call total will be saved</p>
        </section>
        {this.profileContent(fakeUserProfile, true)}        
        </span>
      );
    }
  }

  render() {
    return (
      <LayoutContainer>
        {this.pageContent()}
      </LayoutContainer>
    );
  }
}

export default ProfilePage;
