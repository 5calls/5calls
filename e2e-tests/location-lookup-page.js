const webdriver = require('selenium-webdriver');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const By = webdriver.By;
const until = webdriver.until;

/**
 * Page object for location-related content.
 *
 * @class LocationLookupPage
 */
class LocationLookupPage {
  constructor(driver) {
    this.driver = driver;
    // define selectors and other locators
    this.locationButtonSelector = 'button.subtle-button';
    this.locationInputSelector = '#address';
    this.locationSubmitSelector = 'p > form > button';
    this.locationErrorMessage = 'That address is invalid, please try again';
  }

  /**
   * Displays the location text box.
   *
   *
   * @memberOf LocationLookupPage
   */
  displayLocationInputBox() {
    const selector = By.css(this.locationButtonSelector);
    this.driver.wait(until.elementLocated(selector), 5000);
    const addressButton = this.driver.findElement(selector);
    addressButton.click();
  }

  /**
   * Inputs location into the input text box
   * and submits the location lookup form.
   *
   * @param {string} location the location to submit
   *
   * @memberOf LocationLookupPage
   */
  enterAndSubmitNewLocation(location) {
    const inputSelector = By.css(this.locationInputSelector);
    const submitSelector = By.css(this.locationSubmitSelector);
    this.driver.wait(until.elementLocated(inputSelector), 10000);
    this.driver.findElement(inputSelector).sendKeys(location);
    // this.driver.findElement(submitSelector).sendKeys(Key.ENTER);
    this.driver.findElement(submitSelector).click();
  }

  /**
   * Obtains the element containing the new location
   * text after it has been entered and submitted.
   *
   * @param {string} location the entered location
   * @returns the new location
   *
   * @memberOf LocationLookupPage
   */
  getNewLocationElement(location) {
    const selector = By.css(this.locationButtonSelector);
    this.driver.wait(until.elementLocated(selector), 6000);
    const addressButton = this.driver.findElement(selector);
    // make sure button contains the new location text
    this.driver.wait(until.elementTextIs(addressButton, location), 2000);
    return addressButton;
  }

  getLocationErrorMessage() {
    return this.locationErrorMessage;
  }


}

module.exports = LocationLookupPage;
