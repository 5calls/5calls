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

  test.it('should display call count line', function() {
    return expect(page.getCallCount()).to.eventually.not.be.empty;
  });

});
