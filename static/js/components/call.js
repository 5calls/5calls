const html = require('choo/html');
const find = require('lodash/find');
const contact = require('./contact.js');
const scriptLine = require('./scriptLine.js');

module.exports = (state, prev, send) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);

  if (issue == null) {
    return html`<section class="call">
      <div class="call_complete">
        <h2 class="call__complete__title">No issue here</h2>
        <p class="call__complete__text">I couldn’t find the issue for this url, it may have expired. Pick one of our current issues on the left side.</p>
      </div>
    </section>`;
  }
  const currentContact = issue.contacts[state.contactIndex];

  const contactsLeft = issue.contacts.length - (state.contactIndex + 1);
  const callsPluralization = contactsLeft > 1 ? "s" : "";

  const contactsLeftText = contactsLeft > 0 ? contactsLeft + " call"+ callsPluralization +" left" : "This is the last contact";

  function outcome(result) {
    if (result == null) {
      send('skipCall', { issueid: issue.id });
    } else {
      send('callComplete', { result: result, contactid: currentContact.id, issueid: issue.id });
    }
  }

  return html`
  <section class="call">
    <header class="call__header">
      <h2 class="call__title">${issue.name}</h2>
      <h3 class="call__reason">${issue.reason.split('\n').map((line) => scriptLine(line, state, prev, send))}</h2>
    </header>

    ${contact(currentContact, state, prev, send)}

    <div class="call__script">
      <h3 class="call__script__header">Your script:</h3>
      <div class="call__script__body">${issue.script.split('\n').map((line) => scriptLine(line, state, prev, send))}</div>
    </div>

    <div class="call__outcomes">
      <h3 class="call__outcomes__header">Enter your call result to get the next call:</h3>
      <div class="call__outcomes__items">
        <button onclick=${() => outcome('unavailable')}>Unavailable</button>
        <button onclick=${() => outcome('vm')}>Left Voicemail</button>
        <button onclick=${() => outcome('contacted')}>Made Contact</button>
        <button onclick=${() => outcome()}>Skip</button>
      </div>
    </div>

    <div class="call__promote">
      <p>${contactsLeftText} for this issue • <a target="_blank" href="https://twitter.com/intent/tweet?text=Make%205%20calls%20today%20to%20change%20your%20government%20http%3A%2F%2Fbit.ly%2F2iJb5nH&source=webclient&via=make5calls"><i class="fa fa-twitter" aria-hidden="true"></i> Tweet this issue</a> • <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http://bit.ly/2iJb5nH"><i class="fa fa-facebook" aria-hidden="true"></i> Share this issue</a></p>
    </div>
  </section>
  `;
}
