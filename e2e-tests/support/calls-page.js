const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const BasePage = require('./base-page');

/**
 * Page object for calls-related content.
 *
 */
class CallsPage extends BasePage {
  isInitialized() {
    const expectedElementSelector = By.css('h3.call__outcomes__header');
    const expectedElementText = 'Enter your call result to get the next call:';

    return this.waitForElement(expectedElementSelector,
                               "Calls page isn't loaded")
      .getText()
      .then(text => {
        return text === expectedElementText;
      });
  }
}

module.exports = CallsPage;
