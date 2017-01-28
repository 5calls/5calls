const html = require('choo/html');
const find = require('lodash/find');

module.exports = (c, state, prev, send) => {
  const photoURL = c.photoURL == "" ? "/img/generic-small.png" : c.photoURL;
  const reason = c.reason == "" ? "This organization is related to the issue." : c.reason;

  repID = ""
  if (c.party != "") {
    repID = c.party.substring(0,1) + "-" + c.state;
  }

	return html`
      <div class="call__contact" id="contact">
        <div class="call__contact__image"><div class="crop"><img src="${photoURL}"/></div></div>
        <p class="call__contact__type">Call this office:</p>
        <p class="call__contact__name">${c.name} ${repID}</p>
        <p class="call__contact__phone">
          <a href="tel:${c.phone}">${c.phone}</a>
        </p>
        <p class="call__contact__reason"><strong>Why you’re calling this office:</strong> ${reason}</p>
      </div>
	`;
}
