const html = require('choo/html');
const t = require('../utils/translation');

const issuesLocation = require('./issuesLocation.js');

module.exports = (state, prev, send) => {
  return html`
    <header class="${classString(state)}" role="banner">
      <h1 class="issues__title">
        <a href="/" onclick=${() => send('home')}><img class="issues__logo" src="/img/5calls-logotype.png">${t.getText("common.5Calls")}</a>
      </h1>
      ${issuesLocation(state, prev, send)}
      ${issueExplain(state)}
    </header>
  `;

  function issueExplain(state) {
    if (state.issues.length > 0) {
      return html`<h2>${t.getText("issues.whatsImportantToYou")}</h2>`
    } else {
      return html``
    }
  }

  function classString(state) {
    const BASE_CLASS = 'issues__header';
    const ACTIVE_CLASS = 'is-active';

    let classes = [BASE_CLASS];

    state.location.params.issueid == null && classes.push(ACTIVE_CLASS);

    return classes.join(' ');
  }
}
