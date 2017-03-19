const html = require('choo/html');

const sidebar = require('../components/sidebar.js');
const issuesInactive = require('../components/issuesInactive.js');

module.exports = (state, prev, send) => {
  return html`
    <div id="root" class="layout">
      ${sidebar(state, prev, send)}
      ${issuesInactive(state, prev, send)}
    </div>
  `;
}
