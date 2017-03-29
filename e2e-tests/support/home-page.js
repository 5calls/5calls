const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Page object for the Home page.
 *
 */
class HomePage {
  constructor(driver) {
    this.driver = driver;
    // call count related selectors and search text
    this.callCountSelector = 'h2.callcount';
    this.callCountLineRegex = /^TOGETHER WE’VE MADE \d{1,3}(,\d{3})*(\.\d+)? CALLS$/;
    // about page links
    this.aboutPageLinkText = 'About';
    this.whyCallingWorksLinkText = 'why calling works.';
    // FAQ page link selector
    this.faqLinkSelector = 'i.fa-question-circle'
  }

  /**
   * Obtains the window title text.
   *
   * @returns {Promise<string>} resolves to the window
   * title text.
   */
  getWindowTitle() {
    return this.driver.getTitle();
  }

  /**
   * Obtains the About link element in the home page footer
   *
   * @returns {WebElementPromise} resolves to the
   * web element containing the About link to the
   * about page.
   */
  getAboutPageLink() {
    const aboutPageLinkTextBy = By.linkText(this.aboutPageLinkText);
    this.driver.wait(until.elementLocated(aboutPageLinkTextBy), config.defaultTimeout);
    return this.driver.findElement(aboutPageLinkTextBy);
  }

/**
 * Obtains the Why Calling Works link element.
 *
 * @returns {WebElementPromise} resolves to the link element
 */
  getWhyCallingWorksLink() {
    const linkTextBy = By.linkText(this.whyCallingWorksLinkText);
    this.driver.wait(until.elementLocated(linkTextBy), config.defaultTimeout);
    return this.driver.findElement(linkTextBy);
  }

  /**
   * Encapsulates link to FAQ page.
   *
   * @returns {WebElementPromise} resolves to the FAQ link element
   */
  getFaqLink() {
    const selector = By.css(this.faqLinkSelector);
    this.driver.wait(until.elementLocated(selector), config.defaultTimeout);
    return this.driver.findElement(selector);
  }


  /**
   * Obtains the element containing the call count
   *
   * @returns {WebElementPromise} resolves to the call count element
   */
  getCallCountLineElement() {
    const selector = By.css(this.callCountSelector);
    return this.driver.findElement(selector);
  }

  /**
   * Obtains a regex corresponding to the call count line text.
   *
   * @returns {RegExp} a regular expression for
   * the call count line.
   */
  getCallCountLineRegex() {
    return this.callCountLineRegex;
  }

}

module.exports = HomePage;
