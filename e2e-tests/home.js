/**
 * End-to-end tests for home page
 *
 * See Readme.md for instructions on running the test
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');

const url = config.baseUrl;

test.describe('home page', function() {

  test.beforeEach(function() {
    this.driver.get(url);
  });

  test.it('should show correct page title', function() {
    let expected = '5 Calls: Make your voice heard';
    return expect(this.driver.getTitle()).to.eventually.equal(expected);
  });

});