const html = require('choo/html');

module.exports = (state) => {
  const contactedCalls = state.userStats.contacted;
  const vmCalls = state.userStats.vm;
  const unavailableCalls = state.userStats.unavailable;

  return html`
    <p class="impact_result">
      You have <span>made contact ${contactedCalls} time${ contactedCalls != 1 ? "s" : "" }</span>
      and left <span>${vmCalls} voicemail${ vmCalls != 1 ? "s" : "" }</span>.
      Your representatives have been unavailable <span>${unavailableCalls} time${ unavailableCalls != 1 ? "s" : "" }</span>.
    </p>
  `;
}
