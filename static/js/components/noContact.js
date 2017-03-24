const html = require('choo/html');

module.exports = (state, prev, send) => {
  function enterLocation(e) {
    e.preventDefault();
    send('enterLocation');
  }

  function noContactsMessage(state) {
    if (state.splitDistrict && (state.address || state.cachedCity)) {
      return html`<div>
                    <p>The location you provided could be in one of two congressional districts.</p>
                    <p><a onclick=${(e) => enterLocation(e)}>Enter your address</a> to identify your representative in the House.</p>
                  </div>`
    }
    else {
      return html`<h2><a onclick=${(e) => enterLocation(e)}>Set your location</a> to find your representatives</h2>`
    }
  }

	return html`
    <div class="call__nocontact">
		  ${noContactsMessage(state)}
	  </div>`
}