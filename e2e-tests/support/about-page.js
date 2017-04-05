const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const BasePage = require('./base-page');

/**
 * Page object encapsulating about page-related behaviors.
 *
 */
class AboutPage extends BasePage {
  isInitialized() {
    const aboutPageTitleSelector = By.css('h2.about__title');
    const aboutPageTitleText = 'ABOUT 5 CALLS';

    return this.waitForElement(aboutPageTitleSelector,
                               "About page isn't loaded")
      .getText()
      .then(text => {
        return text === aboutPageTitleText;
      });
  }

  getContactLink() {
    return this.driver.findElement(By.partialLinkText("reach out"));
  }
}

module.exports = AboutPage;
