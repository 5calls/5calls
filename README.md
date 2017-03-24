# 5calls

This is where development of the [5calls.org](http://5calls.org) frontend happens. Please check the issue list, pull requests and contributor guidelines before starting work so we can ensure you're not duplicating work! We're all volunteers and want to treat the time you dedicate to the site with respect. Ping  [@make5calls](https://twitter.com/make5calls) on Twitter with your email to get an invite to our Slack.

# Table of Contents
* [Development](#Development)
    * [Front End](#Front_End)
    * [Application Server](#Application_Server)
    * [Quality Assurance](#QA)
        * [JavaScript Unit Tests](#JavaScript_Unit_Tests)
        * [End-to-end Integration Tests](#End-to-end_Integration_Tests)
        * [JavaScript Linting](#ESLint)
* [Contributor Guidelines](#Contributor_Guidelines)
* [Contributors](#Contributors)
* [Other Client Projects](#Other_Client_Projects)

<a id="Development"></a>
## Development

To make display changes, you likely won't need to handle the application
server, and can instead rely on the production version of 5calls, running at [5calls.org](https://5calls.org) -- more on this below.

The front end is written in Javascript using the [Choo](https://choo.io/) framework. The application server back end -- for data processing -- is written in [Go](https://golang.org/).

5calls requires [Node.js][nodejs] and [Go][golang] version 1.7+. If you are on a Mac you'll need to install XCode and the CLI tools as well.

[nodejs]: https://nodejs.org/en/
[golang]: https://golang.org/

<a id="Front_End"></a>
### Front End

Front end requirements must first be installed with:

`npm install`

To start developing:

`npm start`

This command will:

* compile front end static assets
* spin up an HTTP server for serving the site files on port `tcp/8000`.
* watch and recompile front end files when any changes are detected

To package assets for deployment:

`npm run deploy`

This command also builds the assets, applies additional transforms on the assets (such as minification of the JavaScript sources), but does not watch for changes.

To turn on/off debug mode, which adds some reset buttons throughout the interface, run the following in your console:

```
localStorage['org.5calls.debug'] = 'true' // turn on debug mode
localStorage['org.5calls.debug'] = 'false' // turn off debug mode
```

<a id="Application_Server"></a>
### Application Server

If you'd like to help us work on the backend code as well (written in Go), please reach out to join our Slack!

<a id="QA"></a>
## Quality Assurance

<a id="JavaScript_Unit_Tests"></a>
#### JavaScript Unit Tests

JavaScript unit tests are written using ```Mocha``` and ```Chai``` and run in the ```Karma``` test runner. You must have the Google Chrome browser installed to run them.

Run the unit tests with:

```npm test```

If you are working on JavaScript code, you can make the tests automatically re-run whenever you change a relevant file with:

```npm run test:watch```

<a id="End-to-end_Integration_Tests"></a>
#### End-to-end Integration Tests

End-to-end (e2e) integration testing is done using ```Selenium``` with ```Mocha``` and ```Chai``` using the [```WebdriverJS```](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/) API.

To run the e2e tests:
1. Start the front end application in a command window with the ```npm start``` command.
2. In a second command window run the tests using the command ```npm run test:e2e```.

<a id="ESLint"></a>
#### JavaScript Linting

Linting of the 5 Calls JavaScript code is done using [ESLint](http://eslint.org/) with rules defined in ```.eslintrc.json```. The following command runs ESLint: ```gulp eslint```

<a id="Contributor_Guidelines"></a>
## Contributor Guidelines

Contributions to the 5 Calls frontend repository (5calls/5calls) are always welcome, but to make sure changes are properly discussed and prioritized, and that there is no duplication of work, the following steps should be followed:
1. An Issue should be created to discuss a proposed change before it is implemented. If the change is an emergency bug fix, the Issue creation and discussion steps can be skipped, but note that in the PR submission comment. Make sure the PR branch is rebased if it becomes out-of-date with the 5 Calls repo's master branch.
2. A Pull Request (PR) can be submitted if there is no Issue discussion after a few days or when the Issue discussion arrives at a consensus.
3. A unit or end-to-end test (or tests) should be included with the Pull Request covering the changes. If tests are not possible, an explanation should be included with the PR.
4. Our continuous integration system will run ESLint, and all unit and end-to-end tests when a PR is submitted. Fixing any failing tests or ESLint rule violations is the responsibility of the person submitting the PR.
5. A 5 Calls team member needs to review and approve the PR before it can be merged into the master branch. The reviewer should clone the PR branch locally and make sure that the code can build and has no eslint or unit/e2e test failures before approving the PR. It is the responsibility of the PR submitter to make changes suggested by the reviewer or to explain why the proposed changes are not necessary or should be modified.
6. Merging of the PR into the master branch after approval can be done by the PR reviewer or any other 5 Calls team member including the submitter if he/she is a team member.

<a id="Contributors"></a>
## Contributors
 - [Nick O'Neill](https://github.com/nickoneill)
 - [Matt Jacobs](https://github.com/capndesign)
 - [Liam Campbell](https://github.com/liamdanger)
 - [James Home](https://github.com/jameshome)
 - [Beau Smith](https://github.com/beausmith)
 - [Anthony Johnson](https://github.com/agjohnson)
 - [Craig Doremus](https://github.com/cdoremus)
 - [All contributors](https://github.com/5calls/5calls/graphs/contributors)

 <a id="Other_Client_Projects"></a>
## Other Client Projects
 - [Android](https://github.com/5calls/android)
 - [iOS](https://github.com/5calls/ios)
