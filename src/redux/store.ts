import { applyMiddleware, createStore, Store, compose, Middleware } from 'redux';
import { autoRehydrate, persistStore, Persistor } from 'redux-persist';
import rootReducer, { ApplicationState } from './root';
// import { createLogger, ReduxLoggerOptions } from 'redux-logger';
import thunk from 'redux-thunk';
import { ApplicationStateKeyType, ApplicationStateKey } from '../redux/root';
import { startup } from './remoteData';
import { onStorageRehydrated } from './rehydrationUtil';

// declare var process: { env: { NODE_ENV: string } };
// const env = process.env.NODE_ENV;
const middlewares: Middleware[] = [thunk];

export let persistor = {} as Persistor;
export let store = {} as Store<ApplicationState>;

// NOTE: uncomment these to show the redux log statements
// const options: ReduxLoggerOptions = {};
// middlewares.push(createLogger(options));

export default (initialState) => {
  store = createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(...middlewares),
      autoRehydrate({ log: false }), // set log:true for debugging
      // This added for Redux Dev Tools - install Chrome or Firefox extension to use
      // tslint:disable-next-line:max-line-length no-string-literal
      typeof window === 'object' && typeof window['devToolsExtension'] !== 'undefined' ? window['devToolsExtension']() : (f) => f
    ));

  // Persist store using redux-persist:
  // "whitelist" tells the redux-persist middleware which reducer keys(parts of the redux store)
  // we want to persist and then grab back and put into the store upon loading the app the next time.
  // It will write to this localstorage key every time there is a change made to this key in redux.

  // Use a little TypeScript magic to assure that each whitelist member
  // is OK.
  // Make sure every key is of type ApplicationStateKeyType
  // and every value is an ApplicationStateKey value
  const localPersistKeys: ApplicationStateKeyType[] = [
    ApplicationStateKey.locationState,
    ApplicationStateKey.userStatsState,
    ApplicationStateKey.userState,
    ApplicationStateKey.callState,
  ];
  persistor = persistStore(
    store,
    { whitelist: localPersistKeys },
    () => {
      // tslint:disable-next-line:no-any
      store.dispatch<any>(startup());
      // tslint:disable-next-line:no-any
      store.dispatch<any>(onStorageRehydrated());
    }
  );

  return store;
};
