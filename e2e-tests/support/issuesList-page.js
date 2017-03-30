const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Page object for issues list related content,
 * which includes the issues list in the
 * sidebar and the list on the 'more issues' page.
 *
 */
class IssuesListPage {
  constructor(driver) {
    this.driver = driver;
    // selector for the first issue on the list
    this.firstIssueSelector = 'ul.issues-list li:nth-child(1)';
    // link to 'more issues' page
    this.viewMoreIssuesLinkText = 'view more issues';
    // selector to text on 'more issues' page
    this.moreIssuesPageTextElement = 'h2.call__title';
    // text contained by moreIssuesPageTextElement
    this.moreIssuesPageText = 'MORE ISSUES';
  }

  /**
   * Obtains the element containing the first issue
   * on the sidebar.
   *
   * @returns {WebElementPromise} resolves to the first
   * issue element
   */
  getFirstIssue() {
    const issueSelector = By.css(this.firstIssueSelector);
    this.driver.wait(until.elementLocated(issueSelector), config.defaultTimeout);
    return this.driver.findElement(issueSelector);
  }

  /**
   * Obtains the 'view more issues' link element
   *
   * @returns {WebElementPromise} resolves to the
   * 'view more issues' link element
   */
  getViewMoreIssuesLink() {
    const linkText = By.linkText(this.viewMoreIssuesLinkText);
    // click on linkText after page has rendered
    this.driver.wait(until.elementLocated(linkText), config.defaultTimeout * 2);
    return this.driver.findElement(linkText);
  }

  /**
   * Obtains element that contains identifying text
   * from More Issues page
   *
   * @returns {WebElementPromise} resolves to element
   * on the 'more issues' page
   */
  getMoreIssuesPageTextElement() {
    const selector = By.css(this.moreIssuesPageTextElement);
    this.driver.wait(until.elementLocated(selector), config.defaultTimeout);
    return this.driver.findElement(selector);
  }

  /**
   * Tests that more issues page element with
   * known text is present.
   *
   * @returns {Promise<boolean>} resolves to true if the
   * more issues page element with known text can be
   * found; otherwise false.
   *
   */
  isMoreIssuesPage() {
    return this.getMoreIssuesPageTextElement()
      .getText().then(elementText => {
      return Promise.resolve(elementText === this.moreIssuesPageText);
    });
  }
}

module.exports = IssuesListPage;
