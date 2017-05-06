const html = require('choo/html');

const sidebar = require('../components/sidebar.js');
const faq = require('../components/faq.js');

module.exports = (state, prev, send) => {
  return html`
    <div id="root" class="layout">
      ${sidebar(state, prev, send)} 
      ${faq(state, prev, send)}
    </div>
  `;
};
