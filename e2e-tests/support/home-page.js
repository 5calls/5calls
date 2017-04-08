const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const BasePage = require('./base-page');
const AboutPage = require('./about-page');
const FaqPage = require('./faq-page');

/**
 * Page object for the Home page.
 *
 */
class HomePage extends BasePage {
  isInitialized() {
    return this.isHome();
  }

  isHome() {
    const pageTitleSelector = By.css('h2.hypothesis__title');
    const pageTitleText = "MAKE YOUR VOICE HEARD";
    return this.waitForElement(pageTitleSelector,
                               "Home page isn't loaded")
      .getText()
      .then(text => {
        return text === pageTitleText;
      });


  }

  /**
   * Obtains the About link element in the home page footer
   *
   * @returns {WebElementPromise} resolves to the
   * web element containing the About link to the
   * about page.
   */
  followAboutPageLink() {
    const aboutPageLinkSelector = By.partialLinkText("About");
    this.waitForElement(aboutPageLinkSelector).click();
    return new AboutPage(this.driver);
  }

  /**
   * Obtains the Why Calling Works link element.
   *
   * @returns {WebElementPromise} resolves to the link element
   */
  followWhyCallingWorksLink() {
    const linkSelector = By.partialLinkText('why calling works');
    this.waitForElement(linkSelector).click();
    return new AboutPage(this.driver);
  }

  /**
   * Encapsulates link to FAQ page.
   *
   * @returns {WebElementPromise} resolves to the FAQ link element
   */
  followFaqLink() {
    const selector = By.css('i.fa-question-circle');
    this.waitForElement(selector).click();
    return new FaqPage(this.driver);
  }


  /**
   * Obtains the element containing the call count
   *
   * @returns {WebElementPromise} resolves to the call count element
   */
  getCallCount() {
    const selector = By.css('h2.callcount');
    const callCountRegex = /^TOGETHER WE’VE MADE ([\d,.]*) CALLS$/;
    return this.waitForElement(selector).getText()
      .then(text => {
        const match = text.match(callCountRegex);
        return match === null ? "" : match[1];
      });
  }

}

module.exports = HomePage;
