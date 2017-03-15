const html = require('choo/html');
const t = require('../utils/translation');

const find = require('lodash/find');
const promote = require('./promote.js');
const callcount = require('./callcount.js');


module.exports = (state, prev, send) => {
    const issue = find(state.issues, ['id', state.location.params.issueid]);

  return html`
    <main role="main" class="layout__main" onload=${(e) => send('startup')}>
    <section class="call">
      <div class="call_complete">
        <h2 class="call__title">${t.getText('callComplete.title')}</h2>
        <p class="call__text">${t.getText('callComplete.pickAnotherIssue')}</p>
        ${promote(state, prev, send)}

        <p class="call__text"> ${t.getText('callComplete.learnWhyCallingIsGreat')}</p>

        ${callcount(state, prev, send)}

      </div>


    </section>
    </main>
  `;
}
