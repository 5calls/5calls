const html = require('choo/html');
const t = require('../utils/translation');

const find = require('lodash/find');
const scriptFormat = require('./scriptFormat.js');
const issuesLink = require('./issuesLink.js');

module.exports = (state, prev, send) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);
  const currentIndex = state.contactIndices[issue.id];
  const currentContact = issue.contacts[currentIndex];
    
  if (currentContact != null) {
    return html`
      <div class="call__script">
        <h3 class="call__script__header">${t("script.yourScript")}</h3>
        ${scriptFormat(state, prev, send)}
        ${issuesLink(state, prev, send)}
      </div>`;
  } else {
    return html``;
  }
};
