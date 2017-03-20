/**
 * End-to-end tests for the FAQ page.
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');
const FaqPage = require('./faq-page');
const url = config.getBaseUrl();

test.describe('faq page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(url);
    page = new FaqPage(this.driver);
  });

  test.afterEach(function() {
    page = undefined;
  });

  test.it('should display FAQ page when "FAQ" link is clicked on home page', function() {
    const expected = page.getExpectedFaqPageText();

    // Click on icon inside FAQ link
    page.getFaqLink().click();

    // verify that FAQ page is rendered
    let element = page.getFaqPageElement();
    return expect(element.getText()).to.eventually.equal(expected);

  });

});

