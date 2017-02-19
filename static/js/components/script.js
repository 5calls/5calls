const html = require('choo/html');
const find = require('lodash/find');
const gender = require('gender-detection');
const scriptLine = require('./scriptLine.js');

module.exports = (contact, state, prev, send) => {
	  const issue = find(state.issues, ['id', state.location.params.issueid]);
	  const currentContact = issue.contacts[state.contactIndex];

    const repGender = gender.detect(contact.name);
    const titleMap = { male: 'Mr. ', female: 'Ms. ', unisex: '' };
    const pronounMap = { male: 'him', female: 'her', unisex: 'them' };
    const repTitle = titleMap[repGender];
    const formalName = `${repTitle}${contact.name.split(' ').pop()}`;

    const scriptFormatter = (issue) =>
      issue.script.replace('[him/her]', pronounMap[repGender])
                  .replace('[Senator/Rep’s Name]', formalName)
                  .replace('[Senator/Rep\'s Name]', formalName)
                  .replace('[Senator’s Name]', formalName)
                  .replace('[Senator\'s Name]', formalName)
                  .split('\n').map((line) => scriptLine(line, state, prev, send));

    if (currentContact != null) {
      return html`
      <div class="call__script">
        <h3 class="call__script__header">Your script:</h3>
        <div class="call__script__body">${scriptFormatter(issue)}</div>
      </div>`
    } else {
      return html``
    }
}
