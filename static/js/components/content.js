const html = require('choo/html');

const hypothesis = require('./hypothesis.js');
const about    = require('./about.js');
const call       = require('./call.js');

module.exports = (state, prev, send) => {
  const currentView = state.location.params.issueid != null && state.issues.length > 0 ? call : infoPages();

  function infoPages() {
    if (state.getInfo == true) {
      return about;
    }

    return hypothesis;
  }

  return html`
    <main id="content" role="main" aria-live="polite" class="layout__main" onload=${() => send('startup')}>
      ${currentView(state, prev, send)}
    </main>
  `;
};
