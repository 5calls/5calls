const html = require('choo/html');
const t = require('../utils/translation');
const formatting = require('../utils/formatting');

module.exports = (state, prev, send) => {
  return html`
  <h2 class="callcount" onload=${() => send('getTotals')}>
      ${t("callCount.callCountPhrase", {formattedCallsTotal: formatting.prettyCount(state.totalCalls), totalCalls: formatting.asNumber(state.totalCalls)})}
  </h2>
  `;
};
