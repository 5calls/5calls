const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const config = require('./e2e-tests.config');

/**
 * Page object for location-related content.
 *
 */
class LocationPage {
  constructor(driver) {
    this.driver = driver;
    // define selectors and other locators
    this.locationButtonSelector = 'button.subtle-button';
    this.locationInputSelector = '#address';
    this.locationSubmitSelector = 'p > form > button';
    this.locationErrorMessage = 'That address is invalid, please try again';
  }

  /**
   * Displays the location text box after clicking
   * on the location button.
   *
   */
  displayLocationInputBox() {
    const selector = By.css(this.locationButtonSelector);
    this.driver.wait(until.elementLocated(selector),
      config.defaultTimeout, 'Location button not found');
    const addressButton = this.driver.findElement(selector);
    addressButton.click();
  }

  /**
   * Inputs location into the input text box
   * and submits the location lookup form.
   *
   * @param {string} location the location to submit
   *
   */
  enterAndSubmitNewLocation(location) {
    const inputSelector = By.css(this.locationInputSelector);
    const submitSelector = By.css(this.locationSubmitSelector);
    this.driver.wait(until.elementLocated(inputSelector),
      config.defaultTimeout * 2, 'Location input text box not found');
    this.driver.findElement(inputSelector).sendKeys(location);
    this.driver.findElement(submitSelector).click();
  }

  /**
   * Obtains the element containing the new location
   * text after it has been entered and submitted.
   *
   * @param {string} location the entered location
   * @returns {WebElementPromise} resolves to the new location element
   *
   */
  getNewLocationElement(location) {
    const selector = By.css(this.locationButtonSelector);
    this.driver.wait(until.elementLocated(selector),
      config.defaultTimeout, 'Button with new location text not found');
    const addressButton = this.driver.findElement(selector);
    // make sure button contains the new location text
    this.driver.wait(until.elementTextIs(addressButton, location),
      config.defaultTimeout, 'New location button text not found');
    return addressButton;
  }

  /**
   * Accessor for the error message used if an
   * unknown address was submitted.
   *
   * @returns {string} the location error message.
   *
   * @memberOf LocationPage
   */
  getLocationErrorMessage() {
    return this.locationErrorMessage;
  }


}

module.exports = LocationPage;
