/**
 * Holds Selenium webdriverjs utilities.
 */
const fs = require('fs');
const path = require('path');

// TODO:  include other local storage keys
// and move to /static/js/util/localStorage.js.
const LocalStorageKey = {
  LOCATION: 'org.5calls.location',
  GEOLOCATION: 'org.5calls.geolocation',
  ALLOW_GEOLOCATION: 'org.5calls.allow_geolocation',
  GEOLOCATION_TIME: 'org.5calls.geolocation_time',
  GEOLOCATION_CITY: 'org.5calls.geolocation_city'
};

// TODO: Move to /static/js/util/localStorage.js.
function getLocalStorageLocationKeys() {
  return [
    LocalStorageKey.LOCATION,
    LocalStorageKey.GEOLOCATION,
    LocalStorageKey.ALLOW_GEOLOCATION,
    LocalStorageKey.GEOLOCATION_TIME,
    LocalStorageKey.GEOLOCATION_CITY
  ];
}

/**
 * Takes a screenshot and writes it to the local file system.
 *
 * @param {webdriver.WebDriver} driver an instance of Selenium web driver
 * @param {string} fileName the name of the screehshot file (default==='screenshot.png')
 * @param {string} screenshotPath the path to the screenshot file (default===process.cwd())
 */
function saveScreenshot(driver, fileName = 'screenshot.png', screenshotPath) {
  screenshotPath = screenshotPath || process.cwd();
  driver.takeScreenshot().then(function(data) {
    fs.writeFileSync(path.join(screenshotPath, fileName), data, 'base64');
  });
}

/**
 * Logs a localStorage variable to the console.
 *
 * @param {webdriver.WebDriver} driver an instance of Selenium web driver
 * @param {string} key a localStorage key
 */

/*eslint no-console:  */
function logLocalStorageData(driver, key) {
  // driver.executeScript(`return window.localStorage.getItem("${key}")`)
  getLocalStorageData(driver, key)
    .then(item => console.log(`Local Storage value for key ${key}:`, item));
}

/**
 * Gets a Promise holding the value of a localStorage item.
 *
 * @param {webdriver.WebDriver} driver an instance of Selenium web driver
 * @param {string} key a localStorage key
 * @returns a Promise which resolves to the value of the localStorage key
 */
function getLocalStorageData(driver, key) {
  return driver.executeScript(`return window.localStorage.getItem("${key}")`);
}

/**
 * Sets the value of a localStorage item.
 *
 * @param {webdriver.WebDriver} driver an instance of Selenium web driver
 * @param {string} key a localStorage key
 * @param {string} value the value of the localStorage item whose key is key
 */
function setLocalStorageData(driver, key, value) {
  driver.executeScript(`return window.localStorage.setItem("${key}", "${value}")`);
}

module.exports = {
  LocalStorage: LocalStorageKey,
  getLocalStorageLocationKeys: getLocalStorageLocationKeys,
  saveScreenshot: saveScreenshot,
  getLocalStorageData: getLocalStorageData,
  setLocalStorageData: setLocalStorageData,
  logLocalStorageData: logLocalStorageData
};

