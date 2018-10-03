import * as React from 'react';

import i18n from '../../services/i18n';
import { LocationTranslatable } from '../location';
import { locationStateContext } from '../../contexts';

interface Props {
}

const SidebarHeader: React.StatelessComponent<Props> = (props: Props) => {
  let headerIntro = <h2>{i18n.t('issues.whatsImportantToYou')}</h2>;

  return (
    <header className="issues__header" role="banner">
      <div className="issues__location">
        <locationStateContext.Consumer>
        { locationState =>
          <LocationTranslatable
            locationState={locationState}
          />
        }
        </locationStateContext.Consumer>
      </div>
      {headerIntro}
    </header>
  );
};

export default SidebarHeader;
