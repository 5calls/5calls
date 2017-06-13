const html = require('choo/html');
const scriptLine = require('./scriptLine.js');

const find = require('lodash/find');

module.exports = (state) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);

  const currentIndex = state.contactIndices[issue.id];
  const currentContact = issue.contacts[currentIndex];

  // Replacement regexes, ideally standardize copy to avoid complex regexs
  const titleReg = /\[REP\/SEN NAME\]|\[SENATOR\/REP NAME\]/gi;
  const locationReg = /\[CITY,\s?ZIP\]|\[CITY,\s?STATE\]/gi;

  function format() {
    let script = issue.script;

    let location = state.cachedCity;
    let title = '';
    if (currentContact.area == 'House') {
      title = 'Rep. ' + currentContact.name;
    } else if (currentContact.area == 'Senate') {
      title = 'Senator ' + currentContact.name;
    }

    if (title) {
      script = script.replace(titleReg, title);
    }
    if (location) {
      script = script.replace(locationReg, location);
    }

    return script.split('\n').map((line) => scriptLine(line));
  }

  return html`
    <div class="call__script__body">
      ${format()}
    </div>
  `;
};