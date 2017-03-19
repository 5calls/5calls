const html = require('choo/html');
const stats = require('./stats.js');

module.exports = (state, prev, send) => {
  return html`
    <main id="content" role="main" aria-live="polite" class="layout__main" onload=${(e) => send('startup')}>
    <section class="impact">
      <h2 class="impact__title">My Impact</h2>

      ${stats(state, prev, send)}
    </section>
    </main>
  `;
}
