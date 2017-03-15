const html = require('choo/html');
const t = require('../utils/translation');
const constants = require('../constants');

module.exports = (state, prev, send) => {
  return html`
  <h2 class="callcount" onload=${(e) => send('getTotals')}>
      ${t.getText("callCount.callCountPhrase", {formattedCallsTotal: callCount(state), totalCalls: callCountAsNumber(state)})}
  </h2>
  `;

  function callCountAsNumber(state){
    let calls = Number(state.totalCalls);
    // Handle undefined input.
    // Number(undefined) is NaN, while Number("") is 0
    return isNaN(calls) ? 0 : calls;    
  }


  function callCount(state) {
    let calls = callCountAsNumber(state);
    // Number.toLocaleString() doesn't work on Safari 9 (see https://github.com/5calls/5calls/issues/197)
    if (window.Intl && typeof Intl.NumberFormat == 'function') {
      return calls.toLocaleString();
    } else {
      // As a fallback, use a quick-and-dirty regex to insert commas.
      // When in doubt, get code from stackoverflow: http://stackoverflow.com/a/2901298/7542666
      return calls.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}
