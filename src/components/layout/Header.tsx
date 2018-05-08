import * as React from 'react';
import { Link } from 'react-router-dom';
import onClickOutside from 'react-onclickoutside';
import { Login } from '@5calls/react-components';
import { store } from '../../redux/store';
import { DonationContainer } from '../donation/';
import { UserState, UserProfile } from '../../redux/userState/reducer';
import { clearProfileActionCreator } from '../../redux/userState/action';

interface Props {
  readonly postcards?: boolean;
  readonly currentUser?: UserState;
}

interface State {
  readonly userMenuHidden: boolean;
  readonly currentUser?: UserState;
}

class HeaderImpl extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      userMenuHidden: true
    };
  }

  handleClickOutside = () => {
    if (!this.state.userMenuHidden) { this.toggleMenu(); }
  }

  toggleMenu() {
    this.setState({ userMenuHidden: !this.state.userMenuHidden });
  }

  logout = () => {
    store.dispatch(clearProfileActionCreator());
  }

  render() {
    let profile: UserProfile | undefined;
    if (this.props.currentUser !== undefined) {
      profile = this.props.currentUser.profile;
    }

    return (
      <header className="logo__header" role="banner" >
        <div className="logo__header__logo layout">
          <Link to="/">
            <img src="/img/5calls-logo-small.png" alt="5 Calls" />
          </Link>
          {/* keep this around for teams / campaigns, but don't show for now */}
          {/* <ul>
            <li><Link className={props.postcards ? '' : 'active'} to="/">Calls</Link></li>
            <li><Link className={props.postcards ? 'active' : ''} to="/postcards">Postcards</Link></li>
          </ul> */}
          <Login userProfile={profile} logoutHandler={this.logout} />
        </div>
        {<DonationContainer />}
      </header>
    );
  }
}

export let Header = onClickOutside(HeaderImpl);