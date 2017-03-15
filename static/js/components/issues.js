const html = require('choo/html');
const t = require('../utils/translation');
const scrollIntoView = require('scroll-into-view');

const issuesHeader = require('./issuesHeader.js');
const issuesList = require('./issuesList.js');

module.exports = (state, prev, send) => {
	function debugText(debug) {
    return debug ? html`<a href="#" onclick=${resetCompletedIssues}>${t.getText("common.reset")}</a>` : html``;
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
