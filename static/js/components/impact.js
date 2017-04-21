const html = require('choo/html');
const t = require('../utils/translation');
const impactTotal = require('./impactTotal.js');
const impactResult= require('./impactResult.js');
const callcount = require('./callcount.js');
const scrollIntoView = require('../utils/scrollIntoView.js');

module.exports = (state, prev, send) => {

  function load() {
    scrollIntoView(document.querySelector('#content'));
    send('startup');
  }

  return html`
    <main id="content" role="main" aria-live="polite" class="layout__main" onload=${load}>
    <section class="impact">
      <h2 class="impact__title">${t('impact.title')}</h2>

      ${impactTotal(state, prev, send)}
      <p class="impact__text">${t('impact.text')}</p>
      ${impactResult(state, prev, send)}
      ${callcount(state, prev, send)}

    </section>
    </main>
  `;
};
