const html = require('choo/html');
const find = require('lodash/find');

module.exports = (c, state, prev, send) => {
  const photoURL = c.photoURL == "" ? "/img/5calls-icon-office.png" : c.photoURL;
  const reason = c.reason == "" ? "This organization is driving legislation related to the issue." : c.reason;

  repID = ""
  if (c.party != "") {
    repID = c.party.substring(0,1) + "-" + c.state;
  }

  let fieldOffices
  if (!!~c.field_offices) {
    fieldOffices = html`
      <p class="call__contact__show-field-offices">Busy line? <a onclick=${() => {send('toggleFieldOfficeNumbers')}}>Call a local office</a></p>
    `
    if (state.showFieldOfficeNumbers) {
      fieldOffices = html`
        <div>
          <h3 class="call__contact__field-offices__header">Local office numbers:</h3>
          <ul class="call__contact__field-office-list">
            ${c.field_offices.map(office => html`
              <li><a href="tel:+1${office.phone.replace(/-/g, '')}">${office.phone}</a> - ${office.city}, ${c.state}</li>
            `)}
          </ul>
        </div>
      `
    }
  }

  return html`
      <div class="call__contact" id="contact">
        <div class="call__contact__image"><img src="${photoURL}"/></div>
        <h3 class="call__contact__type">Call this office:</h3>
        <p class="call__contact__name">${c.name} ${repID}</p>
        <p class="call__contact__phone">
          <a href="tel:+1${c.phone}">+1 ${c.phone}</a>
        </p>
        ${fieldOffices}
        <h3 class="call__contact__reason__header">Why you’re calling this office:</h3>
        <p class="call__contact__reason">${reason}</p>
      </div>
	`;
}
