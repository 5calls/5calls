# 5calls

This is where development for [5calls.org](http://5calls.org) happens. Please check the issue list and pull requests before starting work so we can ensure you're not duplicating work! We're all volunteers and want to treat the time you dedicate to the site with respect. Ping  [@make5calls](https://twitter.com/make5calls) on twitter with an email to get an invite to our Slack.

Currently this repo contains both frontend and backend development pieces.

## Running the app for local development

* Site front end, written in Javascript, using Choo
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

Gulp is used to compile front end static assets. If you do not have Gulp
installed globally, you can install this with:

`npm install -g gulp`

Gulp is configured, by default, to watch and recompile front end files when
any changes are detected. You can run Gulp in this mode with:

`gulp`

This default command will also spin up an HTTP server for serving the site
files on port `tcp/8000`.

The other main Gulp task is the `deploy` task, which does not watch for
changes, and applies additional transforms on the assets -- such as an uglify
transform on Javascript sources.

To turn on/off debug mode, which adds some reset buttons throughout the interface, run the following in your console:

```
localStorage['org.5calls.debug'] = 'true' // turn on debug mode
localStorage['org.5calls.debug'] = 'false' // turn off debug mode
```

### Application Server

If you'd like to help us work on the backend code as well (written in Go), please reach out to join our Slack!

## Unit tests

#### JavaScript 

JavaScript unit tests are written using ```Mocha``` and ```Chai``` and run in the ```Karma``` test runner. You must have the Google Chrome browser installed to run them.

Run the unit tests with:

```npm test```

If you are working on JavaScript code, you can make the tests automatically re-run whenever you change a relevant file with:

```npm run test:watch```

## Deployment

Use the makefile in the go folder. You can `make deploy` to update the go server or `make deploy_static` to update the site.

When updating the go server, remember to log in, connect to the screen instance (`screen -r`) and stop the go process before replacing it via the deploy, otherwise you get "text file busy" errors in scp.

## Contributors
 - [Nick O'Neill](https://github.com/nickoneill)
 - [Matt Jacobs](https://github.com/capndesign)
 - [Liam Campbell](https://github.com/liamdanger)
 - [James Home](https://github.com/jameshome)
 - [Beau Smith](https://github.com/beausmith)
 - [Anthony Johnson](https://github.com/agjohnson)
 - [All contriubtors](https://github.com/5calls/5calls/graphs/contributors)

## Other client projects
 - [Android](https://github.com/5calls/android)
 - [iOS](https://github.com/5calls/ios)
