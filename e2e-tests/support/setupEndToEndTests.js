/**
 * Included into each e2e test via the mocha require
 * option (see test:e2e task in gulpfile.js).
 *
 */
const webdriver = require('selenium-webdriver');
const test = require('selenium-webdriver/testing');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

test.before(function() {
  this.driver = new webdriver.Builder()
    .withCapabilities({
      'browserName': 'chrome',
      'timeout': '20000',
      'chromeOptions': {
        prefs: {
          'profile.managed_default_content_settings.notifications': 2
        }
      }
    })
    .build();
});

test.after(function() {
  if (this.driver) {
    this.driver.quit();
  }
});
