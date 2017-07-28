const html = require('choo/html');

const header = require('../components/header.js');
const sidebar = require('../components/sidebar.js');
const impact = require('../components/impact.js');
const footer = require('../components/footer.js');

module.exports = (state, prev, send) => {
  return html`
    <div id="root">
      ${header(state, prev, send)}

      <div class="layout">
        ${sidebar(state, prev, send)} 
        ${impact(state, prev, send)}
      </div>
      ${footer(state, prev, send)}
    </div>
  `;
};
