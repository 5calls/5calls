const html = require('choo/html');
const t = require('../utils/translation');

module.exports = (state, prev, send) => {
  function initializeLocalizedAnchors(targetClassName) {
    let els = document.getElementsByClassName(`${targetClassName}`);
    if (els.length >= 1) {
      els[0].addEventListener("click", (e)=>enterLocation(e), false);
    }
  }

  function enterLocation(e) {
    e.preventDefault();
    send('enterLocation');
  }

  function noContactsMessage(state) {
    const targetClassName = 'location-link';
    if (state.splitDistrict && (state.address || state.cachedCity)) {
      return html`<div onload=${() => initializeLocalizedAnchors(targetClassName)}>
                    <p>${t("noContact.oneOfTwoDistricts")}</p>
                    <p>${t("noContact.enterYourLocation")}</p>
                  </div>`;
    }
    else {
      return html`<h2 onload=${() => initializeLocalizedAnchors(targetClassName)}>${t("noContact.setYourLocation")}</h2>`;
    }
  }

  return html`
    <div class="call__nocontact">
		  ${noContactsMessage(state)}
	  </div>`;
};