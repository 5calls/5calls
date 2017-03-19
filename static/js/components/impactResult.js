const html = require('choo/html');

module.exports = (state, prev, send) => {
  const contactedCalls = state.userStats.contacted;
  const vmCalls = state.userStats.vm;
  const unavailableCalls = state.userStats.unavailable;

  return html`
    <div class="impact_result">
      <h2>Made Contact: ${contactedCalls} time${ contactedCalls != 1 ? "s" : "" }</h2>
      <h2>Left Voicemail: ${vmCalls} time${ vmCalls != 1 ? "s" : "" }</h2>
      <h2>Unavailable: ${unavailableCalls} time${ unavailableCalls != 1 ? "s" : "" }</h2>
    </div>
  `;
}
