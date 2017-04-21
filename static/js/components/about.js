const html = require('choo/html');
const t = require('../utils/translation');
const constants = require('../constants');
const scrollIntoView = require('../utils/scrollIntoView.js');

module.exports = (state, prev, send) => {

  function load() {
    scrollIntoView(document.querySelector('#content'));
    send('startup');
  }

  return html`
    <main id="content" role="main" class="layout__main" onload=${load}>
    <section class="about">
      <h2 class="about__title">${t("about.title")}</h2>

      <h3 class="about__subtitle">${t("about.whyCallingWorks.title")}</h3>

      <p>${t('about.whyCallingWorks.justificationForCalling')}</p>
      <p>${t("about.whyCallingWorks.justificationArticlesListHeader")}</p>
      <ul>
          <li>${t('about.whyCallingWorks.article1')}</li>
          <li>${t('about.whyCallingWorks.article2')}</li>
          <li>${t('about.whyCallingWorks.article3')}</li>
          <li>${t('about.whyCallingWorks.article4')}</li>
      </ul>
      <p>${t("about.whyCallingWorks.weDoTheResearch")}</p>
      <p>${t("about.whyCallingWorks.sendYourIssues", { contactEmail: constants.contact.email})}</p>

      <h3 class="about__subtitle">${t("about.callingTips.title")}</h3>
      <p>${t("about.callingTips.callTechnique")}</p>
      <p>${t("about.callingTips.callEtiquette")}</p>

      <h3 class="about__subtitle">${t("about.whoIs5Calls.title")}</h3>
      <p>${t("about.whoIs5Calls.overview")}</p>
      <p>${t("about.whoIs5Calls.iOSApp")}</p>
      <p>${t("about.whoIs5Calls.androidApp")}</p>
      <p>${t("about.whoIs5Calls.contentAndSocial")}</p>
      <p>${t("about.whoIs5Calls.whyStatement")}</p>
      
      <h3 class="about__subtitle">${t("about.joinUs.title")}</h3>
      <p>${t("about.joinUs.contactInvite", { contactEmail: constants.contact.email})}</p>

    </section>
    </main>
  `;
};
