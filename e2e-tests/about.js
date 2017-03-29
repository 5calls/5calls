/**
 * End-to-end tests for the About page.
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const AboutPage = require('./support/about-page');
const HomePage = require('./support/home-page');

test.describe('about page', function() {
  let aboutPage = undefined;
  let homePage = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    aboutPage = new AboutPage(this.driver);
    homePage = new HomePage(this.driver);
  });

  test.it('should display about page when "why calling works." link is clicked on home page', function() {
    // click on 'why calling works' home page link
    homePage.getWhyCallingWorksLink().click();

    // verify that About page renders
    return expect(aboutPage.isAboutPage()).to.eventually.equal(true);
  });

  test.it('should display about page when "About" link is clicked on home page', function() {
    // click on home page 'About' link
    homePage.getAboutPageLink().click();

    // verify that About page renders
    return expect(aboutPage.isAboutPage()).to.eventually.be.true;
  });

});
