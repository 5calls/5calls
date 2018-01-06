import * as React from 'react';
import { Link } from 'react-router-dom';

import i18n from '../../services/i18n';
import { LocationState } from '../../redux/location/reducer';
import { CallState } from '../../redux/callState/reducer';
import { LocationTranslatable } from '../location';
import { Group } from '../../common/model';

interface Props {
  readonly callState: CallState;
  readonly currentGroup?: Group;
  readonly locationState: LocationState;
  readonly setLocation: (location: string) => void;
  readonly clearLocation: () => void;
}

const SidebarHeader: React.StatelessComponent<Props> = (props: Props) => {
  let headerIntro = <h2>{i18n.t('issues.whatsImportantToYou')}</h2>;

  if (props.currentGroup) {
    headerIntro = (
      <h3>
        <Link to={`/team/${props.currentGroup.id}`}>{props.currentGroup.name} Home</Link>
      </h3>
    );
  }

  return (
    <header className="issues__header" role="banner">
      <div className="issues__location">
        <LocationTranslatable
          locationState={props.locationState}
          setLocation={props.setLocation}
          clearLocation={props.clearLocation}
          t={i18n.t}
        />
      </div>
      {headerIntro}
    </header>
  );
};

export default SidebarHeader;