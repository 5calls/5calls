const html = require('choo/html');
const find = require('lodash/find');
const promote = require('./promote.js');
const callcount = require('./callcount.js');


module.exports = (state, prev, send) => {
    const issue = find(state.issues, ['id', state.location.params.issueid]);

  return html`
    <main role="main" class="layout__main" onload=${(e) => send('startup')}>
    <section class="call">
      <div class="call_complete">
        <h2 class="call__title">Great work!</h2>
        <p class="call__text">
          Pick another issue to keep calling, or spread the word by sharing your work with friends:
        </p>
        ${promote(state, prev, send, issue)}

        <p class="call__text"> <a href="#about">Learn why calling</a> representatives is the most effective way of making your voice heard.</p>

        ${callcount(state, prev, send)}

      </div>


    </section>
    </main>
  `;
}
