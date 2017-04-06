const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const BasePage = require('./base-page');
const CallsPage = require('./calls-page');

/**
 * Page object for the More Issues page that holds
 * a list of low priority issues.
 */
class LowPriorityIssuesListPage extends BasePage {
  isInitialized() {
    const moreIssuesTitleSelector = By.css('main .call__title');
    const moreIssuesTitleText = "MORE ISSUES";

    return this.waitForElement(moreIssuesTitleSelector,
                               "More Issues page isn't loaded")
      .getText()
      .then(text => {
        return text === moreIssuesTitleText;
      });
  }

  /**
   * navigate the browser to the first first issue
   * in the list of inactive issues.
   *
   * @returns {WebElementPromise} resolves to the first
   * issue element
   */
  followFirstIssue() {
    const firstIssueSelector = By.css('section.call ul.issues-list li:nth-child(1)');
    this.waitForElement(firstIssueSelector).click();
    return new CallsPage(this.driver);
  }

}

module.exports = LowPriorityIssuesListPage;
