/**
 * Holds end-to-end test configuration code.
 */

const defaultBaseUrl = 'http://localhost:8000/';
const defaultTimeout = 3000;

/**
 * Gets the base Url to run the tests,
 * which can be set as the BASE_URL environmental
 * variable or to use the defaultBaseUrl.
 *
 * @returns the base Url to run the Selenium web webdriverjs
 * tests.
 */
function getBaseUrl() {
  return process.env.BASE_URL || defaultBaseUrl;
}

module.exports = {
  getBaseUrl: getBaseUrl,
  defaultTimeout: defaultTimeout
};