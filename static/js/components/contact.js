const html = require('choo/html');
const logger = require('loglevel');

module.exports = (c, state, prev, send) => {
  const photoURL = c.photoURL == "" ? "/img/5calls-icon-office.png" : c.photoURL;
  if (c.reason == "") {
    logger.debug("Missing reason for contact " + c.name)
  }

  let repID = ""
  if (c.party != "") {
    repID = c.party.substring(0,1) + "-" + c.state;
  }

  let fieldOffices
  if (c.field_offices) {
    fieldOffices = html`
      <p class="call__contact__show-field-offices">Busy line? <a onclick=${() => {send('toggleFieldOfficeNumbers')}}>Click here to see local office numbers</a></p>
    `
    if (state.showFieldOfficeNumbers) {
      fieldOffices = html`
        <div>
          <h3 class="call__contact__field-offices__header">Local office numbers:</h3>
          <ul class="call__contact__field-office-list">
            ${c.field_offices.map(office => html`
              <li><a href="tel:+1${office.phone.replace(/-/g, '')}">${office.phone}</a> ${cityFormat(office,c)}</li>
            `)}
          </ul>
        </div>
      `
    }
  }

  function cityFormat(office, c) {
    if (office.city) {
      return "- " + office.city + ", " + c.state
    } else {
      return ""
    }
  }

  return html`
      <div class="call__contact" id="contact">
        <div class="call__contact__image"><img alt="" src="${photoURL}"/></div>
        <h3 class="call__contact__type">Call this office:</h3>
        <p class="call__contact__name">${c.name} ${repID}</p>
        <p class="call__contact__phone">
          <a href="tel:+1${c.phone}">+1 ${c.phone}</a>
        </p>
        ${fieldOffices}
        <h3 class="call__contact__reason__header">Why you’re calling this office:</h3>
        <p class="call__contact__reason">${c.reason}</p>
      </div>
  `;
}
