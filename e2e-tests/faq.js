/**
 * End-to-end tests for the FAQ page.
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const FaqPage = require('./support/faq-page');
const HomePage = require('./support/home-page');

test.describe('faq page', function() {
  let faqPage = undefined;
  let homePage = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    faqPage = new FaqPage(this.driver);
    homePage = new HomePage(this.driver);
  });

  test.it('should display FAQ page when "FAQ" link is clicked on home page', function() {
    // FAQ page can be flaky, so catch any errors
    try {
      // Click on icon inside FAQ link
      homePage.getFaqLink().click();

      // verify that FAQ page is rendered
      return expect(faqPage.isFaqPage()).to.eventually.be.true;
    } catch( error ) {
      error.message = 'Problem getting FAQ page';
      return Promise.reject(error);
    }

  });

});

