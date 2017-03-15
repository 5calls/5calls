const html = require('choo/html');
const t = require('../utils/translation');

const callcount = require('./callcount.js');
const promote = require('./promote.js');

module.exports = (state, prev, send) => {
  // TODO: separate this out into straight up content and stats
  return html`
    <div class="hypothesis" onload=${(e) => send('getTotals')}>
      <header class="hypothesis__header">
        <h2 class="hypothesis__title">${t.getText('hypothesis.title')}</h2>
        <p>${t.getText('hypothesis.p1')}</p>
        <p><strong>${t.getText('hypothesis.p2')}</strong></p>

        ${promote(state, prev, send)}
      </header>

      <div class="hypothesis__text">
        <p>${t.getText('hypothesis.p3')}</p>
        <h3 class="hypothesis__subtitle">${t.getText('hypothesis.featuresTitle')}</h3>

        <ul class="hypothesis__list">
        <li>${t.getText('hypothesis.feature1')}</li>
        <li>${t.getText('hypothesis.feature2')}</li>
        </ul>

        <h3 class="hypothesis__subtitle">${t.getText('hypothesis.getApp')}</h3>

        <ul class="hypothesis__apps">
        <li><a href="https://itunes.apple.com/us/app/5-calls/id1202558609?mt=8"><img class="ios" src="/img/app-store.svg" alt="5 Calls on the App Store" /></a></li>
        <li><a href="https://play.google.com/store/apps/details?id=org.a5calls.android.a5calls&hl=en"><img class="play" src="/img/google-play-badge.png" alt="5 Calls on Google Play" /></a></li>
        </ul>
      </div>

      ${callcount(state, prev, send)}

    </div>
  `;
}
