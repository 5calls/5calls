const webdriver = require('selenium-webdriver');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const By = webdriver.By;
const until = webdriver.until;

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

module.exports = IssuesPage;
