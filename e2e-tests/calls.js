/**
 * End-to-end tests for calls page
 *
 */
const test = require('selenium-webdriver/testing');
const chai = require('chai');
const expect = chai.expect;
const CallsPage = require('./support/calls-page');
const IssuesListPage = require('./support/issuesList-page');

test.describe('calls page', function() {
  let callsPage = undefined;
  let issuesListPage = undefined;
  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    callsPage = new CallsPage(this.driver);
    issuesListPage = new IssuesListPage(this.driver);
  });

  test.it('should display call details when an issue is clicked', function() {
    // click on first issue
    issuesListPage.getFirstIssue().click();

    // check that calls page is rendered
    return expect(callsPage.isCallsPage()).to.eventually.be.true;
  });

});
