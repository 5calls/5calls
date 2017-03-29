const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Page object encapsulating about page-related behaviors.
 *
 */
class AboutPage {
  constructor(driver) {
    this.driver = driver;
    this.aboutPageSelector = 'h2.about__title';
    // text contained in aboutPageSelector element
    this.aboutPageText = 'ABOUT 5 CALLS';
  }

/**
 * Encalsulates characteristic text element on the About page.
 *
 * @returns {WebElementPromise} an About page element
 * containing known text.
 *
 */
  getAboutPageTextElement() {
    const aboutPageSelectorBy = By.css(this.aboutPageSelector);
    this.driver.wait(until.elementLocated(aboutPageSelectorBy), config.defaultTimeout);
    return this.driver.findElement(aboutPageSelectorBy);
  }

  /**
   * Tests that about page element with
   * known text is present.
   *
   * @returns {Promise<boolean>} resolves to true if the
   * about page element with known text can be
   * found; otherwise false.
   *
   */
  isAboutPage() {
    return this.getAboutPageTextElement()
      .getText().then(elementText => {
      return Promise.resolve(elementText === this.aboutPageText);
    });
  }
}

module.exports = AboutPage;