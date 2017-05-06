const html = require('choo/html');
const t = require('../utils/translation');

module.exports = (state) => {

  function impactLink (userStats) {

    if (userStats && userStats.all) {
      if ( userStats.all.length > 0 ) {
        return html`
          <a id="impact__link" href="/impact">
            <i class="fa fa-line-chart" aria-hidden="true"></i> ${t('footer.impact')}
          </a>`;
      }
    }

    return null;
  }

  return html`
      <footer><div class="tinyletter__form">
        <form action="https://my.sendinblue.com/users/subscribe/js_id/2p22o/id/1" method="get" target="popupwindow" onsubmit="window.open('https://my.sendinblue.com/users/subscribe/js_id/2p22o/id/1', 'popupwindow', 'scrollbars=yes,width=800,height=600');return true">
          <label for="email">${t('footer.emailLabel')}</label>
          <span class="emailform">
            <input type="text" style="width:140px" name="email" id="email" />
            <input type="submit" value="${t('footer.subscribe', null, true)}" />
          </span>
        </form>
      </div>
      <div class="colophon">
        <a href="https://github.com/5calls/5calls">
          <i class="fa fa-github" aria-hidden="true"></i> ${t('footer.openSource')}
        </a>
        <a href="https://5calls.org/privacy.html" data-no-routing>
          <i class="fa fa-shield" aria-hidden="true"></i> ${t('footer.privacy')}
        </a>
        <a href="/faq">
          <i class="fa fa-question-circle" aria-hidden="true"></i> ${t('footer.faq')}
        </a>
        <a href="#about">
          <i class="fa fa-heart" aria-hidden="true"></i> ${t('footer.about')}
        </a>

        ${impactLink(state.userStats)}

        <br />
        <a href="http://ipinfo.io"> ${t('footer.ipGeolocation')}</a>
      </div></footer>
  `;
};