/**
 * End-to-end tests for the FAQ page.
 */
const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');
const By = webdriver.By;
const until = webdriver.until;

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

/**
 * Page object encapsulating FAQ page-related behaviors.
 *
 * @class FaqPage
 */
class FaqPage {
  constructor(driver) {
    this.driver = driver;
    this.faqLinkSelector = 'i.fa-question-circle'
    this.faqPageSelector = 'header.page-header > h1';
    this.faqPageText = 'FAQ';
  }

  /**
   * Encapsulates link to FAQ page.
   *
   * @returns the link element
   *
   * @memberOf FaqPage
   */
  getFaqLink() {
    const selector = By.css(this.faqLinkSelector);
    this.driver.wait(until.elementLocated(selector), 5000);
    return this.driver.findElement(selector);
  }

  /**
   * Encapsulates characteristic text element on FAQ page.
   *
   * @returns text element from the FAQ page
   *
   * @memberOf FaqPage
   */
  getFaqPageElement() {
    const selector = By.css(this.faqPageSelector);
    this.driver.wait(until.elementLocated(selector), 7000);
    return this.driver.findElement(selector);
  }

  /**
   * Encapsulates the value of characteristic text on
   * FAQ page.
   *
   * @returns FAQ page text
   * @see #getFaqPageElement
   * @memberOf FaqPage
   */
  getExpectedFaqPageText() {
    return this.faqPageText;
  }
}