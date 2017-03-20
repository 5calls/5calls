const webdriver = require('selenium-webdriver');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const By = webdriver.By;

/**
 * Page object for the Home page.
 *
 * @class HomePage
 */
class HomePage {
  constructor(driver) {
    this.driver = driver;
    // selectors and search text
    this.callCountSelector = 'h2.callcount';
    this.windowTitleText = '5 Calls: Make your voice heard';
    this.callCountLineRegex = /^TOGETHER WE’VE MADE \d{1,3}(,\d{3})*(\.\d+)? CALLS$/;
  }

  /**
   * Obtains the window title element
   *
   * @returns window title element
   *
   * @memberOf HomePage
   */
  getWindowTitle() {
    return this.driver.getTitle();
  }

  /**
   * Obtains the window title element text
   *
   * @returns window title text
   *
   * @memberOf HomePage
   */
  getWindowTitleText() {
    return this.windowTitleText;
  }

  /**
   * Obtains the element containing the call count
   *
   * @returns the call count element
   *
   * @memberOf HomePage
   */
  getCallCountLineElement() {
    const selector = By.css(this.callCountSelector);
    let element = this.driver.findElement(selector);
    return element.getText();
  }

  /**
   * Obtains a regex corresponding to the call count line text.
   *
   * @returns call count line regex
   *
   * @memberOf HomePage
   */
  getCallCountLineRegex() {
    return this.callCountLineRegex;
  }
}

module.exports = HomePage;
