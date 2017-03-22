const html = require('choo/html');

module.exports = (state, prev, send) => {
  if (state.askingLocation && !state.fetchingLocation) {
    send('focusLocation');
  }

  return html`
    <div class="issues__location">
    ${pretext(state)}
    ${addressForm(state)}
    </div>
  `;

  function pretext(state) {
    if (state.fetchingLocation) {
      return html`<p class="loadingAnimation">Getting your location</p>`;
    } else if (state.askingLocation) {
      return html``;
    } else if (state.invalidAddress) {
      return html`<p><button class="subtle-button" onclick=${enterLocation}>That address is invalid, please try again</button></p>`;
    } else if (state.address) {
      return html`<p>for <button class="subtle-button" onclick=${enterLocation}>${state.address}</button></p>`;
    } else if (state.cachedCity) {
      return html`<p>for <button class="subtle-button" onclick=${enterLocation}> ${state.cachedCity}</button> ${debugText(state.debug)}</p>`;
    } else {
      return html`<p><button class="subtle-button" onclick=${enterLocation}>Choose a location</button></p>`;
    }
  }

  function addressForm(state) {
    const className = (state.askingLocation && !state.fetchingLocation) ? '' : 'hidden';
    return html`<p><form onsubmit=${submitAddress} class=${className}><input type="text" autofocus="true" id="address" name="address" placeholder="Enter an address or zip code" /> <button>Go</button></form></p>`;
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
