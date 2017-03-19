const html = require('choo/html');

module.exports = (state, prev, send) => {
  const userCalls = state.userStats.all.length;

  if (userCalls > 0) {
    return html`
      <h2 class="impactTotals">
        Your impact is ${userCalls} call${ userCalls > 1 ? "s" : "" }!
      </h2>
    `;
  } else {
    return html``;
  }
}
