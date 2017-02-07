const html = require('choo/html');
const find = require('lodash/find');

module.exports = (c, state, prev, send) => {
  const photoURL = c.photoURL == "" ? "/img/5calls-icon-office.png" : c.photoURL;
  const reason = c.reason == "" ? "This organization is driving legislation related to the issue." : c.reason;
  const repID = c.party ? c.party.substring(0,1) + "-" + c.state : '';

  if (!state.currentPhoneNumber) {
    send('setCurrentPhoneNumber', { currentPhoneNumber: c.phone });
  }

  function changeFieldOffice(event) {
    send('setCurrentPhoneNumber', { currentPhoneNumber: event.target.value });
  }

  const otherOffices = (!c.field_offices) ? '' : html`
    <p>
      Busy? Try another line:
      <select onchange=${changeFieldOffice}}>
        <option value="${c.phone}" ${state.currentPhoneNumber === c.phone ? 'selected' : ''}>Washington, D.C.</option>
        ${c.field_offices.map(office => html`
          <option value="${office.phone}" ${state.currentPhoneNumber === office.phone ? 'selected' : ''}>${office.city}, ${c.state}</option>
        `)}
      </select>
    </p>
  `

  return html`
      <div class="call__contact" id="contact">
        <div class="call__contact__image"><img src="${photoURL}"/></div>
        <h3 class="call__contact__type">Call this office:</h3>
        <p class="call__contact__name">${c.name} ${repID}</p>
        <p class="call__contact__phone">
          <a href="tel:+1${state.currentPhoneNumber}">+1 ${state.currentPhoneNumber}</a>
        </p>
        ${otherOffices}
        <h3 class="call__contact__reason__header">Why you’re calling this office:</h3>
        <p class="call__contact__reason">${reason}</p>
      </div>
	`;
}
