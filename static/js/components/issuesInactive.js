const html = require('choo/html');
const find = require('lodash/find');

const issuesListInactive = require('./issuesListInactive.js');

module.exports = (state, prev, send) => {

  return html`
    <main role="main" id="content" class="layout__main" onload=${(e) => {
      send('startup')
      send('fetchInactiveIssues')
    }}>
      <section class="call">
        <div class="call_complete">
          <h2 class="call__title">More Issues</h2>
          ${issuesListInactive(state, prev, send)}
        </div>
      </section>
    </main>
  `;
}
