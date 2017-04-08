const webdriver = require('selenium-webdriver');
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Base page object extended by all other page
 * objects.
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;

    this.ensureInitialized();
  }

  ensureInitialized() {
    this.driver.wait(this.isInitialized(), config.defaultTimeout,
                     "Page-Object page never loaded");
  }

  /*
  * Each subclass needs to implement this method to ensure proper
  * functioning of the page object. The isInitialized() implementation
  * should contain logic to determine that the page/container
  * under test is fully loaded and initialized. Typically, this is
  * done by looking for one or more elements to be present on the page
  * containing some expected text. Every page object extending this base
  * class needs to implement this method
  *
  * @returns {Promise<boolean>} A Promise which will resolve to true
  * once page is loaded and initialized.
  */
  isInitialized() {
    throw new TypeError("Subclasses of BasePageObject need to implement isInitialized method!");
  }

  /**
   * Helper method to wait for an element to be on the page and then return it.
   *
   * When using the plain driver.wait, I was seeing 'stale element' exceptions
   * after page refreshes. I suspect this is due certain DOM elements locatable
   * using the same selector on both the basic index.html returned from the
   * server and in the updated DOM after Choo upgrades the page. In which case,
   * it's a race between Choo upgrading the page and the driver.wait call.
   *
   * Experimentally, grabbing the element explicitly a second time, after the
   * driver.wait call returns solved all of my problems. However, given the
   * above analysis, this doesn't seem like it would remove the race, just make
   * it more likely to resolve to the upgraded DOM elements. If we run into such
   * issues again, a more comprehensive fix may be required.
   *
   * Also, see
   * https://watirmelon.blog/2016/08/02/adding-your-own-webdriverjs-helper-methods/
   * for indirect discussion of another way of addressing the 'stale element'
   * exceptions in SPA like ours.
   */
  waitForElement(selector, opt_message=undefined, wait=config.defaultTimeout) {
    const driver = this.driver;
    return new webdriver.WebElementPromise(
      driver,
      driver.wait(until.elementLocated(selector),
                  wait, opt_message)
        .then(() => {return driver.findElement(selector);}));
  }
}

module.exports = BasePage;
