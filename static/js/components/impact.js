const html = require('choo/html');
const impactTotal = require('./impactTotal.js');
const impactResult= require('./impactResult.js');
const callcount = require('./callcount.js');

module.exports = (state, prev, send) => {

  return html`
    <main id="content" role="main" aria-live="polite" class="layout__main" onload=${(e) => send('startup')}>
    <section class="impact">
      <h2 class="impact__title">My Impact</h2>

      ${impactTotal(state, prev, send)}
      <p class="impact__text">
        That's awesome and you should feel awesome. <br>
        Every call counts!
      </p>
      ${impactResult(state, prev, send)}
      ${callcount(state, prev, send)}

    </section>
    </main>
  `;
}
