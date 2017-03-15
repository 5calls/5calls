const html = require('choo/html');
const t = require('../utils/translation');
const find = require('lodash/find');

module.exports = (state, prev, send) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);
  const currentIndex = state.contactIndices[issue.id];
  const currentContact = issue.contacts[currentIndex];

  const contactsLeft = issue.contacts.length - (currentIndex + 1);
  //const callsPluralization = contactsLeft > 1 ? "people" : "person";

  const contactsLeftText =  t.getText("outcomes.contactsLeft", { "contactsRemaining": contactsLeft}); //contactsLeft + " more " + callsPluralization +" to call for this issue.";

  function outcome(result) {
    if (result == null) {
      send('skipCall', { issueid: issue.id });
    } else {
      send('callComplete', { result: result, contactid: currentContact.id, issueid: issue.id });
    }
  }

  if (currentContact != null) {
    return html`<div class="call__outcomes">
      <h3 class="call__outcomes__header">${t.getText("outcomes.enterYourCallResult")}</h3>
      <div class="call__outcomes__items">
        <button onclick=${() => outcome('unavailable')}>${t.getText("outcomes.unavailable")}</button>
        <button onclick=${() => outcome('vm')}>${t.getText("outcomes.voicemail")}</button>
        <button onclick=${() => outcome('contacted')}>${t.getText("outcomes.madeContact")}</button>
        <button onclick=${() => outcome()}>${t.getText("outcomes.skip")}</button>
      </div>

      ${contactsLeft > 0 ? html`<h3 aria-live="polite" class="call__contacts__left" >${contactsLeftText}</h3>` : null}
    </div>`
  } else {
    return html``
  }
}
