# 5calls

This is where development for [5calls.org](http://5calls.org) happens. Please check the issue list and pull requests before starting work so we can ensure you're not duplicating work! We're all volunteers and want to treat the time you dedicate to the site with respect. Ping  [@make5calls](https://twitter.com/make5calls) on twitter with an email to get an invite to our Slack.

Currently this repo contains both frontend and backend development pieces.

## Running the app for local development

* Site front end, written in Javascript, using [Choo](https://choo.io/)
* Application server back end, for data processing, written in Go

To make display changes, you likely won't need to handle the application
server, and can instead rely on the production version of 5calls, running at
5calls.org -- more on this below.

## Development

5calls requires [Node.js][nodejs] and [Go][golang] version 1.7+. If you are on a
Mac you'll need to install XCode and the CLI tools as well.

[nodejs]: https://nodejs.org/en/
[golang]: https://golang.org/

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

### Application Server

If you'd like to help us work on the backend code as well (written in Go), please reach out to join our Slack!

## Testing

#### JavaScript Unit Tests

JavaScript unit tests are written using ```Mocha``` and ```Chai``` and run in the ```Karma``` test runner. You must have the Google Chrome browser installed to run them.

Run the unit tests with:

```npm test```

If you are working on JavaScript code, you can make the tests automatically re-run whenever you change a relevant file with:

```npm run test:watch```

#### End-to-end Integration Tests

End-to-end (e2e) integration testing is done using ```Selenium``` with ```Mocha``` and ```Chai```.

To run the e2e tests:
1. Start the front end application in a command window with the ```npm start``` command.
2. In a second command window run the tests using the command ```npm run test:e2e```.

## Deployment

Use the makefile in the go project's folder. You can `make deploy` to update the go server or `make deploy_static` to update the site.

When updating the go server, remember to log in, connect to the screen instance (`screen -r`) and stop the go process before replacing it via the deploy, otherwise you get "text file busy" errors in scp.

## Contributors
 - [Nick O'Neill](https://github.com/nickoneill)
 - [Matt Jacobs](https://github.com/capndesign)
 - [Liam Campbell](https://github.com/liamdanger)
 - [James Home](https://github.com/jameshome)
 - [Beau Smith](https://github.com/beausmith)
 - [Anthony Johnson](https://github.com/agjohnson)
 - [Craig Doremus](https://github.com/cdoremus)
 - [All contributors](https://github.com/5calls/5calls/graphs/contributors)

## Other client projects
 - [Android](https://github.com/5calls/android)
 - [iOS](https://github.com/5calls/ios)
