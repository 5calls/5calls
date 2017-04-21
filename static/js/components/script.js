const html = require('choo/html');
const t = require('../utils/translation');

const find = require('lodash/find');
const scriptLine = require('./scriptLine.js');

module.exports = (state, prev, send) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);
  const currentIndex = state.contactIndices[issue.id];
  const currentContact = issue.contacts[currentIndex];
    
  if (currentContact != null) {
    return html`
      <div class="call__script">
        <h3 class="call__script__header">${t("script.yourScript")}</h3>
        <div class="call__script__body">${issue.script.split('\n').map((line) => scriptLine(line, state, prev, send))}</div>
      </div>`;      
  } else {
    return html``;
  }
};