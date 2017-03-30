const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Page object for calls-related content.
 */
class CallsPage2 {
  constructor(driver) {
    this.driver = driver;
    // selectors and other locators
    this.issueSelector = 'ul.issues-list';
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
   */
  getFirstIssue() {
    const issueSelector = By.css(this.firstIssueSelector);
    this.driver.wait(until.elementLocated(issueSelector), config.defaultTimeout);
    return this.driver.findElement(issueSelector);
  }

  getIssueSelector(issueNumber) {
    const selector = `${this.issueSelector} > li:nth-child(${issueNumber}) > a.issues-list__item`;
    /*eslint no-console: */
    console.log('SELECTOR: ', selector);
    return selector;
  }

  getNthIssue(issueNumber) {
    const issueSelector = By.css(this.getIssueSelector(issueNumber));
    this.driver.wait(until.elementLocated(issueSelector), config.defaultTimeout);
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
    this.driver.wait(until.elementLocated(linkText), config.defaultTimeout * 2);
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
     this.driver.wait(until.elementLocated(By.css(this.issueDetailsPageSelector)), config.defaultTimeout);
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
    this.driver.wait(until.elementLocated(selector), config.defaultTimeout);
    return this.driver.findElement(selector);
  }

  /**
   * Returns identifying text from More Issues page
   */
  getMoreIssuesPageText() {
    return 'MORE ISSUES';
  }

  getRemainingContacts() {
    // <span class="issues-list__item__title is-active">Oppose Wall Street Insider Jay Clayton as SEC Chair</span>
    // <h3 aria-live="polite" class="call__contacts__left">2 more people to call for this issue.</h3>

    const selector = By.css('h3.call__contacts__left');
    // const buttonSelector = 'div.call__outcomes__items';
    // click on 4th issue link
    this.getNthIssue(4).click();
    // this.driver.executeScript('alert("GOT HERE")');
    this.driver.wait(until.elementLocated(selector),
      config.defaultTimeout * 3,
      'failed waiting for call page to render');
    const element = this.driver.findElement(selector);
    element.getText().then(el => {
      /*eslint no-console: */
      console.log('ISSUES LEFT: ', el);
    });
  }

  getFailedWait() {
    const selector = By.css('asdff');
    this.driver.wait(until.elementLocated(selector),
      config.defaultTimeout, 'waiting for nonsence')
      .then(w => {
      /*eslint no-console: */
        console.log('WAIT: ', w);
      })
      .catch(err => {
      /*eslint no-console: */
        console.log('WAIT ERROR: ', err.message);
        // Promise.resolve(err);
      });
  }
}

module.exports = CallsPage2;
