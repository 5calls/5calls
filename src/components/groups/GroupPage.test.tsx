import * as React from 'react';
import { shallow } from 'enzyme';
import { History, Location } from 'history';
import { GroupPage } from './';
import { CallState } from '../../redux/callState/reducer';
import { LocationState } from '../../redux/location';
import { GroupLoadingActionStatus } from '../../redux/group';
import { Issue, Group } from '../../common/model';

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
    <GroupPage
      {...pageProps}
      loadingStatus={GroupLoadingActionStatus.FOUND}
    />
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
  return {
    match: {params: {groupid: 'craig', issueid: '100'}, isExact: true, path: '', url: ''},
    location: {} as Location,
    history: {} as History,
    issues: [] as Issue[],
    currentIssue: {} as Issue,
    completedIssueIds: [] as string[],
    callState: {} as CallState,
    locationState: {} as LocationState,
    currentGroup: {} as Group,
    setLocation: jest.fn(),
    clearLocation: jest.fn(),
    onSelectIssue: jest.fn(),
    onGetIssuesIfNeeded: jest.fn(),
    onJoinGroup: jest.fn(),
    cacheGroup: jest.fn()
  };
};
