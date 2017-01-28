const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
    <div class="issues__subtitle">
    ${pretext(state)}
    </div>
  `;

  function pretext(state) {
    if (state.askingLocation) {
      return html`<p><form onsubmit=${submitAddress}>Enter an address or zip code: <input autofocus="true" name="address" /><button>Go</button></form></p>`
    } else {
      if (state.address != '') {
        return html`<p>Included reps for ${state.address} • <a href="#" onclick=${unsetLocation}>Change</a></p>`
      } else if (state.cachedCity != '') {
        return html`<p>We’ve included reps for ${state.cachedCity} • <a href="#" onclick=${enterLocation}>Change</a> ${debugText(state.debug)}</p>`
      } else {
        return html`<p>Couldn’t find your location. <a href="#" onclick=${enterLocation}>Change</a></p>`
      }
    }
  }

  function debugText(debug) {
    return debug ? html`<a href="#" onclick=${unsetLocation}>reset</a>` : html``;
  }

  function submitAddress(e) {
    e.preventDefault();
    address = this.elements["address"].value;

    send('setLocation', address);
  }

  function enterLocation(e) {
    send('enterLocation');
  }

  function unsetLocation() {
    send('unsetLocation');
  }
}