import { applyMiddleware, createStore, Store, compose, Middleware } from 'redux';
import { persistStore, Persistor } from 'redux-persist';
import rootReducer, { ApplicationState } from './root';
// import { createLogger, ReduxLoggerOptions } from 'redux-logger';
import thunk from 'redux-thunk';

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
      // This added for Redux Dev Tools - install Chrome or Firefox extension to use
      // tslint:disable-next-line:max-line-length no-string-literal
      typeof window === 'object' && typeof window['devToolsExtension'] !== 'undefined' ? window['devToolsExtension']() : (f) => f
    ));

  persistor = persistStore(
    store,
    undefined,
    () => {
      store.getState();
    }
  );

  return store;
};
