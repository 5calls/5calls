import { connect } from 'react-redux';

import { ApplicationState } from '../../redux/root';
import { UserState } from '../../redux/userState';
import ProfilePage from './ProfilePage';

interface StateProps {
  readonly currentUser?: UserState;
}

const mapStateToProps = (state: ApplicationState): StateProps => {
  return {
    currentUser: state.userState,
  };
};

export default connect<StateProps, {}, {}>(mapStateToProps)(ProfilePage);
