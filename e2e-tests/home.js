/**
 * End-to-end tests for home page
 *
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const HomePage = require('./home-page');

test.describe('home page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    page = new HomePage(this.driver);
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

