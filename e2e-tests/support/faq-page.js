const webdriver = require('selenium-webdriver');
const By = webdriver.By;

/**
 * Page object encapsulating FAQ page-related behaviors.
 *
 */
class FaqPage {
  isInitialized() {
    const pageTitleSelector = By.css('header.page-header > h1');
    const pageTitleText = "FAQ";

    return this.waitForElement(pageTitleSelector,
                               "FAQ page hasn't loaded")
      .getText()
      .then(text => {
        return text === pageTitleText;
      });
  }

}

module.exports = FaqPage;
