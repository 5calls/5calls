import * as React from 'react';
import { translate } from 'react-i18next';
import i18n from '../../services/i18n';
import * as ReactMarkdown from 'react-markdown';

import { Issue } from '../../common/model';

interface Props {
  invalidAddress: boolean;
  currentIssue: Issue;
}

export const CallHeader: React.StatelessComponent<Props> = ({
  invalidAddress,
  currentIssue
}: Props) => {
  if (currentIssue) {
    return (
      <header className="call__header">
        <h1 className="call__title">{currentIssue.name}</h1>
        <div className="call__reason">
          <ReactMarkdown source={currentIssue.reason} linkTarget="_blank" />
        </div>
      </header>
    );
  } else {
    return (
      <header className="call__header">
        {invalidAddress ? (
          <span>
            <h1 className="call__title">Invalid Address or Zip</h1>
            <p>
              Looks like we couldn't find your reps based on the address or zip
              code you entered. Use the left sidebar to enter a more specific
              address or just click the <strong>"Go"</strong> button to find it
              automatically.
            </p>
          </span>
        ) : (
          <span>
            <h1 className="call__title">{i18n.t('noCalls.title')}</h1>
            <p>{i18n.t('noCalls.reason')}</p>
            <p>{i18n.t('noCalls.nextStep')}</p>
          </span>
        )}
      </header>
    );
  }
};

export default translate()(CallHeader);

export const CallHeaderTranslatable = translate()(CallHeader);
