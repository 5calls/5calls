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
   * Responds to clicking on the About link which navigates
   * to the About page.
   *
   * @returns {AboutPage} resolves to the about page object,
   * which internally checks that the current page is the
   * About page.
   */
  followAboutPageLink() {
    const aboutPageLinkSelector = By.partialLinkText("About");
    this.waitForElement(aboutPageLinkSelector, 'About page cannot be loaded').click();
    return new AboutPage(this.driver);
  }

  /**
   * Responds to clicking on the Why Calling Works link
   * which navigates to the about page.
   *
   * @returns {AboutPage} resolves to the about page object,
   * which internally checks that the current page is the
   * About page.
   */
  followWhyCallingWorksLink() {
    const linkSelector = By.partialLinkText('why calling works');
    this.waitForElement(linkSelector).click();
    return new AboutPage(this.driver);
  }

  /**
   * Responds to click on the FAQ page link.
   *
   * @returns {FaqPage} resolves to the FAQ page object,
   * which internally checks that the current page is the
   * FAQ page.
   */
  followFaqLink() {
    const selector = By.css('i.fa-question-circle');
    this.waitForElement(selector).click();
    return new FaqPage(this.driver);
  }


  /**
   * Obtains the call count text including the actual count
   *
   * @returns {Promise<string>} resolves to the call count text
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
