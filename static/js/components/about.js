const html = require('choo/html');
const t = require('../utils/translation');
const constants = require('../constants');

module.exports = (state, prev, send) => {
  return html`
    <main role="main" class="layout__main" onload=${(e) => send('startup')}>
    <section class="about">
      <h2 class="about__title">${t.getText("about.title")}</h2>

      <h3 class="about__subtitle">${t.getText("about.whyCallingWorks.title")}</h3>

      <p>${t.getText('about.whyCallingWorks.justificationForCalling')}</p>
      <p>${t.getText("about.whyCallingWorks.justificationArticlesListHeader")}</p>
      <ul>
          <li>${t.getText('about.whyCallingWorks.article1')}</li>
          <li>${t.getText('about.whyCallingWorks.article2')}</li>
          <li>${t.getText('about.whyCallingWorks.article3')}</li>
          <li>${t.getText('about.whyCallingWorks.article4')}</li>
      </ul>
      <p>${t.getText("about.whyCallingWorks.weDoTheResearch")}</p>
      <p>${t.getText("about.whyCallingWorks.sendYourIssues", { contactEmail: constants.contact.email})}</p>

      <h3 class="about__subtitle">${t.getText("about.callingTips.title")}</h3>
      <p>${t.getText("about.callingTips.callTechnique")}</p>
      <p>${t.getText("about.callingTips.callEtiquette")}</p>

      <h3 class="about__subtitle">${t.getText("about.whoIs5Calls.title")}</h3>
      <p>${t.getText("about.whoIs5Calls.whyWeWorkOnIt")}</p>
      <p>${t.getText("about.whoIs5Calls.broughtToYouBy")}
      <a href='https://twitter.com/nickoneill'>@nickoneill</a>, <a href='https://twitter.com/syntheticmethod'>@syntheticmethod</a>, <a href='https://twitter.com/monteiro'>@monteiro</a>, <a href='https://twitter.com/stewartsc'>@stewartsc</a>, <a href='https://twitter.com/liamdanger'>@liamdanger</a>, <a href='https://twitter.com/capndesign'>@capndesign</a>, <a href='https://twitter.com/gotwarlost'>@gotwarlost</a>, <a href='https://twitter.com/jameshome'>@jameshome</a>, <a href='https://twitter.com/robynshhh'>@robynshhh</a>
      </p>

      <h3 class="about__subtitle">${t.getText("about.joinUs.title")}</h3>
      <p>${t.getText("about.joinUs.contactInvite", { contactEmail: constants.contact.email})}</p>

    </section>
    </main>
  `;
}
