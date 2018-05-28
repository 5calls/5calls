import * as React from 'react';
import { shallow } from 'enzyme';
import { History, Location } from 'history';
import i18n from '../../services/i18n';
import { I18nextProvider } from 'react-i18next';
import { CallPage } from './index';
import { Issue, DefaultIssue, Group, getDefaultGroup } from '../../common/model';
import { CallState } from '../../redux/callState';
import { LocationState } from 'history';

test('snapshot should render correctly with an issue and group', () => {
  const id = 'craig';
  const group: Group = getDefaultGroup(id);
  const issue: Issue = Object.assign({}, DefaultIssue, { id: '1', name: 'testName' });
  const pageProps = initPage(group);
  pageProps.currentIssue = issue;
  pageProps.issues = [issue];
  pageProps.match.params.issueid = issue.id;
  const component = shallow(
    <I18nextProvider i18n={i18n} >
      <CallPage
        {...pageProps}
      />
    </I18nextProvider>
  );
  expect(component).toMatchSnapshot();
});

test('snapshot should render correctly with an issue and NO group', () => {
  const issue: Issue = Object.assign({}, DefaultIssue, { id: '1', name: 'testName' });
  const pageProps = initPage();
  pageProps.currentIssue = issue;
  pageProps.issues = [issue];
  pageProps.match.params.issueid = issue.id;
  const component = shallow(
    <I18nextProvider i18n={i18n} >
      <CallPage
        {...pageProps}
      />
    </I18nextProvider>
  );
  expect(component).toMatchSnapshot();
});

const initPage = (group?: Group) => {
  return {
    match: {params: {groupid: group ? group.id : undefined, issueid: '100'}, isExact: true, path: '', url: ''},
    location: {} as Location,
    history: {} as History,
    issues: [] as Issue[],
    currentIssue: {} as Issue,
    currentGroup: group,
    callState: {} as CallState,
    locationState: {} as LocationState,
    onSubmitOutcome: jest.fn(),
    onSelectIssue: jest.fn(),
    onGetIssuesIfNeeded: jest.fn(),
    clearLocation: jest.fn(),
    cacheGroup: jest.fn(),
    hasBeenCached: false,
  };
};
