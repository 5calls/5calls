import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import Location from "./Location";
import Reps from "./Reps";
import reportWebVitals from "./reportWebVitals";
import rootReducer from "./reducer";

import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

const persistConfig = {
  key: "fivecalls",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

let persistor = persistStore(store);

try {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Location />
        </PersistGate>
      </Provider>
    </React.StrictMode>,
    document.getElementById("location")
  );
} catch (error) {
  if (`${error}`.includes("Minified React error #200")) {
    // nbd, we're on a page where no sidebar element
  } else {
    console.error("error loading location component:", error);
  }
}

try {
  ReactDOM.render(
    <React.StrictMode>
      <Reps />
    </React.StrictMode>,
    document.getElementById("reps")
  );
} catch (error) {
  if (`${error}`.includes("Minified React error #200")) {
    // nbd, we're on a page where no reps element is
  } else {
    console.error("error loading reps component:", error);
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
