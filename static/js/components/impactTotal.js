const html = require('choo/html');

module.exports = (state, prev, send) => {
  const userCalls = state.userStats.all.length;

  return html`
    <h2 class="impact_total">
      You have made <span>${userCalls} call${ userCalls != 1 ? "s" : "" }</span>!
    </h2>
  `;
}
