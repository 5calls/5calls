const html = require('choo/html');

module.exports = (state, prev, send) => {
  const userCalls = (state.userStats) ? state.userStats.all.length : 0;

  if (userCalls > 0) {
    return html`
      <h2 class="userstats">
        Your impact is ${userCalls} calls!
      </h2>
    `;
  } else {
    return html``;
  }
}
