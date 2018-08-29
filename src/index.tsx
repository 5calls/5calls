import { } from './components/home/HomePageContainer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import createHistory from 'history/createBrowserHistory';
import createStore from './redux/store';
import i18n from './services/i18n';
import { getAll } from './services/localStorage';
import { transform, LegacyUserStatsState } from './services/legacyStats';
import { setUserStatsActionCreator } from './redux/userStats';
import * as ReactGA from 'react-ga';

import NotFoundPage from './components/NotFoundPage';
import { HomePageContainer } from './components/home';
import { AboutPage } from './components/about';
import { PhonebanksPage } from './components/phonebanks';
import { PostcardsPage } from './components/postcards';
import { FaqPage } from './components/faq';
import { PrivacyPage } from './components/privacy';
import { DonePageContainer } from './components/done';
import { MoreIssuesContainer } from './components/issues';
import { CallPageContainer } from './components/call';
import { MyImpactPageContainer } from './components/myimpact';
import { GroupPageContainer, GroupCallPageContainer } from './components/groups';
import './components/bundle.css';
import { Auth0CallbackContainer } from './components/shared';
import ProfilePageContainer from './components/profile/ProfilePageContainer';

ReactGA.initialize('UA-90915119-1');
const trackPageView = location => {
  ReactGA.set({
    page: location.pathname
  });
  ReactGA.pageview(location.pathname);
};

const history = createHistory();
trackPageView(history.location);
history.listen(trackPageView);

const store = createStore({});

// check for existing user stats in persisted redux store
if (store.getState().userStatsState.all.length === 0) {
  // check for user stats from legacy choo app
  const legacyStatsStore = getAll('org.5calls.userStats');

  if (legacyStatsStore && Array.isArray(legacyStatsStore) && legacyStatsStore[0]) {
    const legacyStats: LegacyUserStatsState = legacyStatsStore[0];
    let transformedLegacyStats = transform(legacyStats);
    store.dispatch(setUserStatsActionCreator(transformedLegacyStats));
  }
}

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/" exact={true} component={HomePageContainer} />
          <Route path="/issue/:issueid" exact={true} component={CallPageContainer} />
          <Route path="/done/:id" exact={true} component={DonePageContainer} />
          <Route path="/impact" exact={true} component={MyImpactPageContainer} />
          <Route path="/profile" exact={true} component={ProfilePageContainer} />
          <Route path="/more" exact={true} component={MoreIssuesContainer} />
          <Route path="/team/:groupid" exact={true} component={GroupPageContainer} />
          <Route path="/team/:groupid/:issueid" exact={true} component={GroupCallPageContainer} />
          <Route path="/faq" exact={true} component={FaqPage} />
          <Route path="/privacy" exact={true} component={PrivacyPage} />
          <Route path="/about" exact={true} component={AboutPage} />
          <Route path="/phonebanks" exact={true} component={PhonebanksPage} />
          <Route path="/postcards" exact={true} component={PostcardsPage} />
          <Route path="/auth0callback" exact={true} component={Auth0CallbackContainer} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  </I18nextProvider>,
  document.getElementById('root')
);
