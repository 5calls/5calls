import * as React from 'react';
import { shallow } from 'enzyme';
import { History, Location } from 'history';
import i18n from '../../services/i18n';
import { I18nextProvider } from 'react-i18next';
import { GroupPage } from './';
import { CallState } from '../../redux/callState/reducer';
import { LocationState } from '../../redux/location';
import { GroupLoadingActionStatus } from '../../redux/group';
import { Issue, Group, getDefaultGroup } from '../../common/model';

test('Test Group Page loading', () => {
  const pageProps = initPage();
  const component = shallow(
    <GroupPage
      {...pageProps}
      loadingStatus={GroupLoadingActionStatus.LOADING}
    />
  );
  expect(component).toMatchSnapshot();
});

test('Test Group Page found', () => {
  const pageProps = initPage();
  const component = shallow(
    <I18nextProvider i18n={i18n} >
      <GroupPage
        {...pageProps}
        loadingStatus={GroupLoadingActionStatus.FOUND}
      />
    </I18nextProvider>
  );
  expect(component).toMatchSnapshot();
});

test('Test Group Page not found', () => {
  const pageProps = initPage();
  const component = shallow(
    <GroupPage
      {...pageProps}
      loadingStatus={GroupLoadingActionStatus.NOTFOUND}
    />
  );
  expect(component).toMatchSnapshot();
});

test('Test Group Page error', () => {
  const pageProps = initPage();
  const component = shallow(
    <GroupPage
      {...pageProps}
      loadingStatus={GroupLoadingActionStatus.ERROR}
    />
  );
  expect(component).toMatchSnapshot();
});

const initPage = () => {
  const id = 'craig';
  const group: Group = getDefaultGroup(id);
  return {
    match: {params: {groupid: id, issueid: '100'}, isExact: true, path: '', url: ''},
    location: {} as Location,
    history: {} as History,
    issues: [] as Issue[],
    currentIssue: {} as Issue,
    completedIssueIds: [] as string[],
    callState: {} as CallState,
    locationState: {} as LocationState,
    currentGroup: group,
    setLocation: jest.fn(),
    clearLocation: jest.fn(),
    onSelectIssue: jest.fn(),
    onGetIssuesIfNeeded: jest.fn(),
    onJoinGroup: jest.fn(),
    cacheGroup: jest.fn()
  };
};
