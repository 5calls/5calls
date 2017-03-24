/**
 * End-to-end tests for the About page.
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const AboutPage = require('./about-page');

test.describe('about page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    page = new AboutPage(this.driver);
  });

  test.afterEach(function() {
    page = undefined;
  });

  test.it('should display about page when "why calling works." link is clicked on home page', function() {
    const expected = page.getAboutPageText();

    // click on home page link
    page.getWhyCallingWorksLinkElement().click();

    // verify that About page renders
    const element = page.getAboutPageTextElement();
    return expect(element.getText()).to.eventually.equal(expected);
  });

  test.it('should display about page when "About" link is clicked on home page', function() {
    const expected = page.getAboutPageText();

    // click on home page link
    page.getAboutPageLinkElement().click();

    // verify that About page renders
    const element = page.getAboutPageTextElement();

    return expect(element.getText()).to.eventually.equal(expected);
  });

});
