const html = require('choo/html');
const t = require('../utils/translation');

module.exports = (state) => {
  const contactedCalls = state.userStats.contacted;
  const vmCalls = state.userStats.vm;
  const unavailableCalls = state.userStats.unavailable;
  return html`
    <div class="impact_result">
     ${t('impact.callSummaryText', {contactedCalls: contactedCalls, vmCalls: vmCalls, unavailableCalls: unavailableCalls}, false, true)}
    </div>
  `;
};
