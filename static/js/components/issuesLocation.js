const html = require('choo/html');
const t = require('../utils/translation');

module.exports = (state, prev, send) => {
  if ((state.askingLocation && !state.fetchingLocation) ||
      state.invalidAddress) {
    send('focusLocation');
  }

  return html`
    <div class="issues__location">
    ${pretext(state)}
    ${addressFormOrButton(state)}
    </div>
  `;

  function pretext(state) {
    if (state.fetchingLocation || state.validatingLocation) {
      return html`<p id="locationMessage" class="loadingAnimation">${t("location.gettingYourLocation")}</p>`;
    } else if (state.askingLocation) {
      return html`<p id="locationMessage">${t("location.chooseALocation")}</p>`;
    } else if (state.invalidAddress) {
      return html`<p id="locationMessage" role="alert">${t("location.invalidAddress")}</p>`;
    } else if (state.address) {
      return html`<p id="locationMessage">${t("location.yourLocation")}: <span>${state.address}</span></p>`;
    } else if (state.cachedCity) {
      return html`<p id="locationMessage">${t("location.yourLocation")}: <span>${state.cachedCity}</span> ${debugText(state.debug)}</p>`;
    } else {
      return html`<p id="locationMessage">${t("location.chooseALocation")}</p>`;
    }
  }

  function addressFormOrButton(state) {
    if (!state.askingLocation &&
        !state.fetchingLocation &&
        !state.invalidAddress &&
        !state.validatingLocation &&
        (state.address ||
         state.cachedCity)) {
      return html`<p><button onclick=${enterLocation}>${t("location.changeLocation")}</button></p>`;
    } else {
      const className = (state.fetchingLocation) ? 'hidden' : '';
      return html`<p>
      <form onsubmit=${submitAddress} class=${className}>
        <input type="text" autofocus="true" id="address" name="address" \
          aria-labelledby="locationMessage" aria-invalid=${state.invalidAddress} \
          disabled=${state.validatingLocation}
          placeholder=${t("location.enterAnAddressOrZipCode", null, true)} />
        <button>${t("common.go", null, true)}</button>
      </form></p>`;
    }
  }

  function debugText(debug) {
    return debug ? html`<button onclick=${unsetLocation}>reset</button>` : html``;
  }

  function submitAddress(e) {
    e.preventDefault();
    const address = this.elements["address"].value;

    send('setLocation', address);
  }

  function enterLocation(e) {
    e.preventDefault();
    send('enterLocation');
  }

  function unsetLocation() {
    send('unsetLocation');
  }
};
