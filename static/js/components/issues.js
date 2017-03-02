const html = require('choo/html');

const issuesHeader = require('./issuesHeader.js');
const issuesList = require('./issuesList.js');

module.exports = (state, prev, send) => {
	function debugText(debug) {
    return debug ? html`<a href="#" onclick=${resetCompletedIssues}>reset</a>` : html``;
  }

  function resetCompletedIssues() {
    send('resetCompletedIssues');
    send('resetUserStats');
  }

  return html`
    <div class="issues">
      ${issuesHeader(state, prev, send)}
      ${issuesList(state, prev, send)}
      ${debugText(state.debug)}
    </div>
  `;
}
