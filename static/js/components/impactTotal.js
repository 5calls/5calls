const html = require('choo/html');
const t = require('../utils/translation');

module.exports = (state) => {
  const userCalls = state.userStats.all.length;

  return html`
    <h2 class="impact_total">
      ${t('impact.totalCallCountText', {myTotalCalls: userCalls})}
    </h2>
  `;
};
