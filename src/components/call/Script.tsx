import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { Contact, Issue } from '../../common/model';
import { LocationState } from '../../redux/location/reducer';

interface Props {
  readonly issue: Issue;
  readonly contactIndex: number;
  readonly t: TranslationFunction;
  readonly locationState: LocationState;
}

// Replacement regexes, ideally standardize copy to avoid complex regexs
const titleReg = /\[REP\/SEN NAME\]|\[SENATOR\/REP NAME\]/gi;
const locationReg = /\[CITY,\s?ZIP\]|\[CITY,\s?STATE\]/gi;

function getContactNameWithTitle(contacts: Contact[], contactIndex: number) {
  const currentContact = contacts[contactIndex];
  const title = currentContact.area === 'House' ? 'Rep. ' : 'Senator ';
  return title + currentContact.name;
}

function scriptFormat(issue: Issue, locationState: LocationState, contactIndex: number) {
  const location = locationState.cachedCity;
  let script = issue.script;
  if (location) {
    script = script.replace(locationReg, location);
  }
  if (issue.contacts) {
    // try title replacement
    const title = getContactNameWithTitle(issue.contacts, contactIndex);
    script = script.replace(titleReg, title);
  }
  return script;
}

export const Script: React.StatelessComponent<Props> = ({ issue, contactIndex = 0, locationState, t }: Props) => {
  if (issue && issue.contacts && issue.contacts.length !== 0) {
    let formattedScript = scriptFormat(issue, locationState, contactIndex);
    return (
      <div className="call__script">
        <h3 className="call__script__header">{t('script.yourScript')}</h3>
        <div className="call__script__body">
          <ReactMarkdown source={formattedScript}/>
        </div>
      </div>
    );
  } else {
    return <span />;
  }
};

export const ScriptTranslatable = translate()(Script);
