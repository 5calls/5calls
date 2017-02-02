const html = require('choo/html');
const find = require('lodash/find');
const contact = require('./contact.js');
const noContact = require('./noContact.js');
const script = require('./script.js');
const outcomes = require('./outcomes.js');
const scriptLine = require('./scriptLine.js');
const promote = require('./promote.js');

module.exports = (state, prev, send) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);

  if (issue == null) {
    return html`<section class="call">
      <div class="call_complete">
        <h2 class="call__title">No calls to make</h2>
        <p class="call__text">
          This issue is no longer relevant, or the URL you used to get here was wrong. If you clicked a link on this site to get here, <a href="mailto:make5calls@gmail.com">please tell us</a> so we can fix it!
        </p>
        <p class="call__text">
          Next choose a different issue from the list to make calls about.
        </p>
      </div>
    </section>`;
  }
  const currentContact = issue.contacts[state.contactIndex];

  function contactArea() {
    if (currentContact != null) {
      return contact(currentContact, state, prev, send)
    } else {
      return noContact(state, prev, send)
    }
  }

  return html`
  <section class="call">
    <header class="call__header">
      <h2 class="call__title">${issue.name}</h2>
      <div class="call__reason">${issue.reason.split('\n').map((line) => scriptLine(line, state, prev, send))}</div>
    </header>

    ${contactArea()}

    ${script(state, prev, send)}

    ${outcomes(state, prev, send)}

    ${promote(state, prev, send, issue)}

  </section>
  `;
}
