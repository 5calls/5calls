const html = require('choo/html');
const t = require('../utils/translation');
const promote = require('./promote.js');
const callcount = require('./callcount.js');
const impactTotal = require('./impactTotal.js');


module.exports = (state, prev, send) => {
  const userCalls = state.userStats.all.length;

  let impactPreview = html``;
  if (userCalls > 0) {
    impactPreview = html`
      <div>
        ${impactTotal(state, prev, send)}
        <h2>See more stats on <a href="/impact">your impact</a>.</h2>
      </div
    `;
  }

  return html`
    <main id="content" role="main" class="layout__main" onload=${() => send('startup')}>
    <section class="call">
      <div class="call_complete">
        <h2 class="call__title">${t('callComplete.title')}</h2>
        ${impactPreview}
        <p class="call__text">${t('callComplete.pickAnotherIssue')}</p>
        ${promote(state, prev, send)}
        <p class="call__text"> ${t('callComplete.learnWhyCallingIsGreat')}</p>
        ${callcount(state, prev, send)}
      </div>
    </section>
    </main>
  `;
};
