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

For the guide to contributing to this repository, please see [CONTRIBUTING.md](./CONTRIBUTING.md) file.

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
