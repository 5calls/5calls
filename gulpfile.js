'use strict';

var gulp = require('gulp')
  , sass = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , imagemin = require('gulp-imagemin')
  , util = require('gulp-util')
  , browserify = require('browserify')
  , es2040 = require('es2040')
  , buffer = require('vinyl-buffer')
  , source = require('vinyl-source-stream')
  , uglify = require('gulp-uglify')
  , http_server = require('http-server')
  , connect_logger = require('connect-logger')
  , spawn = require('child_process').spawn
  , mocha = require('gulp-mocha')
  , path = require('path')
  ;

var SRC = {
  html:    './static/html',
  scss:    './static/scss',
  img:     './static/img',
  js:      './static/js',
  extra:   './static/rootExtra',
  locales: './static/locales'
};

var DEST = {
  html:'./app/static',
  css: './app/static/css',
  img: './app/static/img',
  js:  './app/static/js',
  locales: './app/static/locales'
};

gulp.task('html', function() {
  gulp.src(SRC.html + '/*.html')
    .pipe(gulp.dest(DEST.html));
});

gulp.task('html:watch', function() {
  gulp.watch(`${SRC.html}/*.html`, ['html']);
});

gulp.task('html:serve', function (cb) {

  function alwaysServeIndex(req, res, next) {

    // Allow the development server to respond to URLs defined in the front end application.
    // Assume that any URL without a file extension can be handled by the client side code
    // and serve index.html (instead of 404).

    if(!(path.extname(req.url))) {
      req.url = "/";
    }
    next();
  }

  var server = new http_server.HttpServer({
    root: 'app/static',
    before: [connect_logger(), alwaysServeIndex]
  });
  server.listen(8000, function () {
    util.log('HTTP server started on port 8000');
    cb();
  });
});

// Compile Sass into CSS
gulp.task('sass', function() {
  gulp.src(`${SRC.scss}/*.scss`)
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(DEST.css));
});

gulp.task('sass:watch', function() {
  gulp.watch(`${SRC.scss}/**/*.scss`, ['sass']);
});

// Copy/minify image assets
gulp.task('copy-images', function() {
  gulp.src(SRC.img + '/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest(DEST.img));
});

gulp.task('copy-images:watch', function() {
  gulp.watch(SRC.img + '/**/*.+(png|jpg|jpeg|gif|svg)');
});

// Bundle and transpile javascript
gulp.task('scripts', function() {
  var b = browserify({
    entries: `${SRC.js}/main.js`,
    debug: true,
    transform: [[es2040, {global: true}]]
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest(DEST.js));
});

gulp.task('build-scripts', function() {
  var b = browserify({
    entries: `${SRC.js}/main.js`,
    debug: false,
    transform: [[es2040, {global: true}]]
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(DEST.js));
});

gulp.task('scripts:watch', function() {
  gulp.watch(`${SRC.js}/**/*.js`, ['scripts']);
});

gulp.task('extra', function() {
  gulp.src(SRC.extra + '/*.+(ico|xml|json)')
    .pipe(gulp.dest(DEST.html));
});

gulp.task('locales', function() {
  gulp.src(SRC.locales + '/*.json')
    .pipe(gulp.dest(DEST.locales));
});

function runKarmaTests ({singleRun, configFile} = {}) {
  return new Promise((resolve, reject) => {
    const karmaArguments = ['start'];

    if (configFile) {
      karmaArguments.push(configFile);
    }

    if (singleRun) {
      karmaArguments.push('--single-run');
    }

    // Karma has a nice public API, but has issues where it can hang when
    // trying to shut down after completing tests, so run it as a separate
    // process instead. See:
    // https://github.com/karma-runner/karma/issues/1693
    // https://github.com/karma-runner/karma/issues/1035
    
    const karma = spawn(path.join(__dirname, 'node_modules', '.bin', 'karma'), karmaArguments, {
      shell: true,
      cwd: __dirname,
      stdio: 'inherit'
    });

    karma.on('close', code => {
      if (code) {
        reject(new util.PluginError('Karma', `JS unit tests failed (code ${code})`));
        return;
      }
      resolve();
    });
  });
}

gulp.task('test:js-unit', function() {
  return runKarmaTests({singleRun: true});
});

gulp.task('test:watch', function() {
  return runKarmaTests({singleRun: false});
});

/**
 * Task that runs selenium webdriverjs end-to-end tests.
 *
 * Individual e2e tests can be run using the --grep argument
 * with a substring of the name of the test's describe block.
 * Example:
 * gulp test:e2e --grep 'from issue page'
 */
gulp.task('test:e2e', function() {
  const mochaOptions = {
    reporter: 'spec',
    timeout: 6000
  };

  if (process.argv.includes('--grep')) {
    const grepValue = process.argv[process.argv.indexOf('--grep') + 1];
    mochaOptions.grep = new RegExp(grepValue);
  }

  return gulp.src([
    './e2e-tests/support/setupEndToEndTests.js',
    './e2e-tests/{*,!(support)/*}.js'
  ])
    .pipe(mocha(mochaOptions));
});

// Designed for running tests in continuous integration. The main difference
// here is that browser tests are run across a gamut of browsers/platforms via
// Sauce Labs instead of just a few locally.
gulp.task('test:ci', ['eslint'], function() {
  return runKarmaTests({configFile: 'karma.ci.conf.js'});
});

gulp.task('eslint', function() {
  const eslint = require('eslint');
  const linter = new eslint.CLIEngine();
  const report = linter.executeOnFiles(['./']);

  // customize messages to be a little more helpful/friendly
  report.results.forEach(result => {
    result.messages.forEach(message => {
      if (message.ruleId === 'no-console') {
        message.message = 'Please use the `loglevel` module for logging instead of the browser `console` object';
      }
    });
  });

  process.stdout.write(linter.getFormatter()(report.results));
  if (report.errorCount) {
    throw new util.PluginError('ESLint', 'Found problems with JS coding style.');
  }
});

gulp.task('test', ['eslint', 'test:js-unit']);

gulp.task('default', ['html', 'html:watch', 'html:serve', 'sass', 'sass:watch', 'copy-images', 'copy-images:watch', 'scripts', 'scripts:watch', 'extra', 'locales']);
gulp.task('deploy', ['html', 'sass', 'build-scripts', 'extra', 'copy-images', 'locales']);
