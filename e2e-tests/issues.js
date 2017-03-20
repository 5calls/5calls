/**
 * End-to-end tests for issues page
 *
 */
const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');

const url = config.getBaseUrl();
const By = webdriver.By;
const until = webdriver.until;

test.describe('issues page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(url);
    page = new IssuesPage(this.driver);
  });

  test.afterEach(function() {
    page = undefined;
  });

  test.it('should display issue details when an issue is clicked', function() {
    const expected = page.getIssueDetailsPageText();

    // click on first issue
    page.getFirstIssue().click();

    // check that page text is rendered
    return expect(page.getIssueDetailsPageElement().getText())
      .to.eventually.equal(expected);
  });

  test.it('should display More Issues page after clicking on "view more issues"', function() {
    const expected = page.getMoreIssuesPageText();

    // click on link to more issues page
    page.getViewMoreIssuesLink().click();

    // check that text on more issues page renders
    return expect(page.getMoreIssuesPageTextElement().getText())
      .to.eventually.equal(expected);
  });

});

/**
 * Page object for issues-related content.
 *
 * @class IssuesPage
 */
class IssuesPage {
  constructor(driver) {
    this.driver = driver;
    // selectors and other locators
    this.firstIssueSelector = 'ul.issues-list li:nth-child(1)';
    this.viewMoreIssuesLinkText = 'view more issues';
    this.issueDetailsPageSelector = 'h3.call__outcomes__header';
    this.moreIssuesPageTextElement = 'h2.call__title';
  }

  /**
   * Obtains the element containing the first issue
   * on the sidebar.
   *
   * @returns the first issue element
   *
   * @memberOf IssuesPage
   */
  getFirstIssue() {
    const issueSelector = By.css(this.firstIssueSelector);
    this.driver.wait(until.elementLocated(issueSelector), 3000);
    return this.driver.findElement(issueSelector);
  }

  /**
   * Obtains the 'view more issues' link element
   *
   * @returns the 'view more issues' element
   *
   * @memberOf IssuesPage
   */
  getViewMoreIssuesLink() {
    const linkText = By.linkText(this.viewMoreIssuesLinkText);
    // click on linkText after page has rendered
    this.driver.wait(until.elementLocated(linkText), 5000);
    return this.driver.findElement(linkText);
  }
  /**
   * Obtains an element on the issues detail page
   *
   * @returns an issue details page element
   *
   * @memberOf IssuesPage
   */
  getIssueDetailsPageElement() {
    //  make sure issue details page has displayed
     this.driver.wait(until.elementLocated(By.css(this.issueDetailsPageSelector)), 3000);
    // find element on page
    const element = this.driver.findElement(By.css(this.issueDetailsPageSelector));
    return element;
  }

  /**
   * Returns identifying text from the issue details page.
   * contained by the element returned by
   * #getIssueDetailsPageElement.
   *
   * @returns the issue details page text
   *
   * @memberOf IssuesPage
   */
  getIssueDetailsPageText() {
    return 'Enter your call result to get the next call:';
  }

  /**
   * Obtains element that contains identifying text
   * from More Issues page
   */
  getMoreIssuesPageTextElement() {
    const selector = By.css(this.moreIssuesPageTextElement);
    this.driver.wait(until.elementLocated(selector), 5000);
    return this.driver.findElement(selector);
  }

  /**
   * Returns identifying text from More Issues page
   */
  getMoreIssuesPageText() {
    return 'MORE ISSUES';
  }
}