const html = require('choo/html');

module.exports = (scriptLine) => {
  return html`
  	<p>${scriptLine}</p>
  `;
}