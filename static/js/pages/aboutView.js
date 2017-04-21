const html = require('choo/html');

const sidebar = require('../components/sidebar.js');
const about = require('../components/about.js');
const footer = require('../components/footer.js');

module.exports = (state, prev, send) => {
  return html`
    <div id="root">
      <div class="layout">
        ${sidebar(state, prev, send)} 
        ${about(state, prev, send)}
      </div>
      ${footer(state, prev, send)}
    </div>
  `;
};
