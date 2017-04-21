const html = require('choo/html');
const issues = require('./issues.js');

module.exports = (state, prev, send) => {
  return html`
    <aside id="nav" role="contentinfo" class="layout__side">
      ${issues(state, prev, send)}
    </aside>
  `;
};
