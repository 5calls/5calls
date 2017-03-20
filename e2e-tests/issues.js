/**
 * End-to-end tests for issues page
 *
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const config = require('./support/e2e-tests.config.js');
const IssuesPage = require('./issues-page');
const url = config.getBaseUrl();

test.describe('issues page', function() {
  let page = undefined;
  test.beforeEach(function() {
    this.driver.get(url);
    page = new IssuesPage(this.driver);
  });

  test.afterEach(function() {
    page = undefined;
  });

  test.it('should display issue details when an issue is clicked', function() {
    const expected = page.getIssueDetailsPageText();

    // click on first issue
    page.getFirstIssue().click();

    // check that page text is rendered
    return expect(page.getIssueDetailsPageElement().getText())
      .to.eventually.equal(expected);
  });

  test.it('should display More Issues page after clicking on "view more issues"', function() {
    const expected = page.getMoreIssuesPageText();

    // click on link to more issues page
    page.getViewMoreIssuesLink().click();

    // check that text on more issues page renders
    return expect(page.getMoreIssuesPageTextElement().getText())
      .to.eventually.equal(expected);
  });

});
