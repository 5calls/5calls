const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const promise = webdriver.promise;
const config = require('./e2e-tests.config');

const BasePage = require('./base-page');
const CallsPage = require('./calls-page');
const LowPriorityIssuesListPage = require('./lowPriorityIssuesList-page');

/**
 * Page object for issues list related content,
 * which includes the issues list in the
 * sidebar and the list on the 'more issues' page.
 *
 */
class IssuesListPage extends BasePage {
  isInitialized() {
    const driver = this.driver;
    const issuesListSelector = By.css('#nav .issues-list');
    const issuesListTitleSelector = By.css('#nav header h2');
    const issuesListTitleText = "What’s important to you?";

    return promise.all(driver.wait(until.elementLocated(issuesListSelector),
                                   config.defaultTimeout),
                       driver.wait(until.elementLocated(issuesListTitleSelector),
                                   config.defaultTimeout))
      .then(() => {
        return driver.findElement(issuesListTitleSelector).getText();
      })
      .then(text => {
        return text === issuesListTitleText;
      });
  }

  /**
   * Obtains the element containing the first issue
   * on the sidebar.
   *
   * @returns {WebElementPromise} resolves to the first
   * issue element
   */
  followFirstIssue() {
    const firstIssueSelector = By.css('aside.layout__side ul.issues-list li:nth-child(1)');
    this.waitForElement(firstIssueSelector).click();
    return new CallsPage(this.driver);
  }

  /**
   * Obtains the 'view more issues' link element
   *
   * @returns {WebElementPromise} resolves to the
   * 'view more issues' link element
   */
  followLowPriorityIssuesListLink() {
    const linkText = By.linkText('view more issues');
    this.waitForElement(linkText).click();
    return new LowPriorityIssuesListPage(this.driver);
  }
}

module.exports = IssuesListPage;
