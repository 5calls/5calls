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

### Application Server

If you need to make any changes to the back end code, you'll need to set up
your environment for Go development -- see [How to Write Go
Code](https://golang.org/doc/code.html) for more information on this.

With your environment set up, you should first start by installing
dependencies. In the `go/` path, this will install these dependencies for you:

`make deps`

To build the application code to a binary file:

`make`

To build and run the application code:

`make run`

Or to connect to an alternative Airtable database, such as the development
database:

`make run AIRTABLE_DATABASE=appZ8ITCpRa5YCCN7`

The following environment variables can be set on the application, both with
`make run` and by calling the binary directly:

* **AIRTABLE_API_KEY** *(required)* Airtable API key
* **CIVIC_API_KEY** *(required)* Google Civic Information API key

You will need to manually create an [Airtable][airtable] API key, a [Google
Civic Information API][civic-api] API key, and access to the development
Airtable database.

##### Set Up [Airtable][airtable]

* Make an account on [Airtable][airtable]
* Go to the [Account](https://airtable.com/account) page and generate an API key.
* [Request an invitation][airtable-invite] to the dev Airtable database for this
  project

##### Get a Google Civic API Key

Follow the instructions [here][civic-api] to get an API key for the Google Civic Information API.

##### Point to Local Back End

Edit the `appUrl` variable in `static/js/main.js` to be `http://localhost:8090` to point the front end at your local back end.

[airtable]: https://airtable.com
[airtable-invite]: https://airtable.com/invite/l?inviteId=invo1EhjdkkkdjcxX&inviteToken=94e26833a508997c003b8908eebe4bb1
[civic-api]: https://developers.google.com/civic-information/docs/using_api

## Deployment

Use the makefile in the go folder. You can `make deploy` to update the go server or `make deploy_static` to update the site.

When updating the go server, remember to log in, connect to the screen instance (`screen -r`) and stop the go process before replacing it via the deploy, otherwise you get "text file busy" errors in scp.

## Contributors
 - [Nick O'Neill](https://github.com/nickoneill)
 - [Matt Jacobs](https://github.com/capndesign)
 - [Liam Campbell](https://github.com/liamdanger)
 - [Josh Bleecher Snyder](https://github.com/josharian)
 - [James Home](https://github.com/jameshome)
 - [Beau Smith](https://github.com/beausmith)
 - [Anthony Johnson](https://github.com/agjohnson)
 - [All contriubtors](https://github.com/5calls/5calls/graphs/contributors)
 
## Other client projects
 - [Android](https://github.com/5calls/android)
 - [iOS](https://github.com/5calls/ios)
