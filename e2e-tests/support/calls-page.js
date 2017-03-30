const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Page object for calls-related content.
 *
 */
class CallsPage {
  constructor(driver) {
    this.driver = driver;
    // selector for calls page text
    this.callsPageSelector = 'h3.call__outcomes__header';
    // text content of callsPageSelector
    this.callsPageText = 'Enter your call result to get the next call:';
  }

  /**
   * Obtains an element on the calls page.
   *
   * @returns {WebElementPromise} resolves to a
   * calls page element.
   */
  getCallsPageElement() {
    const callsPageSelectorBy = By.css(this.callsPageSelector);
    //  make sure calls page has displayed
    this.driver.wait(until.elementLocated(callsPageSelectorBy),
      config.defaultTimeout);
    // find element on page
    const element = this.driver.findElement(callsPageSelectorBy);
    return element;
  }

  /**
   * Tests that calls page element with
   * known text is present.
   *
   * @returns {Promise<boolean>} resolves to true if the
   * calls page element with known text can be
   * found; otherwise false.
   */
  isCallsPage() {
    return this.getCallsPageElement()
      .getText().then(elementText => {
      return Promise.resolve(elementText === this.callsPageText);
    });

  }

}

module.exports = CallsPage;
