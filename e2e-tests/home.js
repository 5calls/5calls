/**
 * End-to-end tests for home page
 *
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');

const url = config.getBaseUrl();

const HomePage = require('./home-page');

test.describe('home page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(url);
    page = new HomePage(this.driver);
  });

  test.afterEach(function() {
    page = undefined;
  });

  test.it('should show correct page title', function() {
    const expected = page.getWindowTitleText();

    const title = page.getWindowTitle();

    return expect(title).to.eventually.equal(expected);
  });

  test.it('should display call count line', function() {
    const expected = page.getCallCountLineRegex();

    return expect(page.getCallCountLineElement()).to.eventually.match(expected);
  });

});

