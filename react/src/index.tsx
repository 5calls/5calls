import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Reps from './Reps';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('location')
);

try {
  ReactDOM.render(
    <React.StrictMode>
      <Reps />
    </React.StrictMode>,
    document.getElementById('reps')
  );  
}
catch (error) {
  if (`${error}`.includes("Minified React error #200")) {
    // nbd, we're on a page where no reps element is
  } else {
    console.error("error loading reps component:",error);
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
