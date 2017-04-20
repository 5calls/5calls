const html = require('choo/html');
const t = require('../utils/translation');
const scrollIntoView = require('../utils/scrollIntoView.js');

const issuesHeader = require('./issuesHeader.js');
const issuesList = require('./issuesList.js');

module.exports = (state, prev, send) => {
	function debugText(debug) {
    return debug ? html`<a href="/" onclick=${resetCompletedIssues}>reset</a>` : html``;
  }

  function resetCompletedIssues() {
    send('resetCompletedIssues');
    send('resetUserStats');
  }

  function scrollToTop () {
    scrollIntoView(document.querySelector('#content'))
  }

  return html`
    <div class="issues">
      ${issuesHeader(state, prev, send)}
      ${issuesList(state, prev, send)}
      <a href="/more" class="issues__footer-link" onclick=${scrollToTop}>${t("issues.viewMoreIssues")}</a>
      ${debugText(state.debug)}
    </div>
  `;
}
