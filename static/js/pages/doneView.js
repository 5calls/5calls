const html = require('choo/html');

const sidebar = require('../components/sidebar.js');
const done = require('../components/done.js');

module.exports = (state, prev, send) => {
  return html`
    <div id="root" class="layout">
        ${sidebar(state, prev, send)} 
        ${done(state, prev, send)}
    </div>
  `;
}
