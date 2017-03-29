/**
 * End-to-end tests for home page
 *
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const HomePage = require('./support/home-page');

test.describe('home page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    page = new HomePage(this.driver);
  });

  test.it('should show correct page title', function() {
    const expected = '5 Calls: Make your voice heard';

    const title = page.getWindowTitle();

    return expect(title).to.eventually.equal(expected);
  });

  test.it('should display call count line', function() {
    // regex matching call count line
    const expected = page.getCallCountLineRegex();

    // check call count element text against regex
    const element = page.getCallCountLineElement();
    return expect(element.getText()).to.eventually.match(expected);
  });

});

