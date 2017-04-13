const html = require('choo/html');

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
      return html`<p id="locationMessage" class="loadingAnimation">Getting your location</p>`;
    } else if (state.askingLocation) {
      return html`<p id="locationMessage">Enter your location</p>`;
    } else if (state.invalidAddress) {
      return html`<p id="locationMessage" role="alert">That address is invalid, please try again</p>`;
    } else if (state.address) {
      return html`<p id="locationMessage">Your location: <span>${state.address}</span></p>`;
    } else if (state.cachedCity) {
      return html`<p id="locationMessage">Your location: <span>${state.cachedCity}</span> ${debugText(state.debug)}</p>`;
    } else {
      return html`<p id="locationMessage">Enter your location</p>`;
    }
  }

  function addressFormOrButton(state) {
    if (!state.askingLocation &&
        !state.fetchingLocation &&
        !state.invalidAddress &&
        !state.validatingLocation &&
        (state.address ||
         state.cachedCity)) {
      return html`<p><button onclick=${enterLocation}>Change location</button></p>`;
    } else {
      const className = (state.fetchingLocation) ? 'hidden' : '';
      return html`<p>
      <form onsubmit=${submitAddress} class=${className}>
        <input type="text" autofocus="true" id="address" name="address" \
          aria-labelledby="locationMessage" aria-invalid=${state.invalidAddress} \
          disabled=${state.validatingLocation}
          placeholder="Enter an address or zip code" />
        <button>Go</button>
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
}
