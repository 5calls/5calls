/**
 * End-to-end tests for home page
 *
 */
const test = require('selenium-webdriver/testing');

const HomePage = require('./support/home-page');
const IssuesListPage = require('./support/issuesList-page');
const InactiveIssuesPage = require('./support/inactiveIssues-page');
const CallsPage = require('./support/calls-page');

test.describe('Should be able to navigate', function() {
  let page = undefined;
  let goBackTo = undefined;
  const makeHomePage = (driver) => {return new HomePage(driver);};

  test.before(function() {
    goBackTo = function(makeExpectedPage) {
      this.driver.navigate().back();
      // assert we end up on expected page.
      page = makeExpectedPage(this.driver);
    }.bind(this);
  });

  test.beforeEach(function() {
    this.driver.get(this.baseUrl);
    page = new HomePage(this.driver);
  });

  test.describe('from home page', function() {
    test.afterEach(function() {
      // ensure we can always get back to the home page,
      // with one navigation action.
      goBackTo(makeHomePage);
    });
    test.it('to about page, via "why calling works" link', function() {
      page.followWhyCallingWorksLink();
    });

    test.it('to an active issue page', function() {
      page = new IssuesListPage(this.driver);
      page.followFirstIssue();
    });

    test.it('to inactive issues page', function() {
      page = new IssuesListPage(this.driver);
      page.followViewInactiveIssuesLink();
    });

    test.describe("via footer links", function() {
      test.it('to about page', function() {
        page.followAboutPageLink();
      });

      test.it('to FAQ page', function() {
        page.followFaqLink();
      });

      test.it('to Github page');
      test.it('to Twitter page');
      test.it('to Privacy page');
    });
  });

  test.describe("from issue page", function() {
    test.it("to home page");
    test.it("to another issue page");
    test.it("to inactive issues page");
  });
  test.describe("from inactive issues page", function() {
    test.it("to home page");
    test.it("to an issue page");
  });

  test.it("home page -> issue -> more issues -> issue, and then back " +"through history to home page", function() {
    // Navigate to first active issue.
    page = new IssuesListPage(this.driver);

    page.followFirstIssue();

    // refresh is needed to clear all auto-scrolling, before trying to click on
    // an element in the page, because ChromeDriver doesn't synchronously
    // determine element locations, and doesn't support element clicking.
    // See:
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=28 and
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=22
    // TODO: Consider just scrolling back to top of page instead...
    this.driver.navigate().refresh();

    // Navigate to inactive issues page.
    page = new IssuesListPage(this.driver);
    page = page.followViewInactiveIssuesLink();

    this.driver.navigate().refresh();

    // Navigate to first inactive issue.
    page.followFirstIssue();

    // Now go back to inactive issues page
    goBackTo(driver => {return new InactiveIssuesPage(driver);});

    // Now go back to first active issue page.
    goBackTo(driver => {return new CallsPage(driver);});

    // Finally, go back to home page.
    goBackTo(makeHomePage);
  });
});
