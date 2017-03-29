/**
 * End-to-end tests for the FAQ page.
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const FaqPage = require('./faq-page');

test.describe('faq page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    page = new FaqPage(this.driver);
  });

  test.it('should display FAQ page when "FAQ" link is clicked on home page', function() {
    // FAQ page can be flaky, so catch any errors
    try {
      const expected = page.getExpectedFaqPageText();

      // Click on icon inside FAQ link
      page.getFaqLink().click();

      // verify that FAQ page is rendered
      let element = page.getFaqPageElement();
      return expect(element.getText()).to.eventually.equal(expected);
    } catch( error ) {
      error.message = 'Problem getting FAQ page';
      return Promise.reject(error);
    }

  });

});

