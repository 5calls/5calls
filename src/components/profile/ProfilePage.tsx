import * as React from 'react';

import { LayoutContainer } from '../layout';
import { UserState } from '../../redux/userState';

interface Props {
  readonly currentUser?: UserState;
}

const ProfilePage: React.StatelessComponent<Props> = (props: Props) => (
  <LayoutContainer>
    <section className="loading">
      <h2><a>Log in</a> to see your call history 📊</h2>
      <p>Your current call total will be saved</p>
    </section>
    <section className="profile">
      <p>ho</p>
    </section>
  </LayoutContainer>
);

export default ProfilePage;
