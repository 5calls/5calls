const html = require('choo/html');
const scrollIntoView = require('../utils/scrollIntoView.js');

const issuesHeader = require('./issuesHeader.js');
const issuesList = require('./issuesList.js');

module.exports = (state, prev, send) => {
	function debugText(debug) {
    return debug ? html`<a href="#" onclick=${resetCompletedIssues}>reset</a>` : html``;
  }

  function resetCompletedIssues() {
    send('resetCompletedIssues');
  }

  function scrollToTop () {
    scrollIntoView(document.querySelector('#content'))
  }

  return html`
    <div class="issues">
      ${issuesHeader(state, prev, send)}
      ${issuesList(state, prev, send)}
      <a href="#issues" class="issues__footer-link" onclick=${scrollToTop}>view more issues</a>
      ${debugText(state.debug)}
    </div>
  `;
}
