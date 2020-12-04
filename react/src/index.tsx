import React from "react";
import ReactDOM from "react-dom";

import reportWebVitals from "./utils/reportWebVitals";
import Location from "./components/Location";
import Reps from "./components/Reps";
import Script from "./components/Script";
import Outcomes from "./components/Outcomes";
import StateProvider from "./state/stateProvider";

const handleRootRenderError = (error: any, component: string) => {
  if (`${error}`.includes("Minified React error #200")) {
    // nbd, we're on a page where no reps element is
  } else if (`${error}`.includes("Target container is not a DOM element.")) {
    // dev version of above
  } else {
    console.error(`error loading ${component} component: ${error}`);
  }
};

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
