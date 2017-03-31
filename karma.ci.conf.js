/**
 * Karma configuration for running tests in Sauce Labs when on CI.
 * To use, ensure the following environment vars are set:
 * SAUCE_USERNAME: Your username on Sauce Labs
 * SAUCE_ACCESS_KEY: A generated access key for your Sauce Labs account
 *                   Go to the "My Account" panel in Sauce and scroll down
 *                   "Access Key". Click the "show" button to see your key.
 */

module.exports = function (configuration) {
  // Configure browsers to test in on Sauce Labs. For values, use the
  // Platform Configurator:
  // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator
  const browserConfiguration = {
    // Just the latest versions for evergreen browsers
    sauce_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: 'latest'
    },
    sauce_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: 'latest'
    },

    // Edge is evergreen-ish
    sauce_edge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: 'latest'
    },

    // Cover the latest two versions of IE on Windows 7 and 10
    sauce_ie: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: 'latest'
    },
    sauce_ie_11_windows_7: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '11.0'
    },
    sauce_ie_10_windows_7: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10.0'
    },

    // Latest two Safaris
    sauce_safari: {
      base: 'SauceLabs',
      browserName: 'Safari',
      version: 'latest'
    },
    sauce_safari_9: {
      base: 'SauceLabs',
      browserName: 'Safari',
      platform: 'OS X 10.11',
      version: '9.0'
    },

    // Disable device simulators for now as they are slow and flakey :\
    // sauce_ios_safari: {
    //   base: 'SauceLabs',
    //   deviceName: 'iPhone 7 Simulator',
    //   deviceOrientation: 'portrait',
    //   platformVersion: '10.0',
    //   platformName: 'iOS',
    //   browserName: 'Safari'
    // },
    // sauce_android: {
    //   base: 'SauceLabs',
    //   deviceName: 'Android Emulator',
    //   deviceOrientation: 'portrait',
    //   platformVersion: '5.1',
    //   platformName: 'Android',
    //   browserName: 'Browser'
    // },
    // sauce_android_4: {
    //   base: 'SauceLabs',
    //   deviceName: 'Android Emulator',
    //   deviceOrientation: 'portrait',
    //   platformVersion: '4.4',
    //   platformName: 'Android',
    //   browserName: 'Browser'
    // }
  };

  const browsers = Object.keys(browserConfiguration);

  // start with basic karma config
  require('./karma.conf.js')(configuration);

  // and override for CI/Sauce-specific settings
  configuration.set({
    sauceLabs: {
      testName: '5calls Tests'
    },
    customLaunchers: browserConfiguration,
    browsers,
    frameworks: ['mocha', 'browserify'],
    reporters: ['mocha', 'saucelabs'],
    singleRun: true,

    // don't apply code coverage transformation, it breaks things on sauce
    // for edge and safari browsers. See:
    // https://github.com/karma-runner/karma-sauce-launcher/issues/95#issuecomment-255020888
    // https://github.com/istanbuljs/babel-plugin-istanbul/issues/81
    browserify: {
      debug: true,
      transform: ['es2040']
    },


    // Since tests are remote, give a little extra time
    captureTimeout: 300000,
    browserNoActivityTimeout: 30000
  });
};
