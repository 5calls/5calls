const html = require('choo/html');
const t = require('../utils/translation');
const find = require('lodash/find');

module.exports = (state, prev, send) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);
  const currentIndex = state.contactIndices[issue.id];
  const currentContact = issue.contacts[currentIndex];

  const contactsLeft = issue.contacts.length - (currentIndex + 1);

  const contactsLeftText =  t("outcomes.contactsLeft", { "contactsRemaining": contactsLeft}); 

  function outcome(e, result) {
    e.target.blur();

    if (result == null) {
      send('skipCall', { issueid: issue.id });
    } else {
      send('callComplete', { result: result, contactid: currentContact.id, issueid: issue.id });
    }

    return true;
  }

  if (currentContact != null) {
    return html`<div class="call__outcomes">
      <h3 class="call__outcomes__header">${t("outcomes.enterYourCallResult")}</h3>
      <div class="call__outcomes__items">
        <button onclick=${(e) => outcome(e, 'unavailable')}>${t("outcomes.unavailable")}</button>
        <button onclick=${(e) => outcome(e, 'vm')}>${t("outcomes.voicemail")}</button>
        <button onclick=${(e) => outcome(e, 'contacted')}>${t("outcomes.madeContact")}</button>
        <button onclick=${(e) => outcome(e)}>${t("outcomes.skip")}</button>
      </div>

      ${contactsLeft > 0 ? html`<h3 aria-live="polite" class="call__contacts__left" >${contactsLeftText}</h3>` : null}
    </div>`;
  } else {
    return html``;
  }
};
