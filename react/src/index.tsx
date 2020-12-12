import React from "react";
import ReactDOM from "react-dom";
import firebase from "firebase/app";
import "firebase/auth";

import reportWebVitals from "./utils/reportWebVitals";
import Location from "./components/Location";
import Reps from "./components/Reps";
import Script from "./components/Script";
import Outcomes from "./components/Outcomes";
import Share from "./components/Share";
import StateProvider from "./state/stateProvider";
import "./utils/staticUtils";

firebase.initializeApp({
  apiKey: "AIzaSyCqbgwuM82Z4a3oBzzmPgi-208UrOwIgAA",
  authDomain: "southern-zephyr-209101.firebaseapp.com",
  databaseURL: "https://southern-zephyr-209101.firebaseio.com",
  projectId: "southern-zephyr-209101",
  storageBucket: "southern-zephyr-209101.appspot.com",
  messagingSenderId: "919201105905",
  appId: "1:919201105905:web:cb16c071be2bb896dfa650",
});

const handleRootRenderError = (error: any, component: string) => {
  if (`${error}`.includes("Minified React error #200")) {
    // nbd, we're on a page where no reps element is
  } else if (`${error}`.includes("Target container is not a DOM element.")) {
    // dev version of above
  } else {
    console.error(`error loading ${component} component: ${error}`);
  }
};

let firebaseAuthStartedUp = false;
firebase.auth().onAuthStateChanged((user) => {
  // console.log("auth state change with user:", user);

  if (!user) {
    firebase
      .auth()
      .signInAnonymously()
      .then((user) => {
        // ok user signed in
      })
      .catch((error) => {
        console.log("error signing in user", error);
      });
  }

  // only run the initial react renders once
  if (!firebaseAuthStartedUp) {
    startComponentRenders();
  }
  firebaseAuthStartedUp = true;
});

const startComponentRenders = () => {
  try {
    ReactDOM.render(
      <React.StrictMode>
        <StateProvider>
          <Location />
        </StateProvider>
      </React.StrictMode>,
      document.getElementById("react-location")
    );
  } catch (error) {
    handleRootRenderError(error, "location");
  }

  try {
    ReactDOM.render(
      // we disabled strict mode here because we use findDOMNode in a very safe way (hopefully)
      <StateProvider>
        <Reps />
      </StateProvider>,
      document.getElementById("react-reps")
    );
  } catch (error) {
    handleRootRenderError(error, "reps");
  }

  try {
    ReactDOM.render(
      <StateProvider>
        <Script />
      </StateProvider>,
      document.getElementById("react-script")
    );
  } catch (error) {
    handleRootRenderError(error, "script");
  }

  try {
    ReactDOM.render(<Outcomes />, document.getElementById("react-outcomes"));
  } catch (error) {
    handleRootRenderError(error, "outcomes");
  }

  try {
    ReactDOM.render(<Share />, document.getElementById("react-share"));
  } catch (error) {
    handleRootRenderError(error, "share");
  }
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
