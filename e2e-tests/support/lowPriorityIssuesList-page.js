const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const BasePage = require('./base-page');
const CallsPage = require('./calls-page');
const HomePage = require('./home-page');

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
   * Navigates to the first issue in the list of low-priority issues.
   *
   * @returns {CallsPage} resolves to the calls page object,
   * which internally checks that the current page is the
   * Calls page.
   */
  followFirstIssue() {
    const firstIssueSelector = By.css('section.call ul.issues-list li:nth-child(1)');
    this.waitForElement(firstIssueSelector).click();
    return new CallsPage(this.driver);
  }

  /**
   * Navigates to the home page from the low priority
   * issues page.
   *
   * @returns {HomePage} resolves to the home page object,
   * which internally checks that the current page is the
   * Home page.
   */
  followHomeLink() {
    const selector = By.css('img.issues__logo');
    this.waitForElement(selector).click();
    return new HomePage(this.driver);
  }

}

module.exports = LowPriorityIssuesListPage;
