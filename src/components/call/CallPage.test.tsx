import * as React from 'react';
import { shallow } from 'enzyme';
import { History, Location } from 'history';
import i18n from '../../services/i18n';
import { I18nextProvider } from 'react-i18next';
import { CallPageWithRouter } from './index';
import { CallState } from '../../redux/callState';
import { RemoteDataState } from '../../redux/remoteData';

test('snapshot should render correctly with an issue and NO group', () => {
  const pageProps = initPage();
  const component = shallow(
    <I18nextProvider i18n={i18n} >
      <CallPageWithRouter
        {...pageProps}
      />
    </I18nextProvider>
  );
  expect(component).toMatchSnapshot();
});

const initPage = () => {
  return {
    match: {params: {issueid: '100'}, isExact: true, path: '', url: ''},
    location: {} as Location,
    history: {} as History,
    callState: {} as CallState,
    remoteState: {} as RemoteDataState,
  };
};
