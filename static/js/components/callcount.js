const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
  <h2 class="callcount" onload=${(e) => send('getTotals')}>
    Together we've made ${state.totalCalls.toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} calls
  </h2>
  `;
}
