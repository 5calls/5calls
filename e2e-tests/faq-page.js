const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./support/e2e-tests.config');

/**
 * Page object encapsulating FAQ page-related behaviors.
 *
 * @class FaqPage
 */
class FaqPage {
  constructor(driver) {
    this.driver = driver;
    this.faqLinkSelector = 'i.fa-question-circle'
    this.faqPageSelector = 'header.page-header > h1';
    this.faqPageText = 'FAQ';
  }

  /**
   * Encapsulates link to FAQ page.
   *
   * @returns the link element
   *
   * @memberOf FaqPage
   */
  getFaqLink() {
    const selector = By.css(this.faqLinkSelector);
    this.driver.wait(until.elementLocated(selector), config.defaultTimeout);
    return this.driver.findElement(selector);
  }

  /**
   * Encapsulates characteristic text element on FAQ page.
   *
   * @returns text element from the FAQ page
   *
   * @memberOf FaqPage
   */
  getFaqPageElement() {
    const selector = By.css(this.faqPageSelector);
    this.driver.wait(until.elementLocated(selector), config.defaultTimeout * 2);
    return this.driver.findElement(selector);
  }

  /**
   * Encapsulates the value of characteristic text on
   * FAQ page.
   *
   * @returns FAQ page text
   * @see #getFaqPageElement
   * @memberOf FaqPage
   */
  getExpectedFaqPageText() {
    return this.faqPageText;
  }
}

module.exports = FaqPage;