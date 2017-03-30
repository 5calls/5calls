/**
 * End-to-end tests for issues-related content,
 * which includes the issues list in the sidebar
 * and the 'more issues' page.
 *
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const IssuesListPage = require('./support/issuesList-page');

test.describe('issues list page', function() {
  let issuesListPage = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    issuesListPage = new IssuesListPage(this.driver);
  });


  test.it('should display More Issues page after clicking on "view more issues"', function() {

    // click on link to more issues page
    issuesListPage.getViewMoreIssuesLink().click();

    // check more issues page renders
    return expect(issuesListPage.isMoreIssuesPage())
      .to.eventually.be.true;
  });

});
