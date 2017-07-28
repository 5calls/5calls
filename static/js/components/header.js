const html = require('choo/html');
const formatting = require('../utils/formatting');

module.exports = (state) => {
  if (!state.donations || Object.keys(state.donations).length === 0) {
    return html`<header class="logo__header" role="banner"></header>`;
  }

  let pctDone = (state.donations.total / state.donations.goal) * 100;

  return html`
    <header class="logo__header" role="banner">
      <div class="logo__header__inner layout">
        <div class="logo__header__donatebar">
          <span class="logo__header__donatebar__total" style="width: ${pctDone}%">\$${formatting.prettyCount(state.donations.total)}</span>
          <span class="logo__header__donatebar__goal">\$${formatting.prettyCount(state.donations.goal)}</span>
        </div>
        <p class="logo__header__donatetext"><a href="https://secure.actblue.com/donate/5calls-donate">Donate today to keep 5 Calls running</a></p>
      </div>
    </header>
  `;
};
