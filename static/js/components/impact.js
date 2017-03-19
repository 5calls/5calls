const html = require('choo/html');
const impactTotal = require('./impactTotal.js');

module.exports = (state, prev, send) => {
  return html`
    <main id="content" role="main" aria-live="polite" class="layout__main" onload=${(e) => send('startup')}>
    <section class="impact">
      <h2 class="impact__title">My Impact</h2>

      ${impactTotal(state, prev, send)}
    </section>
    </main>
  `;
}
