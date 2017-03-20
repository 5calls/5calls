/**
 * End-to-end tests for home page
 *
 * See Readme.md for instructions on running the test
 */
const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');

const url = config.getBaseUrl();
const By = webdriver.By;
const until = webdriver.until;

test.describe('home page', function() {
  let home = undefined;
  test.beforeEach(function() {
    this.driver.get(url);
    home = new HomePage(this.driver);
  });

  test.afterEach(function() {
    home = undefined;
  });

  test.it('should show correct page title', function() {
    const expected = home.getWindowTitleText();

    const title = home.getWindowTitle();

    return expect(title).to.eventually.equal(expected);
  });

  test.it('should display call count line', function() {
    const expectedStart = home.getCallCountLineStartSubstring();

    return expect(home.getCallCountLineElement()).to.eventually.contain(expectedStart);
  });

});

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
    this.callCountLineStartSubstring = 'TOGETHER WE’VE MADE';
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
   * Obtains the start substring of the call count line.
   *
   * @returns the call count line start substring
   *
   * @memberOf HomePage
   */
  getCallCountLineStartSubstring() {
    return this.callCountLineStartSubstring;
  }
}