const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
  <h2 class="callcount" onload=${(e) => send('getTotals')}>
    Together we’ve made ${Number(state.totalCalls).toLocaleString()} calls
  </h2>
  `;
}
