const html = require('choo/html');
const t = require('../utils/translation');

const find = require('lodash/find');

module.exports = (state, prev, send) => {
  function initializeFragment(e) {
    keys = ['lnkEnterAddress', 'lnkSetYourLocation'];
    keys.map((k) => {
      let el = document.getElementById(`${k}`);
      if (el) {
        el.addEventListener("click", (e)=>enterLocation(e), false);
      }
    });
  }

  function enterLocation(e) {
    e.preventDefault();
    send('enterLocation');
  }

  function noContactsMessage(state) {
    if (state.splitDistrict && (state.address || state.cachedCity)) {
      return html`<div onload=${(e) => initializeFragment(e)}>
                    <p>${t.getText("noContact.oneOfTwoDistricts")}</p>
                    <p>${t.getText("noContact.enterYourLocation")}</p>
                  </div>`
    }
    else {
      return html`<h2 onload=${(e) => initializeFragment(e)}>${t.getText("noContact.setYourLocation")}</h2>`
    }
  }

  return html`
    <div class="call__nocontact">
		  ${noContactsMessage(state)}
	  </div>`
}