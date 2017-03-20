/**
 *
 */
const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');

const url = config.getBaseUrl();
const By = webdriver.By;
const until = webdriver.until;
const Key = webdriver.Key;
const util = require('./support/webdriverjs-util');
const LocalStorage = util.LocalStorageKey;

test.describe('location lookup', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(url);
    page = new LookupLocationPage(this.driver);
    // printLocalStorageLocationData(this.driver);
    // clearLocalStorageLocationData(this.driver);
  });

  test.afterEach(function() {
    page = undefined;
  });

  test.it('Should lookup location', function() {
    const zip = '12222';

    // give the IP lookup a chance to complete;
    //  otherwise it interferes with the location lookup
    this.driver.sleep(2000);

    // click on location to display location input box
    page.displayLocationInputBox();

    // enter zip in address text box and submit
    page.enterNewLocation(zip);

    //check for zip code link
    const newButtonText = page.getNewLocationButtonText(zip);
    return expect(newButtonText).to.eventually.equal(zip);
  });

});

function clearLocalStorageLocationData(driver) {
  const locationKeys = util.getLocalStorageLocationKeys();
  promises = '';
  locationKeys.forEach(key => {
    promises += `window.localStorage.removeItem("${key}"),`;
  });
  driver.executeScript(`return Promise.all([${promises}])`)
}

function printLocalStorageLocationData(driver) {
  util.logLocalStorageData(driver, LocalStorage.LOCATION);
  util.logLocalStorageData(driver, LocalStorage.GEOLOCATION);
  util.logLocalStorageData(driver, LocalStorage.GEOLOCATION_CITY);
}

class LookupLocationPage {
  constructor(driver) {
    this.driver = driver;
    // define selectors
    this.locationButtonSelector = 'button.subtle-button';
    this.locationInputSelector = '#address';
    this.locationSubmitSelector = 'p > form > button';
  }

  displayLocationInputBox() {
    const selector = By.css(this.locationButtonSelector);
    this.driver.wait(until.elementLocated(selector), 5000);
    const addressButton = this.driver.findElement(selector);
    addressButton.click();
  }

  enterNewLocation(location) {
    const inputSelector = By.css(this.locationInputSelector);
    const submitSelector = By.css(this.locationSubmitSelector);
    this.driver.wait(until.elementLocated(inputSelector), 10000);
    this.driver.findElement(inputSelector).sendKeys(location);
    // this.driver.findElement(submitSelector).sendKeys(Key.ENTER);
    this.driver.findElement(submitSelector).click();
  }

  getNewLocationButtonText(location) {
    const selector = By.css(this.locationButtonSelector);
    this.driver.wait(until.elementLocated(selector), 6000);
    const addressButton = this.driver.findElement(selector);
    this.driver.wait(until.elementTextIs(addressButton, location), 2000);
    return addressButton.getText();
  }
}