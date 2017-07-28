const html = require('choo/html');
const t = require('../utils/translation');

const tracker = require('./tracker.js');

module.exports = (state, prev, send) => {
  // TODO: separate this out into straight up content and stats
  return html`
    <div class="hypothesis" onload=${() => send('getTotals')}>
      <header class="hypothesis__header">
        <h2 class="hypothesis__title">${t('hypothesis.title')}</h2>
        <p>${t('hypothesis.p1')}</p>
      </header>

      ${tracker(state,prev,send)}

    </div>
  `;
};
