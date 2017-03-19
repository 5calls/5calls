const html = require('choo/html');

const sidebar = require('../components/sidebar.js');
const impact = require('../components/impact.js');

module.exports = (state, prev, send) => {
  return html`
    <div id="root" class="layout">
      ${sidebar(state, prev, send)} 
      ${impact(state, prev, send)}
    </div>
  `;
}
